import { finalize } from 'rxjs';
import { AuthService } from '@Core/services/auth.service';
import { ToastService } from '@Core/services/toast.service';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-cadastro', imports: [ReactiveFormsModule, RouterLink], templateUrl: './cadastro.component.html' })
export class CadastroComponent {
  private readonly builder = inject(NonNullableFormBuilder);
  readonly form = this.builder.group({ name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(1024)]], confirmation: ['', Validators.required], email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]] });
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  pending = false;
  showPassword = false;
  error = '';
  message = '';
  fieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.touched) return '';
    const labels: Record<string, string> = { name: 'nome', email: 'e-mail', password: 'senha', confirmation: 'confirmação da senha' };
    if (control.hasError('required') || control.hasError('pattern')) return `Preencha ${labels[field]}.`;
    if (control.hasError('email')) return 'Informe um e-mail válido.';
    if (control.hasError('minlength')) return 'A senha deve ter pelo menos 8 caracteres.';
    if (control.hasError('maxlength')) return `O campo ${labels[field]} excede o limite de caracteres.`;
    if (field === 'confirmation' && control.value !== this.form.controls.password.value) return 'A confirmação não corresponde à senha.';
    return '';
  }
  submit(): void {
    this.error = ''; this.message = '';
    this.form.controls.name.setValue(this.form.controls.name.value.trim());
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error = ['name', 'email', 'password', 'confirmation'].map(field => this.fieldError(field)).filter(Boolean).join(' '); return; }
    if (this.form.controls.password.value !== this.form.controls.confirmation.value) { this.error = 'A confirmação não corresponde à senha.'; return; }
    if (this.pending) return;
    this.pending = true;
    const { name, email, password } = this.form.getRawValue();
    this.auth.register(name.trim(), email.trim(), password).pipe(finalize(() => this.pending = false)).subscribe({
      next: () => { this.form.controls.password.reset(); this.form.controls.confirmation.reset(); this.message = 'Solicitação de cadastro processada. Você já pode tentar entrar com seu e-mail e senha.'; this.toast.success(this.message); },
      error: () => { this.error = 'Não foi possível concluir. Tente novamente.'; }
    });
  }
}
