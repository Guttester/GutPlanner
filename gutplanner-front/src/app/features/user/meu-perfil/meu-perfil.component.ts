import { AuthService } from '@Core/services/auth.service';
import { ToastService } from '@Core/services/toast.service';
import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideLockKeyhole, lucideUsers, lucideMail, lucideTrash2, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ProjectsService } from '@Core/services/projects.service';
import { AccountSettingsService } from '@Core/services/account-settings.service';
@Component({ selector: 'app-meu-perfil', imports: [FormsModule, NgIcon], providers: [provideIcons({ lucideUser, lucideLockKeyhole, lucideUsers, lucideMail, lucideTrash2, lucideEye, lucideEyeOff })], templateUrl: './meu-perfil.component.html' })
export class MeuPerfilComponent {
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  pendingPassword = false;
  readonly settings = inject(AccountSettingsService);
  readonly projects = inject(ProjectsService).projects;
  constructor() { effect(() => { const projects = this.projects(); if (!this.idProjeto && projects.length) { this.idProjeto = projects[0].idProjeto; void this.loadInvitations(); } }); }
  name = this.settings.account().name;
  idProjeto = ''; 
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showPasswords = false;
  passwordError = '';
  passwordMessage = '';
  email = '';
  message = '';
  error = '';
  readonly visibleInvitations = computed(() => this.settings.invitations().filter(invite => this.projects().some(project => project.idProjeto === invite.idProjeto)));
  validatePassword(): void {
    this.passwordError = ''; this.passwordMessage = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) { this.passwordError = 'Preencha os três campos de senha.'; return; }
    if (this.newPassword.length < 8) { this.passwordError = 'A nova senha deve ter pelo menos 8 caracteres.'; return; }
    if (this.newPassword === this.currentPassword) { this.passwordError = 'Escolha uma senha diferente da atual.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = 'A confirmação não corresponde à nova senha.'; return; }
    if (this.pendingPassword) return;
    this.pendingPassword = true;
    this.auth.changePassword(this.currentPassword, this.newPassword).subscribe({ next: () => { this.pendingPassword = false; this.clearPasswords(); this.passwordMessage = 'Senha alterada com sucesso.'; this.toast.success(this.passwordMessage); }, error: () => { this.pendingPassword = false; this.clearPasswords(); this.passwordError = 'Não foi possível alterar a senha.'; } });
  }
  clearPasswords(): void {
    this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.showPasswords = false;
    this.passwordError = ''; this.passwordMessage = '';
  }
  async saveName(): Promise<void> { if (!this.name.trim()) return; try { await this.settings.updateName(this.name.trim()); this.toast.success('Nome atualizado.'); } catch {} }
  async invite(): Promise<void> { if (!this.idProjeto || !this.email.trim()) return; try { await this.settings.invite(this.idProjeto, this.email.trim()); this.email = ''; this.message = 'Convite registrado como pendente.'; } catch {} }
  async removeDraft(id: string): Promise<void> { try { await this.settings.remove(id); } catch {} }
  async loadInvitations(): Promise<void> { this.settings.invitations.set([]); if (this.idProjeto) { try { await this.settings.load(this.idProjeto); } catch {} } }
  projectName(id: string): string { return this.projects().find(project => project.idProjeto === id)?.nomeProjeto ?? 'Projeto'; }
}
