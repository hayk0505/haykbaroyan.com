import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNav } from '../../shared/header-nav/header-nav';
import { Footer } from '../../shared/footer/footer';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { TagChip } from '../../shared/tag-chip/tag-chip';
import { ExperienceEntry } from '../../shared/experience-entry/experience-entry';
import { EducationEntry } from '../../shared/education-entry/education-entry';
import { EXPERIENCE_ENTRIES } from '../../data/experience.data';
import { EDUCATION_ENTRIES } from '../../data/education.data';
import { TECH_TAGS, AI_TOOLS } from '../../data/skills.data';
import { LANGUAGES } from '../../data/languages.data';
import { CONTACT } from '../../data/contact.data';

@Component({
  selector: 'app-cv-page',
  imports: [HeaderNav, Footer, SectionHeading, TagChip, ExperienceEntry, EducationEntry],
  templateUrl: './cv-page.html',
  styleUrl: './cv-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvPage {
  experience = EXPERIENCE_ENTRIES;
  education = EDUCATION_ENTRIES;
  techTags = TECH_TAGS;
  aiTools = AI_TOOLS;
  languages = LANGUAGES;
  contact = CONTACT;
}
