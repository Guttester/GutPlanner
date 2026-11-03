import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { ProfileService } from './core/services/profile.service';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes), { provide: ProfileService, useValue: { getProfile: () => of(null) } }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'gutplanner-front' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('gutplanner-front');
  });

  it('renders the navbar inside the login page', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-nar-bar').length).toBe(1);
    expect(compiled.querySelector('app-login app-nar-bar')).not.toBeNull();
  });

  it('opens user when the login button is clicked', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('#login-submit');
    button.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/user');
    expect(fixture.nativeElement.querySelector('app-user')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#login-form')).toBeNull();
  });

  it('opens contact from the login without keeping the login form visible', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('#login-contact');
    link.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/contato');
    expect(fixture.nativeElement.querySelector('#contact-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#login-form')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-nar-bar').length).toBe(1);
  });
});
