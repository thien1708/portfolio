import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Scroll-reveal: adds .reveal on init and .reveal-visible once the element
 * enters the viewport. Pairs with the CSS in styles.css; honours
 * prefers-reduced-motion (elements are simply visible).
 *
 * Usage: <div appReveal>…</div>
 *        <div appReveal="left" [revealDelay]="150">…</div>
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnInit, OnDestroy {
  readonly appReveal = input<'' | 'up' | 'left' | 'right' | 'scale'>('');
  readonly revealDelay = input(0);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;
  private revealed = false;

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('reveal');
    const direction = this.appReveal();
    if (direction === 'left') element.classList.add('from-left');
    if (direction === 'right') element.classList.add('from-right');
    if (direction === 'scale') element.classList.add('from-scale');
    if (this.revealDelay() > 0) {
      element.style.transitionDelay = `${this.revealDelay()}ms`;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.show();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.show();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(element);

    // Fallbacks for cases where IO does not fire (anchor deep-links,
    // headless rendering): check the viewport directly after layout and on
    // scroll/resize until revealed.
    requestAnimationFrame(() => this.checkViewport());
    window.addEventListener('scroll', this.checkViewport, { passive: true });
    window.addEventListener('resize', this.checkViewport, { passive: true });
  }

  private readonly checkViewport = (): void => {
    if (this.revealed) {
      return;
    }
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      this.show();
    }
  };

  private show(): void {
    if (this.revealed) {
      return;
    }
    this.revealed = true;
    this.el.nativeElement.classList.add('reveal-visible');
    this.cleanup();
  }

  private cleanup(): void {
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.checkViewport);
    window.removeEventListener('resize', this.checkViewport);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
