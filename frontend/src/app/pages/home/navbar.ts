import { Component, HostListener, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { ThemeService } from '../../core/theme.service';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      [class.py-2]="scrolled()"
      [class.py-4]="!scrolled()"
    >
      <nav
        class="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-6"
        [class.glass]="scrolled() || menuOpen()"
        [class.mx-4]="scrolled()"
        [class.sm:mx-auto]="true"
      >
        <a
          class="cursor-pointer font-display text-lg font-extrabold tracking-tight"
          (click)="scrollTo('hero')"
        >
          <span class="gradient-text">{{ brand() }}</span>
        </a>

        <ul class="hidden items-center gap-1 md:flex">
          @for (link of links; track link.id) {
            <li>
              <button
                type="button"
                class="rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-lav-100/70 dark:hover:bg-lav-800/40"
                [class.text-lav-600]="active() === link.id"
                [class.dark:text-lav-300]="active() === link.id"
                [class.font-semibold]="active() === link.id"
                (click)="scrollTo(link.id)"
              >
                {{ link.label }}
              </button>
            </li>
          }
        </ul>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl text-lg transition-all duration-300 hover:bg-lav-100/70 hover:rotate-12 dark:hover:bg-lav-800/40"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (theme.dark()) { ☀️ } @else { 🌙 }
          </button>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl text-xl md:hidden"
            (click)="menuOpen.set(!menuOpen())"
            aria-label="Toggle menu"
          >
            @if (menuOpen()) { ✕ } @else { ☰ }
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div class="glass mx-4 mt-2 overflow-hidden rounded-2xl md:hidden">
          <ul class="flex flex-col p-2">
            @for (link of links; track link.id) {
              <li>
                <button
                  type="button"
                  class="w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-lav-100/70 dark:hover:bg-lav-800/40"
                  [class.text-lav-600]="active() === link.id"
                  [class.dark:text-lav-300]="active() === link.id"
                  (click)="scrollTo(link.id); menuOpen.set(false)"
                >
                  {{ link.label }}
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </header>
  `,
})
export class Navbar implements OnInit, OnDestroy {
  readonly brand = input('TVT');

  protected readonly theme = inject(ThemeService);
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly active = signal('hero');

  protected readonly links: NavLink[] = [
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
      { rootMargin: '-35% 0px -55% 0px' },
    );
    // Sections render immediately (skeletons included), observe after paint.
    setTimeout(() => {
      for (const id of ['hero', ...this.links.map((l) => l.id)]) {
        const section = document.getElementById(id);
        if (section) {
          this.observer?.observe(section);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
