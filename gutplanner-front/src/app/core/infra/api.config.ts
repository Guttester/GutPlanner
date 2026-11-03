import { InjectionToken } from '@angular/core';
import { environment } from '@Environments/enviroments';

export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root', factory: () => environment.apiUrl.replace(/\/+$/, '')
});

export const PROFILE_API_URL = new InjectionToken<string>('PROFILE_API_URL', {
  providedIn: 'root', factory: () => environment.profileApiUrl.replace(/\/+$/, '')
});
