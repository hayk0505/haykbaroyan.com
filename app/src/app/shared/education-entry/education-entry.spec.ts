import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EducationEntry } from './education-entry';

describe('EducationEntry', () => {
  let fixture: ComponentFixture<EducationEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EducationEntry] }).compileComponents();
    fixture = TestBed.createComponent(EducationEntry);
    fixture.componentRef.setInput('dateLabel', '2024 — Present');
    fixture.componentRef.setInput('title', 'M.Sc. Management & Information Technology');
    fixture.componentRef.setInput('institution', 'West Saxon University');
    fixture.detectChanges();
  });

  it('renders date, title, and institution', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('2024 — Present');
    expect(text).toContain('M.Sc. Management & Information Technology');
    expect(text).toContain('West Saxon University');
  });
});
