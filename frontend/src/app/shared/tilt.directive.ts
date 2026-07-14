import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

const REDUCED = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

const FINE_POINTER = () =>
  typeof matchMedia === 'undefined' || matchMedia('(pointer: fine)').matches;

/**
 * Subtle 3D tilt toward the pointer. Disabled for touch devices and when
 * the user prefers reduced motion. Pairs with the `.tilt` class.
 */
@Directive({
  selector: '[appTilt]',
  host: { class: 'tilt' },
})
export class TiltDirective {
  /** Maximum rotation in degrees. */
  readonly appTilt = input(7);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (REDUCED() || !FINE_POINTER()) {
      return;
    }
    const rect = this.el.nativeElement.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const max = this.appTilt();
    this.el.nativeElement.style.setProperty('--ry', `${px * max}deg`);
    this.el.nativeElement.style.setProperty('--rx', `${-py * max}deg`);
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.el.nativeElement.style.setProperty('--rx', '0deg');
    this.el.nativeElement.style.setProperty('--ry', '0deg');
  }
}
