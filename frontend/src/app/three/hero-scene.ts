import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import type { HeroSceneEngine } from './hero-scene.engine';

/**
 * Mount point for the Three.js hero background. The engine (and three.js
 * itself) is pulled in via dynamic import after first paint, so it ships as
 * a separate lazy chunk and costs the initial bundle nothing. Skipped
 * entirely when WebGL is unavailable — the CSS aurora underneath remains.
 * Purely decorative; no pointer interaction.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hero-scene',
  template: `<div class="absolute inset-0 overflow-hidden" aria-hidden="true"></div>`,
})
export class HeroScene implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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
