import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { ProjectsPage } from './pages/projects-page/projects-page';
import { CvPage } from './pages/cv-page/cv-page';
import { ContactPage } from './pages/contact-page/contact-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'cv', component: CvPage },
  { path: 'projects', component: ProjectsPage },
  { path: 'contact', component: ContactPage },
  { path: '**', redirectTo: '' },
];
