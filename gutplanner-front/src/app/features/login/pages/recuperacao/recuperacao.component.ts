import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-recuperacao', imports: [ReactiveFormsModule, RouterLink], templateUrl: './recuperacao.component.html' })
export class RecuperacaoComponent {
  private readonly builder = inject(NonNullableFormBuilder);
  readonly form = this.builder.group({  email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]] });
  showPassword = false;
  error = '';
  message = '';
  submit(): void {
    this.error = ''; this.message = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error = 'Confira os campos obrigatórios e os valores informados.'; return; }
    this.message = 'Dados validados. O envio do e-mail de recuperação estará disponível após a integração com a API.';
  }
}
