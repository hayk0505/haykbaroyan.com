import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagChip } from '../tag-chip/tag-chip';

@Component({
  selector: 'app-project-card',
  imports: [NgTemplateOutlet, RouterLink, TagChip],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCard {
  index = input.required<number>();
  statusLabel = input.required<string>();
  heading = input.required<string>();
  description = input.required<string>();
  tags = input.required<string[]>();
  linkHref = input<string>('');
  routerLink = input<string>('');
  external = input<boolean>(false);
  imageSide = input<'left' | 'right'>('left');
  variant = input<'dark' | 'light'>('dark');
  previewUrl = input.required<string>();
  ctaLabel = input.required<string>();
  screenshotCaption = input<string>('');
  imageSrc = input<string>('');

  /** False when the configured destination is empty or a bare '#' placeholder — renders a non-clickable card instead of a dead link. */
  hasDestination = computed(() =>
    this.external() ? !!this.linkHref() && this.linkHref() !== '#' : !!this.routerLink(),
  );

  /** Zero-padded display index, e.g. 1 -> '01', 12 -> '12'. */
  displayIndex = computed(() => this.index().toString().padStart(2, '0'));
}
