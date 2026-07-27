import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  readonly status = signal<'idle' | 'submitting' | 'success' | 'error'>('idle');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.status.set('submitting');
    // TODO(turnstile): workers/contact expects { name, email, message, turnstileToken } and
    // rejects requests missing turnstileToken. This form doesn't collect one yet — the
    // Turnstile widget below is still a placeholder pending a real site key. Submits will
    // 400 against the real Worker until both are wired up together.
    this.http.post('/api/contact', this.form.getRawValue()).subscribe({
      next: () => this.status.set('success'),
      error: () => this.status.set('error'),
    });
  }
}
