import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('app.routes', () => {
  it('has exactly 5 route entries: home, cv, projects, contact, wildcard', () => {
    expect(routes.length).toBe(5);
    expect(routes.map((r) => r.path)).toEqual(['', 'cv', 'projects', 'contact', '**']);
  });

  it('redirects unknown paths to home', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/does-not-exist');
    expect(TestBed.inject(Router).url).toBe('/');
  });
});
