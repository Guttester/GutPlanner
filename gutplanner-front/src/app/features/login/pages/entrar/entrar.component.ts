import { finalize } from 'rxjs';
import { AuthService } from '@Core/services/auth.service';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-entrar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './entrar.component.html'
})
export class EntrarComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  readonly form = this.formBuilder.group({
    username: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', Validators.required]
  });
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  pending = false;
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
    if (this.pending) return;
    this.form.controls.username.setValue(this.form.controls.username.value.trim());
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.pending = true;
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).pipe(finalize(() => this.pending = false)).subscribe({
      next: () => {
        this.form.controls.password.reset();
        const target = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(target && /^\/user(?:[/?#]|$)/.test(target) && !target.includes('\\') ? target : '/user');
      },
      error: () => { this.form.controls.password.reset(); }
    });
  }
}
