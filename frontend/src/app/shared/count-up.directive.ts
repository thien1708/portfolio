import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Animates the element's text from 0 to the given number when it scrolls
 * into view. Usage: <span [appCountUp]="4" suffix="+"></span>
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements OnInit, OnDestroy {
  readonly appCountUp = input(0);
  readonly suffix = input('');
  readonly durationMs = input(1400);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private frame = 0;

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.textContent = `0${this.suffix()}`;

    if (typeof IntersectionObserver === 'undefined') {
      element.textContent = `${this.appCountUp()}${this.suffix()}`;
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.animate();
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(element);
  }

  private animate(): void {
    const target = this.appCountUp();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.el.nativeElement.textContent = `${target}${this.suffix()}`;
      return;
    }
    const duration = this.durationMs();
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.el.nativeElement.textContent = `${Math.round(eased * target)}${this.suffix()}`;
      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
  }
}
