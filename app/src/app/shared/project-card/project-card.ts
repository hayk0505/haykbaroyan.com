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
  badgeLabel = input.required<string>();
  heading = input.required<string>();
  description = input.required<string>();
  tags = input.required<string[]>();
  linkHref = input<string>('');
  routerLink = input<string>('');
  external = input<boolean>(false);
  imageSide = input<'left' | 'right'>('left');
  variant = input<'dark' | 'light'>('dark');
  screenshotCaption = input<string>('');
  imageSrc = input<string>('');

  /** False when the configured destination is empty or a bare '#' placeholder — renders a non-clickable card instead of a dead link. */
  hasDestination = computed(() =>
    this.external() ? !!this.linkHref() && this.linkHref() !== '#' : !!this.routerLink(),
  );
}
