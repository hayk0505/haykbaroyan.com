import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Footer] }).compileComponents();
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('renders the copyright line', () => {
    expect(fixture.nativeElement.textContent).toContain('© 2026 Hayk Baroyan');
  });
});
