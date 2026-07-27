import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagChip } from './tag-chip';

describe('TagChip', () => {
  let fixture: ComponentFixture<TagChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TagChip] }).compileComponents();
    fixture = TestBed.createComponent(TagChip);
  });

  it('renders the label text', () => {
    fixture.componentRef.setInput('label', 'React');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('React');
  });

  it('applies the filled class when variant is filled', () => {
    fixture.componentRef.setInput('label', 'React');
    fixture.componentRef.setInput('variant', 'filled');
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('.tag-chip');
    expect(chip.classList.contains('tag-chip--filled')).toBe(true);
  });

  it('defaults to the outlined variant', () => {
    fixture.componentRef.setInput('label', 'React');
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('.tag-chip');
    expect(chip.classList.contains('tag-chip--outlined')).toBe(true);
  });
});
