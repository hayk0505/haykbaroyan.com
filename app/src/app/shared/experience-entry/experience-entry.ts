import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagChip } from '../tag-chip/tag-chip';

@Component({
  selector: 'app-experience-entry',
  imports: [TagChip],
  templateUrl: './experience-entry.html',
  styleUrl: './experience-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceEntry {
  dateLabel = input.required<string>();
  badge = input<string>('');
  company = input.required<string>();
  companyLinkLabel = input<string>('');
  companyLinkHref = input<string>('');
  role = input.required<string>();
  description = input.required<string>();
  tags = input.required<string[]>();
  isLast = input<boolean>(false);
}
