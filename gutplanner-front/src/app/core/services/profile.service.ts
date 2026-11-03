import { PROFILE_API_URL } from '@Core/infra/api.config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '@Core/model/Profile';

@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = inject(PROFILE_API_URL);
  private readonly apiUrl = `${this.baseUrl}/profile`;
  private readonly adminApiUrl = `${this.baseUrl}/admin/profile`;

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(this.adminApiUrl, profile);
  }
}
