import { AuthService, UsuarioSessao } from './auth.service';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@Core/infra/api.config';
export interface ProjectInvitationDraft { id: string; idProjeto: string; email: string; }
@Injectable({ providedIn: 'root' })
export class AccountSettingsService {
  constructor() { effect(() => { this.auth.user(); this.invitations.set([]); }); }
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  readonly account = computed(() => ({ name: this.auth.user()?.nome ?? '', email: this.auth.user()?.email ?? '', roleLabel: 'Conta' }));
  readonly invitations = signal<ProjectInvitationDraft[]>([]);
  async loadProfile(): Promise<void> { this.auth.updateUser(await firstValueFrom(this.http.get<UsuarioSessao>(`${this.api}/user/me`))); }
  async updateName(nome: string): Promise<void> { this.auth.updateUser(await firstValueFrom(this.http.patch<UsuarioSessao>(`${this.api}/user/me`, { nome }))); }
  async invite(idProjeto: string, email: string): Promise<void> { await firstValueFrom(this.http.post(`${this.api}/projetos/${encodeURIComponent(idProjeto)}/convites`, { email })); await this.load(idProjeto); }
  async load(idProjeto: string): Promise<void> { this.invitations.set(await firstValueFrom(this.http.get<ProjectInvitationDraft[]>(`${this.api}/projetos/${encodeURIComponent(idProjeto)}/convites`))); }
  async remove(id: string): Promise<void> { const item = this.invitations().find(item => item.id === id); if (!item) return; await firstValueFrom(this.http.delete(`${this.api}/projetos/${encodeURIComponent(item.idProjeto)}/convites/${encodeURIComponent(id)}`)); this.invitations.update(items => items.filter(item => item.id !== id)); }
}
