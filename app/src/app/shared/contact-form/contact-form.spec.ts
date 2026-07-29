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

  it('keeps the submit button disabled when the form is valid but Turnstile has not verified yet', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  it('enables the submit button once the form is valid and Turnstile has verified', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.turnstileToken.set('test-token');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(false);
  });

  it('does not submit without a Turnstile token', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.submit();
    httpMock.expectNone('/api/contact');
  });

  it('POSTs the form value plus the Turnstile token to /api/contact on submit', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.turnstileToken.set('test-token');
    component.submit();
    const req = httpMock.expectOne('/api/contact');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
      turnstileToken: 'test-token',
    });
    req.flush({});
  });

  it('resets the form fields after a successful submit', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.turnstileToken.set('test-token');
    component.submit();
    const req = httpMock.expectOne('/api/contact');
    req.flush({});
    expect(component.form.value).toEqual({ name: '', email: '', message: '' });
  });

  it('does not reset the form fields after a failed submit', () => {
    component.form.setValue({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
    component.turnstileToken.set('test-token');
    component.submit();
    const req = httpMock.expectOne('/api/contact');
    req.flush('error', { status: 500, statusText: 'Server Error' });
    expect(component.form.value).toEqual({ name: 'Jane', email: 'jane@example.com', message: 'Hello' });
  });

  it('renders a container for the Turnstile widget to mount into', () => {
    const container = fixture.nativeElement.querySelector('.contact-form__turnstile');
    expect(container).withContext('expected a .contact-form__turnstile mount point').not.toBeNull();
  });
});
