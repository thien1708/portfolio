import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pf-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** index.html applies the class before bootstrap; mirror it here. */
  readonly dark = signal(document.documentElement.classList.contains('dark'));

  toggle(): void {
    this.dark.update((d) => !d);
    document.documentElement.classList.toggle('dark', this.dark());
    try {
      localStorage.setItem(STORAGE_KEY, this.dark() ? 'dark' : 'light');
    } catch {
      // storage unavailable (private mode) — theme just won't persist
    }
  }
}
