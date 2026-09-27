import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

/** Thin gradient bar at the top of the page reflecting scroll progress. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scroll-progress',
  template: `<div class="scroll-progress"></div>`,
})
export class ScrollProgress implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private bar?: HTMLElement;
  private ticking = false;

  ngAfterViewInit(): void {
    this.bar = this.host.nativeElement.querySelector<HTMLElement>('.scroll-progress') ?? undefined;
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });
    this.update();
  }

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  };

  private update(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? doc.scrollTop / max : 0;
    this.bar?.style.setProperty('--progress', `${Math.min(1, Math.max(0, progress))}`);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }
}
