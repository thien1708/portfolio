import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ThemeService } from '../../core/theme.service';
import { I18nService } from '../../core/i18n.service';
import { Icon } from '../../shared/icon';
import { MagneticDirective } from '../../shared/magnetic.directive';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-navbar',
  imports: [Icon, MagneticDirective],
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
          href="#hero"
          class="cursor-pointer font-display text-lg font-extrabold tracking-tight"
          (click)="scrollToBrand($event)"
        >
          <span class="gradient-text">{{ brand() }}</span>
        </a>

        <ul #linkList class="relative hidden items-center gap-1 md:flex">
          <span
            class="nav-pill"
            [style.opacity]="pill().visible ? 1 : 0"
            [style.transform]="'translateX(' + pill().x + 'px)'"
            [style.width.px]="pill().width"
          ></span>
          @for (link of links(); track link.id) {
            <li class="relative z-10">
              <button
                type="button"
                [attr.data-nav]="link.id"
                class="rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:text-lav-600 dark:hover:text-lav-300"
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
            class="grid h-10 min-w-10 place-items-center rounded-xl px-2 font-display text-xs font-bold uppercase tracking-wider text-lav-600 transition-all duration-300 hover:bg-lav-100/70 dark:text-lav-300 dark:hover:bg-lav-800/40"
            (click)="i18n.toggle()"
            [attr.aria-label]="i18n.lang() === 'en' ? 'Chuyển sang tiếng Việt' : 'Switch to English'"
          >
            {{ i18n.lang() === 'en' ? 'VI' : 'EN' }}
          </button>
          <button
            type="button"
            appMagnetic
            class="grid h-10 w-10 place-items-center rounded-xl text-lg text-lav-600 transition-all duration-300 hover:bg-lav-100/70 dark:text-lav-300 dark:hover:bg-lav-800/40"
            (click)="toggleTheme($event)"
            [attr.aria-label]="theme.dark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (theme.dark()) {
              <app-icon name="sun" />
            } @else {
              <app-icon name="moon" />
            }
          </button>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl text-xl text-lav-600 dark:text-lav-300 md:hidden"
            (click)="menuOpen.set(!menuOpen())"
            aria-label="Toggle menu"
          >
            @if (menuOpen()) {
              <app-icon name="close" />
            } @else {
              <app-icon name="menu" />
            }
          </button>
        </div>
      </nav>

      @if (menuOpen()) {
        <div class="glass mx-4 mt-2 overflow-hidden rounded-2xl md:hidden">
          <ul class="flex flex-col p-2">
            @for (link of links(); track link.id) {
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
export class Navbar implements OnInit, AfterViewInit, OnDestroy {
  readonly brand = input('TVT');

  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly active = signal('hero');
  protected readonly pill = signal<{ x: number; width: number; visible: boolean }>({
    x: 0,
    width: 0,
    visible: false,
  });

  protected readonly links = computed<NavLink[]>(() => {
    this.i18n.lang();
    return [
      { id: 'about', label: this.i18n.t('nav.about') },
      { id: 'skills', label: this.i18n.t('nav.skills') },
      { id: 'experience', label: this.i18n.t('nav.experience') },
      { id: 'projects', label: this.i18n.t('nav.projects') },
      { id: 'education', label: this.i18n.t('nav.education') },
      { id: 'contact', label: this.i18n.t('nav.contact') },
    ];
  });

  private readonly linkList = viewChild<ElementRef<HTMLElement>>('linkList');
  private observer?: IntersectionObserver;

  constructor() {
    // Reposition the sliding pill whenever the active section or the
    // language (label widths) changes.
    effect(() => {
      this.active();
      this.links();
      requestAnimationFrame(() => this.updatePill());
    });
  }

  protected toggleTheme(event: MouseEvent): void {
    this.theme.toggle({ x: event.clientX, y: event.clientY });
  }

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
    setTimeout(() => {
      for (const id of ['hero', ...this.links().map((l) => l.id)]) {
        const section = document.getElementById(id);
        if (section) {
          this.observer?.observe(section);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updatePill(), 100);
  }

  private updatePill(): void {
    const list = this.linkList()?.nativeElement;
    if (!list) {
      return;
    }
    const activeBtn = list.querySelector<HTMLElement>(`[data-nav="${this.active()}"]`);
    if (!activeBtn) {
      this.pill.set({ x: 0, width: 0, visible: false });
      return;
    }
    // Measure relative to the <ul> — each <li> is positioned, so offsetLeft
    // would be relative to the li, not the list.
    const listRect = list.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    this.pill.set({
      x: btnRect.left - listRect.left,
      width: btnRect.width,
      visible: true,
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
    this.updatePill();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updatePill();
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Brand link: keep the semantic href for a11y but scroll smoothly. */
  protected scrollToBrand(event: Event): void {
    event.preventDefault();
    this.scrollTo('hero');
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
