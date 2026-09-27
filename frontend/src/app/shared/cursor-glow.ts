import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

/**
 * Soft radial glow that trails the pointer on fine-pointer devices. Purely
 * decorative and non-interactive; hidden on touch and reduced-motion.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cursor-glow',
  template: `<div class="cursor-glow" #glow></div>`,
})
export class CursorGlow implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private glow?: HTMLElement;
  private raf = 0;
  private targetX = -9999;
  private targetY = -9999;
  private curX = -9999;
  private curY = -9999;

  ngAfterViewInit(): void {
    if (
      typeof matchMedia === 'undefined' ||
      !matchMedia('(pointer: fine)').matches ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    this.glow = this.host.nativeElement.querySelector<HTMLElement>('.cursor-glow') ?? undefined;

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  private readonly onMove = (e: PointerEvent): void => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    this.glow?.classList.add('is-active');
    if (!this.raf) {
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  private readonly onLeave = (): void => {
    this.glow?.classList.remove('is-active');
  };

  private readonly loop = (): void => {
    const dx = this.targetX - this.curX;
    const dy = this.targetY - this.curY;

    if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
      this.curX += dx * 0.15;
      this.curY += dy * 0.15;
      this.glow?.style.setProperty('--cx', `${this.curX}px`);
      this.glow?.style.setProperty('--cy', `${this.curY}px`);
      this.raf = requestAnimationFrame(this.loop);
    } else {
      this.curX = this.targetX;
      this.curY = this.targetY;
      this.glow?.style.setProperty('--cx', `${this.curX}px`);
      this.glow?.style.setProperty('--cy', `${this.curY}px`);
      this.raf = 0;
    }
  };

  ngOnDestroy(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerleave', this.onLeave);
  }
}
