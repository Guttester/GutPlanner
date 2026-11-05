import { Component, ElementRef, OnDestroy, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NarBarComponent } from '@Component/nar-bar/nar-bar.component';
import { API_URL } from '@Core/infra/api.config';

@Component({ selector: 'app-docs', imports: [NarBarComponent], templateUrl: './docs.component.html' })
export class DocsComponent implements OnDestroy {
  readonly apiUrl = inject(API_URL);
  readonly schemaUrl = `${this.apiUrl}/openapi.json`;
  private readonly http = inject(HttpClient);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('swagger');
  readonly loading = signal(true);
  readonly error = signal(false);
  private disposed = false;

  constructor() { afterNextRender(() => { void this.load(); }); }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      const [spec, module] = await Promise.all([firstValueFrom(this.http.get<object>(this.schemaUrl)), import('swagger-ui')]);
      if (this.disposed) return;
      module.default({
        domNode: this.container().nativeElement, spec, layout: 'BaseLayout',
        deepLinking: false, filter: true, docExpansion: 'none', validatorUrl: 'none',
        persistAuthorization: false, displayRequestDuration: true,
        requestInterceptor: async request => {
          const url = new URL(request['url'], window.location.origin);
          if (url.origin !== window.location.origin || !url.pathname.startsWith(`${this.apiUrl}/`)) throw new Error('Destino de API invÃ¡lido.');
          request['credentials'] = 'same-origin';
          if (!['GET', 'HEAD', 'OPTIONS'].includes(request['method'].toUpperCase())) {
            const response = await fetch(`${this.apiUrl}/auth/csrf`, { credentials: 'same-origin' });
            if (!response.ok) throw new Error('NÃ£o foi possÃ­vel preparar a requisiÃ§Ã£o.');
            const token = document.cookie.split('; ').find(item => item.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=');
            if (token) request['headers']['X-XSRF-TOKEN'] = decodeURIComponent(token);
          }
          return request;
        }
      });
    } catch (error) { console.error('Falha ao carregar Swagger UI:', error); if (!this.disposed) this.error.set(true); }
    finally { if (!this.disposed) this.loading.set(false); }
  }

  ngOnDestroy(): void { this.disposed = true; this.container().nativeElement.replaceChildren(); }
}
