import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'pf-theme';
const ACCENT_KEY = 'pf-accent';

export interface ThemeAccent {
  id: string;
  name: string;
  icon: string;
  colors: string;
}

export const ACCENTS: ThemeAccent[] = [
  { id: 'default', name: 'Amethyst (Default)', icon: '🔮', colors: 'from-lav-500 to-peri-500' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡', colors: 'from-yellow-400 to-cyan-400' },
  { id: 'matrix', name: 'Matrix Hacker', icon: '💻', colors: 'from-emerald-400 to-green-500' },
  { id: 'tokyo-night', name: 'Tokyo Night', icon: '🌃', colors: 'from-sky-400 to-rose-400' },
  { id: 'dracula', name: 'Dracula', icon: '🧛', colors: 'from-purple-400 to-coral-400' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** index.html applies the class before bootstrap; mirror it here. */
  readonly dark = signal(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  
  readonly accent = signal<string>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(ACCENT_KEY) || 'default' : 'default'
  );

  constructor() {
    this.applyAccent(this.accent());
  }

  setAccent(accentId: string): void {
    this.accent.set(accentId);
    this.applyAccent(accentId);
    try {
      localStorage.setItem(ACCENT_KEY, accentId);
    } catch {
      // Ignore
    }
  }

  private applyAccent(accentId: string): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-accent', accentId);
  }

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
