import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNav } from '../../shared/header-nav/header-nav';
import { Footer } from '../../shared/footer/footer';
import { ProjectCard } from '../../shared/project-card/project-card';
import { PROJECT_ENTRIES } from '../../data/projects.data';

@Component({
  selector: 'app-projects-page',
  imports: [HeaderNav, Footer, ProjectCard],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPage {
  projects = PROJECT_ENTRIES;
}
