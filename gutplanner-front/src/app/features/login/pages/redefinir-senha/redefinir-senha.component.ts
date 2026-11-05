import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthService } from '@Core/services/auth.service';
import { ToastService } from '@Core/services/toast.service';
@Component({ selector: 'app-redefinir-senha', imports: [ReactiveFormsModule, RouterLink], templateUrl: './redefinir-senha.component.html' })
export class RedefinirSenhaComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly token = new URLSearchParams(this.route.snapshot.fragment ?? '').get('token') ?? '';
  private readonly builder = inject(NonNullableFormBuilder);
  readonly form = this.builder.group({ novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(1024)]], confirmacao: ['', Validators.required] });
  pending = false;
  done = false;
  showPassword = false;
  error = '';
  constructor() {
    this.location.replaceState('/redefinir-senha');
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(this.token)) this.error = 'Link inválido. Solicite uma nova recuperação.';
  }
  submit(): void {
    if (this.pending || this.done) return;
    this.form.markAllAsTouched();
    if (!/^[A-Za-z0-9_-]{32,128}$/.test(this.token)) { this.error = 'Link inválido. Solicite uma nova recuperação.'; return; }
    if (this.form.invalid) { this.error = 'Informe uma senha de 8 a 1024 caracteres e confirme-a.'; return; }
    const { novaSenha, confirmacao } = this.form.getRawValue();
    if (novaSenha !== confirmacao) { this.error = 'As senhas não coincidem.'; return; }
    this.error = ''; this.pending = true;
    this.auth.resetPassword(this.token, novaSenha).pipe(finalize(() => this.pending = false)).subscribe({
      next: () => { this.done = true; this.form.reset(); this.toast.success('Senha redefinida. Entre novamente.'); },
      error: error => { this.error = error.status === 400 ? 'Link inválido, expirado ou já utilizado. Solicite uma nova recuperação.' : 'Não foi possível redefinir a senha. Tente novamente.'; }
    });
  }
}
