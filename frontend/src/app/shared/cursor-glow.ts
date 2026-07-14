import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
} from '@angular/core';

/**
 * Soft radial glow that trails the pointer on fine-pointer devices. Purely
 * decorative and non-interactive; hidden on touch and reduced-motion.
 */
@Component({
  selector: 'app-cursor-glow',
  template: `<div class="cursor-glow" #glow></div>`,
})
export class CursorGlow implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerleave', this.onLeave);
    this.loop();
  }

  private readonly onMove = (e: PointerEvent): void => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    this.glow?.classList.add('is-active');
  };

  private readonly onLeave = (): void => {
    this.glow?.classList.remove('is-active');
  };

  private readonly loop = (): void => {
    // Ease toward the pointer for a smooth trailing feel.
    this.curX += (this.targetX - this.curX) * 0.15;
    this.curY += (this.targetY - this.curY) * 0.15;
    this.glow?.style.setProperty('--cx', `${this.curX}px`);
    this.glow?.style.setProperty('--cy', `${this.curY}px`);
    this.raf = requestAnimationFrame(this.loop);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerleave', this.onLeave);
  }
}
