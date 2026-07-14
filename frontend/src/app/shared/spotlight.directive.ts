import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Tracks the pointer over the host and exposes its position as the
 * --mx / --my CSS custom properties, which the `.spotlight` class turns
 * into a radial glow. Add both `spotlight` (class) and `appSpotlight`.
 */
@Directive({
  selector: '[appSpotlight]',
  host: { class: 'spotlight' },
})
export class SpotlightDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.el.nativeElement.style.setProperty('--mx', `${x}%`);
    this.el.nativeElement.style.setProperty('--my', `${y}%`);
  }
}
