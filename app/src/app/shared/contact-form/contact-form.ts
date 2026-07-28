import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

// Public site key — safe to commit, pairs with the secret key held server-side in the Worker.
const TURNSTILE_SITE_KEY = '0x4AAAAAAD_v0Z8ywo7nHxBr';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  private readonly turnstileContainer = viewChild<ElementRef<HTMLDivElement>>('turnstileContainer');
  private widgetId: string | undefined;

  readonly status = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  readonly turnstileToken = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  constructor() {
    // afterNextRender only fires in the browser — never during SSR/prerendering — so it's
    // the safe place to touch `window` and the DOM for the Turnstile widget.
    afterNextRender(() => this.renderTurnstile());
  }

  ngOnDestroy(): void {
    if (this.widgetId && typeof window !== 'undefined' && window.turnstile) {
      window.turnstile.remove(this.widgetId);
    }
  }

  private renderTurnstile(): void {
    const container = this.turnstileContainer()?.nativeElement;
    if (!container) {
      return;
    }

    const maxAttempts = 50; // ~5s at 100ms intervals, then give up rather than poll forever
    let attempts = 0;
    const attemptRender = () => {
      if (!window.turnstile) {
        if (++attempts >= maxAttempts) {
          console.error('Turnstile script failed to load; contact form cannot be submitted.');
          return;
        }
        setTimeout(attemptRender, 100);
        return;
      }
      this.widgetId = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => this.turnstileToken.set(token),
        'expired-callback': () => this.turnstileToken.set(null),
        'error-callback': () => this.turnstileToken.set(null),
      });
    };
    attemptRender();
  }

  submit(): void {
    const token = this.turnstileToken();
    if (this.form.invalid || !token) {
      return;
    }
    this.status.set('submitting');
    this.http.post('/api/contact', { ...this.form.getRawValue(), turnstileToken: token }).subscribe({
      next: () => {
        this.status.set('success');
        this.resetTurnstile();
      },
      error: () => {
        this.status.set('error');
        this.resetTurnstile();
      },
    });
  }

  // Turnstile tokens are single-use and short-lived — every submit attempt (success or
  // failure) needs a fresh one before the form can be submitted again.
  private resetTurnstile(): void {
    this.turnstileToken.set(null);
    if (this.widgetId && window.turnstile) {
      window.turnstile.reset(this.widgetId);
    }
  }
}
