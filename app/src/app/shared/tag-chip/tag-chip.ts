import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.html',
  styleUrl: './tag-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagChip {
  label = input.required<string>();
  variant = input<'outlined' | 'filled' | 'emphasized'>('outlined');
}
