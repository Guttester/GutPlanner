import { RuntimeConfigService } from './runtime-config.service';
import { inject, InjectionToken } from '@angular/core';
import { environment } from '@Environments/enviroments';

export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root', factory: () => inject(RuntimeConfigService).apiUrl.replace(/\/+$/, '')
});

export const PROFILE_API_URL = new InjectionToken<string>('PROFILE_API_URL', {
  providedIn: 'root', factory: () => environment.profileApiUrl.replace(/\/+$/, '')
});

export const DEMO_MODE = new InjectionToken<boolean>('DEMO_MODE', { providedIn: 'root', factory: () => environment.demoMode });
