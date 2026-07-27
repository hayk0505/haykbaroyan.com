import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { HeaderNav } from './header-nav';

@Component({ selector: 'app-stub', template: '<app-header-nav />', imports: [HeaderNav] })
class HostStub {}

describe('HeaderNav', () => {
  it('marks the CV link active when on /cv', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'cv', component: HostStub }])],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/cv', HostStub);
    harness.detectChanges();
    const cvLink = harness.routeNativeElement!.querySelector('a[routerLink="/cv"]');
    expect(cvLink!.classList.contains('header-nav__link--active')).toBe(true);
  });

  it('marks the Contact link active when on /contact', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'contact', component: HostStub }])],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/contact', HostStub);
    harness.detectChanges();
    const contactLink = harness.routeNativeElement!.querySelector('a[routerLink="/contact"]');
    expect(contactLink!.classList.contains('header-nav__link--active')).toBe(true);
  });

  it('renders the email pill and GitHub link', async () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    const html = fixture.nativeElement.innerHTML as string;
    expect(html).toContain('mailto:haykbaroyan@yahoo.com');
    expect(html).toContain('https://github.com/hayk0505');
  });

  it('renders a download link to the CV PDF asset', () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[download]');
    expect(link.getAttribute('href')).toBe('/assets/Hayk-Baroyan-CV.pdf');
  });

  it('toggles the mobile menu open when the burger button is clicked', () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    const burger: HTMLButtonElement = fixture.nativeElement.querySelector('.header-nav__burger');
    const nav: HTMLElement = fixture.nativeElement.querySelector('.header-nav__links');
    expect(nav.classList.contains('header-nav__links--open')).toBe(false);

    burger.click();
    fixture.detectChanges();
    expect(nav.classList.contains('header-nav__links--open')).toBe(true);
    expect(burger.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the mobile menu when a nav link is clicked', () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    const burger: HTMLButtonElement = fixture.nativeElement.querySelector('.header-nav__burger');
    burger.click();
    fixture.detectChanges();

    const homeLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a[routerLink="/"]');
    homeLink.click();
    fixture.detectChanges();

    const nav: HTMLElement = fixture.nativeElement.querySelector('.header-nav__links');
    expect(nav.classList.contains('header-nav__links--open')).toBe(false);
  });

  it('renders no backdrop when the menu is closed', () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.header-nav__backdrop')).toBeNull();
  });

  it('closes the mobile menu when the backdrop is clicked', () => {
    TestBed.configureTestingModule({ imports: [HeaderNav], providers: [provideRouter([])] });
    const fixture: ComponentFixture<HeaderNav> = TestBed.createComponent(HeaderNav);
    fixture.detectChanges();
    const burger: HTMLButtonElement = fixture.nativeElement.querySelector('.header-nav__burger');
    burger.click();
    fixture.detectChanges();

    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.header-nav__backdrop');
    expect(backdrop).not.toBeNull();
    backdrop.click();
    fixture.detectChanges();

    const nav: HTMLElement = fixture.nativeElement.querySelector('.header-nav__links');
    expect(nav.classList.contains('header-nav__links--open')).toBe(false);
    expect(fixture.nativeElement.querySelector('.header-nav__backdrop')).toBeNull();
  });
});
