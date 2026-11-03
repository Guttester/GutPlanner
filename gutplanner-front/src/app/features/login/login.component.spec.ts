import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter(routes), { provide: ProfileService, useValue: { getProfile: () => of(null) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens user directly even when credentials are empty', async () => {
    component.login();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/user');
    expect(TestBed.inject(ToastService).toast()).toBeNull();
  });

  it('toggles password visibility without submitting the form', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-controls="login-password"]');
    const password: HTMLInputElement = fixture.nativeElement.querySelector('#login-password');
    expect(password.type).toBe('password');
    button.click();
    fixture.detectChanges();
    expect(password.type).toBe('text');
    expect(button.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(TestBed.inject(ToastService).toast()).toBeNull();
  });

  it('opens user without creating an authentication notification', async () => {
    component.form.setValue({ username: 'usuario', password: 'senha-de-teste' });
    component.login();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/user');
    expect(TestBed.inject(ToastService).toast()).toBeNull();
  });
});
