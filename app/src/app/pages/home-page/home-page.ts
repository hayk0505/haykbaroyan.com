import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNav } from '../../shared/header-nav/header-nav';
import { Footer } from '../../shared/footer/footer';
import { ActionCard } from '../../shared/action-card/action-card';

@Component({
  selector: 'app-home-page',
  imports: [HeaderNav, Footer, ActionCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
