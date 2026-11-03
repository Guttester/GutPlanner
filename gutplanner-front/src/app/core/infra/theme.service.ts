import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkTheme = signal(true);
  readonly isDark = this.darkTheme.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
  }

  toggleTheme(): void {
    this.darkTheme.update(isDark => !isDark);
  }
}
