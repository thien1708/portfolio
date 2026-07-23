import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import type { HeroSceneEngine } from './hero-scene.engine';
import { I18nService } from '../core/i18n.service';

interface PlanetHover {
  label: string;
  x: number;
  y: number;
}

/**
 * Mount point for the Three.js hero background. The engine (and three.js
 * itself) is pulled in via dynamic import after first paint, so it ships as
 * a separate lazy chunk and costs the initial bundle nothing. Skipped
 * entirely when WebGL is unavailable — the CSS aurora underneath remains.
 *
 * Planets double as navigation: hovering shows the tech they represent,
 * clicking scrolls to the skills section.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hero-scene',
  template: `
    <div class="absolute inset-0 overflow-hidden" aria-hidden="true"></div>
    @if (hover(); as h) {
      <div
        class="glass pointer-events-none fixed z-40 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-lav-700 dark:text-lav-100"
        [style.left.px]="h.x + 14"
        [style.top.px]="h.y + 14"
      >
        {{ h.label }}
        <span class="font-normal text-lav-500 dark:text-lav-300">· {{ i18n.t('hero.planetHint') }}</span>
      </div>
    }
  `,
})
export class HeroScene implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  protected readonly i18n = inject(I18nService);

  protected readonly hover = signal<PlanetHover | null>(null);

  private engine?: HeroSceneEngine;
  private themeObserver?: MutationObserver;
  private destroyed = false;

  constructor() {
    afterNextRender(() => void this.boot());
  }

  private async boot(): Promise<void> {
    const mount = this.host.nativeElement.firstElementChild as HTMLElement | null;
    if (!mount || !supportsWebGL()) return;

    const reducedMotion =
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { HeroSceneEngine } = await import('./hero-scene.engine');
    if (this.destroyed) return;
    this.engine = new HeroSceneEngine(mount, reducedMotion);

    // The engine runs its rAF loop outside change detection; only hop back
    // into the zone when the hover state actually changes.
    this.engine.onPlanetHover = (label, x, y) => {
      const current = this.hover();
      if (label === null) {
        if (current !== null) this.zone.run(() => this.hover.set(null));
        return;
      }
      if (current?.label !== label || current.x !== x || current.y !== y) {
        this.zone.run(() => this.hover.set({ label, x, y }));
      }
    };
    this.engine.onPlanetSelect = () => {
      this.zone.run(() => {
        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
      });
    };

    // The navbar theme toggle flips a class on <html>; follow it live.
    this.themeObserver = new MutationObserver(() => {
      this.engine?.setTheme(document.documentElement.classList.contains('dark'));
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.themeObserver?.disconnect();
    this.engine?.dispose();
  }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
  } catch {
    return false;
  }
}
