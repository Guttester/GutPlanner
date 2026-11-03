import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProfileService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads the public profile from GutTester', () => {
    const profile = { github: 'https://github.com/Guttester', linkedin: '', email: '', discord: '' };
    service.getProfile().subscribe(result => expect(result).toEqual(profile));
    const request = http.expectOne('https://guttester.io/profile');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBeFalse();
    request.flush(profile);
  });
});
