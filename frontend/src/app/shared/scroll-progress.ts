import { Component, ElementRef, HostListener, inject } from '@angular/core';

/** Thin gradient bar at the top of the page reflecting scroll progress. */
@Component({
  selector: 'app-scroll-progress',
  template: `<div class="scroll-progress"></div>`,
})
export class ScrollProgress {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? doc.scrollTop / max : 0;
    const bar = this.host.nativeElement.querySelector<HTMLElement>('.scroll-progress');
    bar?.style.setProperty('--progress', `${Math.min(1, Math.max(0, progress))}`);
  }
}
