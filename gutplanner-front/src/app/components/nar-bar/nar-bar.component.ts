import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ThemeService } from '../../core/infra/theme.service';
import { ProfileService } from '../../core/services/profile.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nar-bar',
  imports: [RouterLink],
  templateUrl: './nar-bar.component.html',
  styleUrl: './nar-bar.component.css',
  host: { '(keydown.escape)': 'closeMenu()' }
})
export class NarBarComponent {
  readonly themeService = inject(ThemeService);
  private readonly profileService = inject(ProfileService);
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  private readonly profile = toSignal(this.profileService.getProfile().pipe(
    catchError(() => of(null))
  ), { initialValue: null });

  readonly isMenuOpen = signal(false);
  readonly githubUrl = computed(() => this.socialUrl(this.profile()?.github, 'github.com', 'https://github.com/Guttester'));
  readonly linkedinUrl = computed(() => this.socialUrl(this.profile()?.linkedin, 'linkedin.com', 'https://www.linkedin.com/in/augusto-henrique-55b749236/'));

  toggleMenu(): void {
    this.isMenuOpen.update(isOpen => !isOpen);
  }

  closeMenu(): void {
    if (!this.isMenuOpen()) return;
    this.isMenuOpen.set(false);
    this.menuButton()?.nativeElement.focus();
  }

  private socialUrl(value: unknown, hostname: string, fallback: string): string {
    if (typeof value !== 'string') return fallback;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && [hostname, `www.${hostname}`].includes(url.hostname) && !url.username && !url.password
        ? url.href
        : fallback;
    } catch {
      return fallback;
    }
  }
}
