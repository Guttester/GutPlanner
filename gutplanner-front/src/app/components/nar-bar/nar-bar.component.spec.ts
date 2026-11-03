import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NarBarComponent } from './nar-bar.component';

describe('NarBarComponent', () => {
  let component: NarBarComponent;
  let fixture: ComponentFixture<NarBarComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarBarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarBarComponent);
    http = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    http.expectOne('https://guttester.io/profile').flush({});
    expect(component).toBeTruthy();
  });

  afterEach(() => http.verify());

  it('uses social links returned by the public profile', () => {
    http.expectOne('https://guttester.io/profile').flush({
      github: 'https://github.com/example',
      linkedin: 'https://www.linkedin.com/in/example/'
    });
    fixture.detectChanges();
    const github: HTMLAnchorElement = fixture.nativeElement.querySelector('a[aria-label="GitHub"]');
    const linkedin: HTMLAnchorElement = fixture.nativeElement.querySelector('a[aria-label="LinkedIn"]');
    expect(github.href).toBe('https://github.com/example');
    expect(linkedin.href).toBe('https://www.linkedin.com/in/example/');
  });

  it('keeps safe fallback links when profile URLs are invalid', () => {
    http.expectOne('https://guttester.io/profile').flush({
      github: 'javascript:alert(1)',
      linkedin: 'https://linkedin.com.evil.example/profile'
    });
    expect(component.githubUrl()).toBe('https://github.com/Guttester');
    expect(component.linkedinUrl()).toContain('https://www.linkedin.com/');
  });

  it('keeps navigation available when the profile request fails', () => {
    http.expectOne('https://guttester.io/profile').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-controls="navbar-mobile"]');
    const menu: HTMLElement = fixture.nativeElement.querySelector('#navbar-mobile');
    expect(menu.hidden).toBeTrue();
    button.click();
    fixture.detectChanges();
    expect(menu.hidden).toBeFalse();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(menu.hidden).toBeTrue();
  });
});
