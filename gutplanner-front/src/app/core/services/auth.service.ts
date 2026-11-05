import { ToastService } from './toast.service';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, Injector, signal } from '@angular/core';
import { catchError, map, of, shareReplay, switchMap, tap, Observable, finalize } from 'rxjs';
import { API_URL, DEMO_MODE } from '@Core/infra/api.config';
import { AUTH_REQUEST, SILENT_API_ERROR } from '@Core/infra/api-request.context';
import { User } from '@Core/model/User';
export type UsuarioSessao = Pick<User, 'idUser' | 'nome' | 'email'>;
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);
  private readonly api = inject(API_URL);
  readonly demoMode = false;
  private readonly session = signal<UsuarioSessao | null>(null);
  readonly user = this.session.asReadonly();
  private checked = false;
  private restoration?: Observable<boolean>;
  private get http(): HttpClient { return this.injector.get(HttpClient); }
  private readonly authContext = new HttpContext().set(AUTH_REQUEST, true);
  private validateUser(value: unknown): UsuarioSessao {
    if (!value || typeof value !== 'object') { this.toast.error('A API retornou uma sessão inválida. Tente novamente.'); throw new Error('Sessão inválida.'); }
    const user = value as Record<string, unknown>;
    if (typeof user['idUser'] !== 'string' || !user['idUser'] || typeof user['nome'] !== 'string' || typeof user['email'] !== 'string') { this.toast.error('A API retornou uma sessão inválida. Tente novamente.'); throw new Error('Sessão inválida.'); }
    return { idUser: user['idUser'], nome: user['nome'], email: user['email'] };
  }
  restore(): Observable<boolean> {
    if (this.checked) return of(this.user() !== null);
    return this.restoration ??= this.http.get<unknown>(`${this.api}/auth/session`, { context: new HttpContext().set(SILENT_API_ERROR, true).set(AUTH_REQUEST, true) }).pipe(
      map(user => this.validateUser(user)), switchMap(user => this.csrf().pipe(map(() => user))), tap(user => { this.session.set(user); this.checked = true; }), map(() => true),
      catchError(error => { this.session.set(null); if (error.status === 401) this.checked = true; return of(false); }),
      finalize(() => { this.restoration = undefined; }), shareReplay({ bufferSize: 1, refCount: false })
    );
  }
  private csrf(): Observable<void> { return this.http.get<void>(`${this.api}/auth/csrf`, { context: this.authContext }); }
  login(username: string, password: string): Observable<UsuarioSessao> {
    return this.csrf().pipe(switchMap(() => this.http.post<unknown>(`${this.api}/auth/login`, { username, password }, { context: this.authContext })), map(user => this.validateUser(user)), tap(user => { this.session.set(user); this.checked = true; }));
  }
  register(nome: string, email: string, senha: string): Observable<void> {
    return this.csrf().pipe(switchMap(() => this.http.post<void>(`${this.api}/auth/register`, { nome, email, senha }, { context: this.authContext })));
  }
  recover(email: string): Observable<void> { return this.csrf().pipe(switchMap(() => this.http.post<void>(`${this.api}/auth/password/recovery`, { email }, { context: this.authContext }))); }
  resetPassword(token: string, novaSenha: string): Observable<void> { return this.csrf().pipe(switchMap(() => this.http.post<void>(`${this.api}/auth/password/reset`, { token, novaSenha }, { context: this.authContext })), tap(() => this.expire())); }
  changePassword(senhaAtual: string, novaSenha: string): Observable<void> { return this.csrf().pipe(switchMap(() => this.http.put<void>(`${this.api}/auth/password`, { senhaAtual, novaSenha }, { context: this.authContext }))); }
  logout(): Observable<void> {
    return this.csrf().pipe(switchMap(() => this.http.post<void>(`${this.api}/auth/logout`, {}, { context: new HttpContext().set(AUTH_REQUEST, true).set(SILENT_API_ERROR, true) })), tap(() => this.expire()), catchError(error => { if (error instanceof HttpErrorResponse && error.status === 401) { this.expire(); return of(undefined); } throw error; }));
  }
  updateUser(user: UsuarioSessao): void { this.session.set(user); }
  expire(): void { this.session.set(null); this.checked = true; }
}
