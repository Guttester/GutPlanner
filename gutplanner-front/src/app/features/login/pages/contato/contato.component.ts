import { Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucideExternalLink, lucideCopy } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { NarBarComponent } from '@Component/nar-bar/nar-bar.component';
import { ProfileService } from '@Core/services/profile.service';
import { Profile } from '@Core/model/Profile';

interface ContactState {
  profile: Profile | null;
  status: 'loading' | 'ready' | 'error';
}

interface ContactChannel {
  id: string;
  title: string;
  value: string;
  url: string | null;
}

@Component({
  selector: 'app-contato',
  imports: [NarBarComponent, RouterLink, NgIcon, NgTemplateOutlet],
  providers: [provideIcons({ lucideMail, lucideExternalLink, lucideCopy })],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.css'
})
export class ContatoComponent {
  message = '';
  async copyContact(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.message = 'Contato copiado.';
    } catch { this.message = 'Não foi possível copiar. Selecione o contato e copie manualmente.'; }
  }
  private readonly profileService = inject(ProfileService);
  readonly profileState = toSignal(this.profileService.getProfile().pipe(
    map((profile): ContactState => ({ profile, status: 'ready' })),
    catchError(() => of<ContactState>({ profile: null, status: 'error' }))
  ), { initialValue: { profile: null, status: 'loading' } as ContactState });

  readonly channels = computed(() => {
    const profile = this.profileState().profile;
    const definitions = [
      { id: 'email', title: 'E-mail', value: profile?.email },
      { id: 'discord', title: 'Discord', value: profile?.discord },
      { id: 'github', title: 'GitHub', value: profile?.github },
      { id: 'linkedin', title: 'LinkedIn', value: profile?.linkedin }
    ];
    return definitions.filter(item => typeof item.value === 'string' && item.value.trim())
      .map((item): ContactChannel => ({
        id: item.id, title: item.title, value: item.value!.trim(),
        url: this.contactUrl(item.id, item.value!.trim())
      }));
  });

  private contactUrl(type: string, value: string): string | null {
    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${encodeURIComponent(value)}` : null;
    }
    const allowedHosts: Record<string, string[]> = {
      github: ['github.com', 'www.github.com'],
      linkedin: ['linkedin.com', 'www.linkedin.com'],
      discord: ['discord.com', 'www.discord.com', 'discord.gg']
    };
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && allowedHosts[type]?.includes(url.hostname) && !url.username && !url.password ? url.href : null;
    } catch {
      return null;
    }
  }
}
