import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { API_URL, DEMO_MODE } from '@Core/infra/api.config';
import { apiInterceptor } from '@Core/infra/api.interceptor';

// A suíte verifica o modo API, independentemente dos mocks de desenvolvimento.
describe('AuthService e interceptor no modo API', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let toast: ToastService;
  const user = { idUser: 'user-1', nome: 'Pessoa', email: 'pessoa@example.com' };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting(), provideRouter([]), { provide: DEMO_MODE, useValue: false }, { provide: API_URL, useValue: '/api' }] });
    auth = TestBed.inject(AuthService); http = TestBed.inject(HttpTestingController); toast = TestBed.inject(ToastService);
  });
  afterEach(() => http.verify());

  it('restores one shared session request and sends credentials only to the local API', () => {
    const values: boolean[] = [];
    auth.restore().subscribe(value => values.push(value));
    auth.restore().subscribe(value => values.push(value));
    const request = http.expectOne('/api/auth/session');
    expect(request.request.withCredentials).toBeTrue(); request.flush(user);
    expect(values).toEqual([true, true]); expect(auth.user()).toEqual(user);
    TestBed.inject(HttpClient).get('https://guttester.io/profile').subscribe();
    const external = http.expectOne('https://guttester.io/profile');
    expect(external.request.withCredentials).toBeFalse(); external.flush({});
  });
  it('treats an absent session as unauthenticated without a duplicate error', () => {
    let authenticated = true;
    auth.restore().subscribe(value => authenticated = value);
    http.expectOne('/api/auth/session').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(authenticated).toBeFalse(); expect(auth.user()).toBeNull(); expect(toast.toast()).toBeNull();
  });
  it('reports connection failures even while restoring the session', () => {
    auth.restore().subscribe();
    http.expectOne('/api/auth/session').error(new ProgressEvent('error'));
    expect(toast.toast()?.type).toBe('error'); expect(auth.user()).toBeNull();
  });
  it('initializes CSRF before login and stores only the returned identity', () => {
    auth.login('pessoa', 'senha-de-teste').subscribe();
    http.expectOne('/api/auth/csrf').flush(null);
    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({ username: 'pessoa', password: 'senha-de-teste' });
    request.flush({ ...user, senha: 'não deve ficar na sessão' });
    expect(auth.user()).toEqual(user); expect(Object.keys(auth.user()!)).not.toContain('senha');
  });
  it('expires a session on protected 401 errors and never exposes backend details', () => {
    auth.restore().subscribe(); http.expectOne('/api/auth/session').flush(user);
    TestBed.inject(HttpClient).get('/api/projects').subscribe({ error: () => undefined });
    http.expectOne('/api/projects').flush({ detail: 'PRIVATE_INTERNAL_DETAIL' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.user()).toBeNull(); expect(toast.toast()?.message).not.toContain('PRIVATE_INTERNAL_DETAIL');
    expect(toast.toast()?.message).toContain('sessão expirou');
  });
  it('does not clear a session when logout fails due to a network problem', () => {
    auth.restore().subscribe(); http.expectOne('/api/auth/session').flush(user);
    auth.logout().subscribe({ error: () => undefined }); http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/auth/logout').error(new ProgressEvent('error'));
    expect(auth.user()).toEqual(user); expect(toast.toast()?.type).toBe('error');
  });
  it('clears the session after confirmed logout', () => {
    auth.restore().subscribe(); http.expectOne('/api/auth/session').flush(user);
    auth.logout().subscribe(); http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/auth/logout').flush(null); expect(auth.user()).toBeNull();
  });
});
