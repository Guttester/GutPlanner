import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api.config';
import { AUTH_REQUEST, SILENT_API_ERROR } from './api-request.context';
import { ToastService } from '@Core/services/toast.service';
import { AuthService } from '@Core/services/auth.service';
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const api = inject(API_URL);
  // Não encaminhar credenciais ou tratar respostas da API pública de perfil como sessão local.
  if (request.url !== api && !request.url.startsWith(api + '/')) return next(request);
  const toast = inject(ToastService); const auth = inject(AuthService); const router = inject(Router);
  return next(request.clone({ withCredentials: true })).pipe(catchError((error: HttpErrorResponse) => {
    const authRequest = request.context.get(AUTH_REQUEST);
    if (error.status === 401 && !authRequest) {
      auth.expire();
      if (router.url.startsWith('/user')) void router.navigate(['/'], { queryParams: { returnUrl: router.url } });
    }
    if (!request.context.get(SILENT_API_ERROR) || error.status !== 401) {
      const messages: Record<number, string> = { 0: 'Não foi possível conectar à API. Tente novamente.', 400: 'Confira os dados informados.', 401: authRequest ? 'Não foi possível autenticar. Confira seus dados.' : 'Sua sessão expirou. Entre novamente.', 403: 'Você não tem permissão para essa ação.', 404: 'O recurso solicitado não está disponível.', 409: 'A operação não pôde ser concluída por um conflito de dados.', 413: 'O arquivo ultrapassa o limite permitido.', 422: 'Confira os campos enviados.', 429: 'Muitas tentativas. Aguarde antes de tentar novamente.' };
      toast.error(messages[error.status] ?? 'Não foi possível concluir a operação. Tente novamente.');
    }
    return throwError(() => error);
  }));
};
