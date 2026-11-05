import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '@Core/services/auth.service';
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService).restore().pipe(map(authenticated => authenticated || router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } })));
};
