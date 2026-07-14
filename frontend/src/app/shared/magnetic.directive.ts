import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

const FINE_POINTER = () =>
  typeof matchMedia === 'undefined' || matchMedia('(pointer: fine)').matches;

const REDUCED = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Pulls the host toward the pointer while hovering, creating a "magnetic"
 * button feel. No-op on touch / reduced-motion. Pairs with `.magnetic`.
 */
@Directive({
  selector: '[appMagnetic]',
  host: { class: 'magnetic' },
})
export class MagneticDirective {
  /** Pull strength (0–1 of the offset from center). */
  readonly strength = input(0.4);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (REDUCED() || !FINE_POINTER()) {
      return;
    }
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * this.strength();
    const y = (event.clientY - rect.top - rect.height / 2) * this.strength();
    this.el.nativeElement.style.transform = `translate(${x}px, ${y}px)`;
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.el.nativeElement.style.transform = 'translate(0, 0)';
  }
}
