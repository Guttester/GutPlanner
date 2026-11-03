import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ProfileService } from '../../../../core/services/profile.service';
import { Profile } from '../../../../core/model/Profile';

import { ContatoComponent } from './contato.component';

describe('ContatoComponent', () => {
  let component: ContatoComponent;
  let fixture: ComponentFixture<ContatoComponent>;
  let profileResponse: Subject<Profile>;

  beforeEach(async () => {
    profileResponse = new Subject<Profile>();
    await TestBed.configureTestingModule({
      imports: [ContatoComponent],
      providers: [
        provideRouter([]),
        { provide: ProfileService, useValue: { getProfile: () => profileResponse.asObservable() } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#contact-loading')).not.toBeNull();
  });

  it('renders contact channels returned by ProfileService', () => {
    profileResponse.next({ email: 'suporte@example.com', discord: 'guttester', github: 'https://github.com/Guttester', linkedin: '' });
    fixture.detectChanges();
    const email: HTMLAnchorElement = fixture.nativeElement.querySelector('#contact-email-link');
    expect(email.href).toBe('mailto:suporte%40example.com');
    expect(fixture.nativeElement.querySelector('#contact-discord').textContent).toContain('guttester');
    expect(fixture.nativeElement.querySelector('#contact-github-link').href).toBe('https://github.com/Guttester');
  });

  it('does not create unsafe links from remote profile data', () => {
    profileResponse.next({ email: '', discord: '', github: 'javascript:alert(1)', linkedin: 'https://linkedin.com.evil.example' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#contact-github-link')).toBeNull();
    expect(fixture.nativeElement.querySelector('#contact-linkedin-link')).toBeNull();
  });

  it('shows an error when the public profile is unavailable', () => {
    profileResponse.error(new Error('Unavailable'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#contact-error').getAttribute('role')).toBe('alert');
  });

  it('shows an empty state when no channels have been registered', () => {
    profileResponse.next({ email: '', discord: '', github: '', linkedin: '' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#contact-empty')).not.toBeNull();
  });
});
