import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/i18n.service';
import { Icon } from '../shared/icon';

/** 404 — a lost ringed planet drifting in the same pastel space theme. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  imports: [RouterLink, Icon],
  template: `
    <main class="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-lav-50 via-peri-100/60 to-sky2-100 px-6 dark:from-[#181630] dark:via-[#1e1a3f] dark:to-[#16213a]">
      <div class="pointer-events-none absolute inset-0">
        <div class="aurora-blob -left-24 -top-24 h-[28rem] w-[28rem] bg-lav-400/40 animate-aurora dark:bg-lav-600/25"></div>
        <div class="aurora-blob bottom-0 right-0 h-[26rem] w-[26rem] bg-sky2-300/40 animate-aurora-slow dark:bg-sky2-500/15"></div>
        @for (star of stars; track $index) {
          <span
            class="absolute rounded-full bg-lav-400/60 dark:bg-lav-200/50 animate-float"
            [style.left.%]="star.x"
            [style.top.%]="star.y"
            [style.width.px]="star.size"
            [style.height.px]="star.size"
            [style.animation-delay]="star.delay + 's'"
          ></span>
        }
      </div>

      <div class="relative text-center">
        <svg viewBox="0 0 64 64" aria-hidden="true" class="mx-auto mb-8 h-36 w-36 animate-float sm:h-44 sm:w-44" style="animation-duration: 7s">
          <defs>
            <linearGradient id="nf-planet" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#b8b5ff" />
              <stop offset="0.55" stop-color="#9d8df1" />
              <stop offset="1" stop-color="#7fc3de" />
            </linearGradient>
            <linearGradient id="nf-ring" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#a8d8ea" />
              <stop offset="1" stop-color="#cfc5ff" />
            </linearGradient>
          </defs>
          <path d="M 8.5 40.5 A 26 9.5 -22 0 1 43 19.5" fill="none" stroke="url(#nf-ring)" stroke-width="2.6" stroke-linecap="round" opacity="0.85" />
          <circle cx="32" cy="32" r="14.5" fill="url(#nf-planet)" />
          <path d="M 55.5 23.5 A 26 9.5 -22 0 1 21 44.5" fill="none" stroke="url(#nf-ring)" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="27" cy="27" r="5.5" fill="#ffffff" opacity="0.25" />
        </svg>

        <p class="font-display text-7xl font-extrabold tracking-tight sm:text-8xl">
          <span class="gradient-text">404</span>
        </p>
        <h1 class="mt-4 font-display text-2xl font-bold sm:text-3xl">{{ i18n.t('notfound.title') }}</h1>
        <p class="mx-auto mt-3 max-w-md text-ink/70 dark:text-lav-100/70">{{ i18n.t('notfound.blurb') }}</p>
        <a routerLink="/" class="btn-primary mt-8 inline-flex">
          <app-icon name="rocket" /> {{ i18n.t('notfound.home') }}
        </a>
      </div>
    </main>
  `,
})
export class NotFound {
  protected readonly i18n = inject(I18nService);

  protected readonly stars = Array.from({ length: 12 }, (_, i) => ({
    x: (i * 41) % 100,
    y: (i * 29) % 92 + 4,
    size: 3 + (i % 3) * 2,
    delay: (i % 6) * 0.9,
  }));
}
