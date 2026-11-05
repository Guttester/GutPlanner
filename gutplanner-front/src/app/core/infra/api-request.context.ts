import { HttpContextToken } from '@angular/common/http';
export const SILENT_API_ERROR = new HttpContextToken(() => false);
export const AUTH_REQUEST = new HttpContextToken(() => false);
