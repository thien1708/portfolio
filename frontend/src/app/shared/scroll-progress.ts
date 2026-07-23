import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';

/** Thin gradient bar at the top of the page reflecting scroll progress. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scroll-progress',
  template: `<div class="scroll-progress"></div>`,
})
export class ScrollProgress implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private bar?: HTMLElement;

  ngAfterViewInit(): void {
    this.bar = this.host.nativeElement.querySelector<HTMLElement>('.scroll-progress') ?? undefined;
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? doc.scrollTop / max : 0;
    this.bar?.style.setProperty('--progress', `${Math.min(1, Math.max(0, progress))}`);
  }
}
