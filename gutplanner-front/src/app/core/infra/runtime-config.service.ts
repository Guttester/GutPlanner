import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@Environments/enviroments';
@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  apiUrl = environment.apiUrl;
  async load(): Promise<void> {
    if (!environment.production) return;
    const config = await firstValueFrom(new HttpClient(inject(HttpBackend)).get<{ apiUrl: unknown }>('/app-config.json'));
    // Same-origin via Caddy: cookies e XSRF permanecem no domínio da aplicação.
    if (typeof config.apiUrl !== 'string' || !/^\/[a-zA-Z0-9/_-]+$/.test(config.apiUrl) || config.apiUrl.startsWith('//')) throw new Error('Configuração pública da API inválida.');
    this.apiUrl = config.apiUrl.replace(/\/+$/, '');
  }
}
