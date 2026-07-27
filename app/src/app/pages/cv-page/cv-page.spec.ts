import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CvPage } from './cv-page';

describe('CvPage', () => {
  let fixture: ComponentFixture<CvPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(CvPage);
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one experience entry per data record', () => {
    expect(fixture.nativeElement.querySelectorAll('app-experience-entry').length).toBe(3);
  });

  it('renders one education entry per data record', () => {
    expect(fixture.nativeElement.querySelectorAll('app-education-entry').length).toBe(3);
  });
});
