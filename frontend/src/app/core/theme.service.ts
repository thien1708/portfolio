import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pf-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** index.html applies the class before bootstrap; mirror it here. */
  readonly dark = signal(document.documentElement.classList.contains('dark'));

  /**
   * Toggle the theme. When the browser supports the View Transitions API
   * (and motion is allowed), the new theme is revealed with a circular wipe
   * expanding from the click coordinates.
   */
  toggle(origin?: { x: number; y: number }): void {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduce =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!doc.startViewTransition || reduce || !origin) {
      this.apply();
      return;
    }

    const transition = doc.startViewTransition(() => this.apply());
    transition.ready.then(() => {
      const { x, y } = origin;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  }

  private apply(): void {
    this.dark.update((d) => !d);
    document.documentElement.classList.toggle('dark', this.dark());
    try {
      localStorage.setItem(STORAGE_KEY, this.dark() ? 'dark' : 'light');
    } catch {
      // storage unavailable (private mode) — theme just won't persist
    }
  }
}
