import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionHeading } from './section-heading';

describe('SectionHeading', () => {
  let fixture: ComponentFixture<SectionHeading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SectionHeading] }).compileComponents();
    fixture = TestBed.createComponent(SectionHeading);
    fixture.componentRef.setInput('heading', 'Experience');
    fixture.componentRef.setInput('caption', '01 — 03');
    fixture.detectChanges();
  });

  it('renders the heading', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Experience');
  });

  it('renders the caption', () => {
    expect(fixture.nativeElement.textContent).toContain('01 — 03');
  });
});
