import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagChip } from '../tag-chip/tag-chip';

@Component({
  selector: 'app-action-card',
  imports: [RouterLink, TagChip],
  templateUrl: './action-card.html',
  styleUrl: './action-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCard {
  label = input.required<string>();
  heading = input.required<string>();
  description = input.required<string>();
  tags = input<string[]>([]);
  meta = input<string>('');
  variant = input<'filled' | 'outlined'>('outlined');
  routerLink = input.required<string>();
}
