import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { of } from 'rxjs';
import { ProfileService } from '@Core/services/profile.service';
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

  it('renders project child routes inside the user layout and returns to the overview', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/user/projeto/1/kanban');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-user app-projeto-kanban')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-side-bar').length).toBe(1);
    expect(fixture.nativeElement.querySelector('#dashboard-indicators')).toBeNull();
    expect(router.routerState.snapshot.root.firstChild?.firstChild?.paramMap.get('id')).toBe('1');

    await router.navigateByUrl('/user/projeto/2/tarefas');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-user app-projeto-tarefa')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-projeto-kanban')).toBeNull();
    expect(router.routerState.snapshot.root.firstChild?.firstChild?.paramMap.get('id')).toBe('2');

    fixture.nativeElement.querySelector('#dashboard-home').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/user');
    expect(fixture.nativeElement.querySelector('#dashboard-indicators')).not.toBeNull();
  });

  it('loads the public pages and the profile route', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    for (const [url, selector] of [['/cadastro', 'app-cadastro'], ['/recuperacao', 'app-recuperacao'], ['/user/meu-perfil', 'app-meu-perfil']]) {
      await router.navigateByUrl(url);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector(selector)).not.toBeNull();
    }
  });

  it('redirects incomplete, unknown and invalid project URLs', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    for (const [url, expected] of [['/user/projeto/1', '/user/projeto/1/kanban'], ['/user/projeto/999/kanban', '/user'], ['/user/desconhecido', '/user'], ['/desconhecido', '/'], ['/login', '/']]) {
      await router.navigateByUrl(url);
      fixture.detectChanges();
      expect(router.url).toBe(expected);
    }
  });
});
