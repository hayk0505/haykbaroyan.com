import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  let fixture: ComponentFixture<ContactForm>;
  let component: ContactForm;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('disables the submit button while the form is invalid', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('enables the submit button once all fields are valid', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);
  });

  it('POSTs the form value to /api/contact on submit', () => {
    // NOTE: this asserts the form's CURRENT payload shape, not the Worker's expected one —
    // workers/contact requires an additional turnstileToken field (see the TODO in
    // contact-form.ts). Update this alongside that wiring, not before.
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.submit();
    const req = httpMock.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    req.flush({});
  });

  it('renders a labeled Turnstile placeholder', () => {
    expect(fixture.nativeElement.textContent).toContain('Turnstile');
  });
});
