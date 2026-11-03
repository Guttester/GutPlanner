import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-entrar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './entrar.component.html'
})
export class EntrarComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['', Validators.required]
  });
  senhaVisivel = false;

  get usuarioInvalido(): boolean {
    const control = this.form.controls.username;
    return control.invalid && control.touched;
  }

  get senhaInvalida(): boolean {
    const control = this.form.controls.password;
    return control.invalid && control.touched;
  }

  login(): void {
    void this.router.navigateByUrl('/user');
  }
}
