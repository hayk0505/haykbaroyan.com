import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CONTACT } from '../../data/contact.data';

@Component({
  selector: 'app-header-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-nav.html',
  styleUrl: './header-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNav {
  contact = CONTACT;
  mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
