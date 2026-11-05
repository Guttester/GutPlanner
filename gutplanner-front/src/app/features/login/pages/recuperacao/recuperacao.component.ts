import { finalize } from 'rxjs';
import { AuthService } from '@Core/services/auth.service';
import { ToastService } from '@Core/services/toast.service';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-recuperacao', imports: [ReactiveFormsModule, RouterLink], templateUrl: './recuperacao.component.html' })
export class RecuperacaoComponent {
  private readonly builder = inject(NonNullableFormBuilder);
  readonly form = this.builder.group({  email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]] });
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  pending = false;
  showPassword = false;
  error = '';
  message = '';
  submit(): void {
    this.error = ''; this.message = '';
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error = this.form.controls.email.hasError('required') ? 'Preencha o e-mail.' : 'Informe um e-mail válido.'; return; }
    if (this.pending) return;
    this.pending = true;
    this.auth.recover(this.form.controls.email.value.trim()).pipe(finalize(() => this.pending = false)).subscribe({
      next: () => { this.message = 'Se houver uma conta vinculada a esse e-mail, você receberá as instruções de recuperação.'; this.toast.success(this.message); },
      error: () => { this.error = 'Não foi possível concluir. Tente novamente.'; }
    });
  }
}
