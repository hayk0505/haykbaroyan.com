import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  let fixture: ComponentFixture<ProjectCard>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('badgeLabel', '01 · IN BUILD');
    fixture.componentRef.setInput('heading', 'DigitalDust Library');
    fixture.componentRef.setInput('description', 'A multi-author platform.');
    fixture.componentRef.setInput('tags', ['SvelteKit', 'React']);
    fixture.componentRef.setInput('screenshotCaption', '[ screenshot ]');
  });

  it('renders an external link when external is true', () => {
    fixture.componentRef.setInput('external', true);
    fixture.componentRef.setInput('linkHref', 'https://example.com');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('renders a routerLink when external is false', () => {
    fixture.componentRef.setInput('external', false);
    fixture.componentRef.setInput('routerLink', '/projects/eu-deepfake');
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe('/projects/eu-deepfake');
  });

  it('renders a non-clickable div instead of a link when external is true but linkHref is a bare "#"', () => {
    fixture.componentRef.setInput('external', true);
    fixture.componentRef.setInput('linkHref', '#');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    const card = fixture.nativeElement.querySelector('.project-card');
    expect(card.tagName).toBe('DIV');
    expect(card.classList.contains('project-card--static')).toBe(true);
  });

  it('renders a non-clickable div instead of a link when external is false and routerLink is empty', () => {
    fixture.componentRef.setInput('external', false);
    fixture.componentRef.setInput('routerLink', '');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('.project-card').tagName).toBe('DIV');
  });

  it('shows the external-link glyph only when external is true', () => {
    fixture.componentRef.setInput('external', true);
    fixture.componentRef.setInput('linkHref', 'https://example.com');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.project-card__icon').textContent).toBe('↗');

    fixture.componentRef.setInput('external', false);
    fixture.componentRef.setInput('routerLink', '/projects/eu-deepfake');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.project-card__icon').textContent).toBe('→');
  });

  it('applies the light variant class', () => {
    fixture.componentRef.setInput('variant', 'light');
    fixture.componentRef.setInput('routerLink', '/projects/eu-deepfake');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').classList.contains('project-card--light')).toBe(true);
  });

  it('renders the screenshot caption placeholder when no imageSrc is given', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.project-card__image-img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('[ screenshot ]');
  });

  it('renders an image instead of the placeholder when imageSrc is given', () => {
    fixture.componentRef.setInput('imageSrc', '/assets/DDL-image.png');
    fixture.detectChanges();
    const img: HTMLImageElement = fixture.nativeElement.querySelector('.project-card__image-img');
    expect(img.getAttribute('src')).toBe('/assets/DDL-image.png');
    expect(img.getAttribute('alt')).toBe('DigitalDust Library');
    expect(fixture.nativeElement.textContent).not.toContain('[ screenshot ]');
  });
});
