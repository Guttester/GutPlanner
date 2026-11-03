import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUser, lucideLockKeyhole, lucideUsers, lucideMail, lucideTrash2, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ProjectsService } from '@Core/services/projects.service';
import { AccountSettingsService } from '@Core/services/account-settings.service';
@Component({ selector: 'app-meu-perfil', imports: [FormsModule, NgIcon], providers: [provideIcons({ lucideUser, lucideLockKeyhole, lucideUsers, lucideMail, lucideTrash2, lucideEye, lucideEyeOff })], templateUrl: './meu-perfil.component.html' })
export class MeuPerfilComponent {
  readonly settings = inject(AccountSettingsService);
  readonly projects = inject(ProjectsService).projects;
  name = this.settings.account().name;
  projectId = this.projects()[0]?.id ?? 0;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showPasswords = false;
  passwordError = '';
  passwordMessage = '';
  email = '';
  message = '';
  error = '';
  readonly visibleInvitations = computed(() => this.settings.invitations().filter(invite => this.projects().some(project => project.id === invite.projectId)));
  validatePassword(): void {
    this.passwordError = ''; this.passwordMessage = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) { this.passwordError = 'Preencha os três campos de senha.'; return; }
    if (this.newPassword.length < 8) { this.passwordError = 'A nova senha deve ter pelo menos 8 caracteres.'; return; }
    if (this.newPassword === this.currentPassword) { this.passwordError = 'Escolha uma senha diferente da atual.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passwordError = 'A confirmação não corresponde à nova senha.'; return; }
    this.clearPasswords();
    this.passwordMessage = 'Campos validados. A senha não foi alterada: a integração com a API ainda está pendente.';
  }
  clearPasswords(): void {
    this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.showPasswords = false;
    this.passwordError = ''; this.passwordMessage = '';
  }
  saveName(): void {
    if (!this.name.trim()) return;
    this.settings.account.update(account => ({ ...account, name: this.name.trim() }));
    this.message = 'Nome atualizado apenas nesta demonstração.';
  }
  invite(): void {
    this.error = ''; this.message = '';
    const email = this.email.trim().toLowerCase();
    if (!this.projects().some(project => project.id === Number(this.projectId))) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.error = 'Informe um e-mail válido.'; return; }
    if (email === this.settings.account().email.toLowerCase()) { this.error = 'Informe o e-mail da outra pessoa.'; return; }
    if (this.settings.invitations().some(item => item.projectId === Number(this.projectId) && item.email === email)) { this.error = 'Já existe um rascunho para esse e-mail neste projeto.'; return; }
    this.settings.invitations.update(items => [...items, { id: Math.max(0, ...items.map(item => item.id)) + 1, projectId: Number(this.projectId), email }]);
    this.email = ''; this.message = 'Rascunho criado. Nenhum convite foi enviado.';
  }
  removeDraft(id: number): void { this.settings.invitations.update(items => items.filter(item => item.id !== id)); }
  projectName(id: number): string { return this.projects().find(project => project.id === id)?.name ?? 'Projeto'; }
}
