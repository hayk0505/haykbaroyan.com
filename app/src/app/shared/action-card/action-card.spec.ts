import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActionCard } from './action-card';

describe('ActionCard', () => {
  let fixture: ComponentFixture<ActionCard>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ActionCard],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(ActionCard);
    fixture.componentRef.setInput('label', '→ PRIMARY');
    fixture.componentRef.setInput('heading', 'Curriculum Vitae');
    fixture.componentRef.setInput('description', 'Experience, skills and contact.');
    fixture.componentRef.setInput('routerLink', '/cv');
  });

  it('renders heading, description, and tags', () => {
    fixture.componentRef.setInput('tags', ['React', 'Angular']);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Curriculum Vitae');
    expect(text).toContain('Experience, skills and contact.');
    expect(text).toContain('React');
    expect(text).toContain('Angular');
  });

  it('renders meta text instead of tags when no tags are given', () => {
    fixture.componentRef.setInput('meta', '02 case studies');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('02 case studies');
  });

  it('applies the filled class when variant is filled', () => {
    fixture.componentRef.setInput('variant', 'filled');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a').classList.contains('action-card--filled')).toBe(true);
  });
});
