import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactPage } from './contact-page';

describe('ContactPage', () => {
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactPage);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the contact form', () => {
    expect(fixture.nativeElement.querySelector('app-contact-form')).toBeTruthy();
  });

  it('renders the direct email link', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href^="mailto:"]');
    expect(link.getAttribute('href')).toBe('mailto:haykbaroyan@yahoo.com');
  });
});
