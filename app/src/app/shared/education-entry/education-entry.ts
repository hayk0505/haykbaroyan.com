import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DiplomaLink } from '../../data/education.data';

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
  diplomas = input<DiplomaLink[]>();
  isLast = input<boolean>(false);
}
