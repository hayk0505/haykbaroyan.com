import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderNav } from '../../shared/header-nav/header-nav';
import { Footer } from '../../shared/footer/footer';
import { ContactForm } from '../../shared/contact-form/contact-form';
import { CONTACT } from '../../data/contact.data';

@Component({
  selector: 'app-contact-page',
  imports: [HeaderNav, Footer, ContactForm],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  contact = CONTACT;
}
