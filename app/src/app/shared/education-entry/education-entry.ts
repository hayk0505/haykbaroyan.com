import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-education-entry',
  templateUrl: './education-entry.html',
  styleUrl: './education-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationEntry {
  dateLabel = input.required<string>();
  title = input.required<string>();
  institution = input.required<string>();
  isLast = input<boolean>(false);
}
