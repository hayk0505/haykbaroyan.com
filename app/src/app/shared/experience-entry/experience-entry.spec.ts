import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExperienceEntry } from './experience-entry';

describe('ExperienceEntry', () => {
  let fixture: ComponentFixture<ExperienceEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ExperienceEntry] }).compileComponents();
    fixture = TestBed.createComponent(ExperienceEntry);
    fixture.componentRef.setInput('dateLabel', '2021 — Present');
    fixture.componentRef.setInput('company', 'VOLO LLC');
    fixture.componentRef.setInput('role', 'Front-End Developer');
    fixture.componentRef.setInput('description', 'Did things <strong>well</strong>.');
    fixture.componentRef.setInput('tags', ['TypeScript', 'React']);
    fixture.detectChanges();
  });

  it('renders company, role, and date', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('VOLO LLC');
    expect(text).toContain('Front-End Developer');
    expect(text).toContain('2021 — Present');
  });

  it('renders the description as HTML (preserving inline emphasis)', () => {
    expect(fixture.nativeElement.querySelector('strong').textContent).toBe('well');
  });

  it('renders all tags', () => {
    const chips = fixture.nativeElement.querySelectorAll('app-tag-chip');
    expect(chips.length).toBe(2);
  });
});
