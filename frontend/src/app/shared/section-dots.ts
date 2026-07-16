import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

interface Dot {
  id: string;
  label: string;
}

/** Fixed vertical dots (desktop) marking each section, with active state. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-section-dots',
  template: `
    <nav
      class="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
      aria-label="Section navigation"
    >
      @for (dot of dots; track dot.id) {
        <button
          type="button"
          class="group relative flex items-center"
          (click)="go(dot.id)"
          [attr.aria-label]="dot.label"
        >
          <span
            class="pointer-events-none absolute right-6 whitespace-nowrap rounded-lg bg-white/80 px-2.5 py-1 text-xs font-medium text-lav-700 opacity-0 shadow-soft backdrop-blur transition-all duration-200 group-hover:-translate-x-1 group-hover:opacity-100 dark:bg-[#232048]/80 dark:text-lav-200"
          >
            {{ dot.label }}
          </span>
          <span class="nav-dot" [class.is-active]="active() === dot.id"></span>
        </button>
      }
    </nav>
  `,
})
export class SectionDots implements OnInit, OnDestroy {
  protected readonly active = signal('hero');

  protected readonly dots: Dot[] = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.active.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    setTimeout(() => {
      for (const dot of this.dots) {
        const el = document.getElementById(dot.id);
        if (el) {
          this.observer?.observe(el);
        }
      }
    });
  }

  protected go(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
