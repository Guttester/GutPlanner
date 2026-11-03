import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-cadastro', imports: [ReactiveFormsModule, RouterLink], templateUrl: './cadastro.component.html' })
export class CadastroComponent {
  private readonly builder = inject(NonNullableFormBuilder);
  readonly form = this.builder.group({ name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]], confirmation: ['', Validators.required], email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]] });
  showPassword = false;
  error = '';
  message = '';
  submit(): void {
    this.error = ''; this.message = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.error = 'Confira os campos obrigatórios e os valores informados.'; return; }
    if (this.form.controls.password.value !== this.form.controls.confirmation.value) { this.error = 'A confirmação não corresponde à senha.'; return; }
    this.form.controls.password.reset(); this.form.controls.confirmation.reset();
    this.message = 'Dados validados. O cadastro da conta estará disponível após a integração com a API.';
  }
}
