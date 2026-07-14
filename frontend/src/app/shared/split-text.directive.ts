import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
} from '@angular/core';

/**
 * Splits the host's text into per-letter spans that rise, unblur and fade
 * in with a stagger once the element scrolls into view.
 *
 * Usage: <span appSplitText>Name</span>
 *        <span appSplitText="gradient">Name</span>  // each letter gradient
 */
@Directive({
  selector: '[appSplitText]',
})
export class SplitTextDirective implements AfterViewInit, OnDestroy {
  readonly appSplitText = input<'' | 'gradient'>('');
  /** Per-letter stagger in ms. */
  readonly stagger = input(45);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const text = host.textContent ?? '';
    host.textContent = '';
    host.setAttribute('aria-label', text);

    const gradient = this.appSplitText() === 'gradient';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'split-letter' + (gradient ? ' gradient-text' : '');
      span.setAttribute('aria-hidden', 'true');
      span.style.transitionDelay = `${i * this.stagger()}ms`;
      span.textContent = ch === ' ' ? ' ' : ch;
      host.appendChild(span);
    });

    const reveal = () =>
      host.querySelectorAll('.split-letter').forEach((s) => s.classList.add('split-in'));

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    this.observer.observe(host);
    // Fallback for above-the-fold headings that may not trigger IO.
    requestAnimationFrame(() => {
      const rect = host.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        reveal();
        this.observer?.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
