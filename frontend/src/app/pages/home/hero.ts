import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Profile } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { MagneticDirective } from '../../shared/magnetic.directive';
import { TiltDirective } from '../../shared/tilt.directive';
import { SplitTextDirective } from '../../shared/split-text.directive';
import { HeroScene } from '../../three/hero-scene';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hero',
  template: `
    <section id="hero" class="relative flex min-h-screen items-center overflow-hidden pt-24">
      <!-- Aurora mesh background -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-br from-lav-50 via-peri-100/60 to-sky2-100 dark:from-[#181630] dark:via-[#1e1a3f] dark:to-[#16213a]"></div>
        <!-- Blobs drift up on scroll (native scroll-driven parallax) -->
        <div class="parallax-slow absolute inset-0">
          <div class="aurora-blob -left-24 -top-24 h-[30rem] w-[30rem] bg-lav-400/45 animate-aurora dark:bg-lav-600/30"></div>
          <div class="aurora-blob right-0 top-1/4 h-[32rem] w-[32rem] bg-sky2-300/45 animate-aurora-slow dark:bg-sky2-500/20"></div>
          <div class="aurora-blob bottom-0 left-1/3 h-[26rem] w-[26rem] bg-peri-400/45 animate-aurora dark:bg-peri-600/25" style="animation-delay: -8s"></div>
          <div class="aurora-blob right-1/4 bottom-1/4 h-72 w-72 bg-lav-300/40 animate-aurora-slow dark:bg-lav-500/15" style="animation-delay: -14s"></div>
        </div>
        <!-- Three.js galaxy + floating glass solids (lazy chunk, WebGL only) -->
        <app-hero-scene />
      </div>

      <div class="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 lg:grid-cols-[1.2fr_1fr]">
        <div class="order-2 text-center lg:order-1 lg:text-left">
          @if (profile(); as p) {
            <p appReveal class="mb-4 flex items-center justify-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-600 dark:text-lav-300 lg:justify-start">
              <app-icon name="hand" class="text-base" /> {{ i18n.t('hero.hello') }}
            </p>
            <h1 class="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span appSplitText="gradient">{{ p.fullName }}</span>
            </h1>
            <div appReveal [revealDelay]="200" class="mt-4 flex h-9 items-center justify-center font-display text-xl font-semibold text-lav-700 dark:text-lav-200 sm:text-2xl lg:justify-start">
              <span>{{ typed() }}</span>
              <span class="ml-0.5 inline-block h-6 w-[3px] rounded bg-lav-500 animate-blink sm:h-7"></span>
            </div>
            <p appReveal [revealDelay]="300" class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70 dark:text-lav-100/70 lg:mx-0">
              {{ p.summary }}
            </p>
            <div appReveal [revealDelay]="420" class="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <button type="button" appMagnetic class="btn-primary" (click)="scrollTo('projects')">
                <app-icon name="rocket" /> {{ i18n.t('hero.viewProjects') }}
              </button>
              @if (p.cvUrl) {
                <a appMagnetic class="btn-ghost" [href]="p.cvUrl" target="_blank" rel="noopener">
                  <app-icon name="download" /> {{ i18n.t('hero.downloadCv') }}
                </a>
              } @else {
                <button type="button" appMagnetic class="btn-ghost" (click)="scrollTo('contact')">
                  <app-icon name="mail" /> {{ i18n.t('hero.contactMe') }}
                </button>
              }
            </div>
            <div appReveal [revealDelay]="520" class="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              @if (p.githubUrl) {
                <a [href]="p.githubUrl" target="_blank" rel="noopener" aria-label="GitHub"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg text-lav-700 transition-all duration-300 hover:-translate-y-1 hover:text-lav-500 hover:shadow-glow dark:text-lav-200">
                  <app-icon name="github" />
                </a>
              }
              @if (p.linkedinUrl) {
                <a [href]="p.linkedinUrl" target="_blank" rel="noopener" aria-label="LinkedIn"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg text-lav-700 transition-all duration-300 hover:-translate-y-1 hover:text-lav-500 hover:shadow-glow dark:text-lav-200">
                  <app-icon name="linkedin" />
                </a>
              }
              @if (p.facebookUrl) {
                <a [href]="p.facebookUrl" target="_blank" rel="noopener" aria-label="Facebook"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg text-lav-700 transition-all duration-300 hover:-translate-y-1 hover:text-lav-500 hover:shadow-glow dark:text-lav-200">
                  <app-icon name="facebook" />
                </a>
              }
              <a [href]="'mailto:' + p.email" aria-label="Email"
                 class="glass grid h-11 w-11 place-items-center rounded-xl text-lg text-lav-700 transition-all duration-300 hover:-translate-y-1 hover:text-lav-500 hover:shadow-glow dark:text-lav-200">
                <app-icon name="mail" />
              </a>
            </div>
          } @else {
            <!-- Skeleton while profile loads -->
            <div class="space-y-5">
              <div class="skeleton mx-auto h-4 w-40 lg:mx-0"></div>
              <div class="skeleton mx-auto h-14 w-3/4 lg:mx-0"></div>
              <div class="skeleton mx-auto h-8 w-1/2 lg:mx-0"></div>
              <div class="skeleton mx-auto h-24 w-full max-w-xl lg:mx-0"></div>
              <div class="flex justify-center gap-4 lg:justify-start">
                <div class="skeleton h-12 w-40"></div>
                <div class="skeleton h-12 w-40"></div>
              </div>
            </div>
          }
        </div>

        <!-- Avatar -->
        <div class="order-1 flex justify-center lg:order-2">
          <div appReveal="scale" [appTilt]="10" class="relative">
            <div class="absolute -inset-3 rounded-full bg-gradient-to-tr from-lav-400 via-peri-400 to-sky2-300 opacity-70 blur-lg animate-gradient-x" style="background-size: 200% 200%"></div>
            <div class="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-lav-400 via-peri-400 to-sky2-300 animate-gradient-x" style="background-size: 200% 200%"></div>
            @if (profile()?.avatarUrl) {
              <img
                [src]="profile()!.avatarUrl"
                [alt]="profile()!.fullName"
                fetchpriority="high"
                class="relative h-56 w-56 rounded-full object-cover sm:h-72 sm:w-72"
              />
            } @else {
              <div class="relative grid h-56 w-56 place-items-center rounded-full bg-gradient-to-br from-lav-100 to-sky2-100 font-display text-6xl font-extrabold text-lav-600 dark:from-lav-800 dark:to-[#16213a] dark:text-lav-200 sm:h-72 sm:w-72">
                {{ initials() }}
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <button
        type="button"
        class="absolute bottom-8 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full text-2xl text-lav-500 animate-bounce"
        (click)="scrollTo('about')"
        [attr.aria-label]="i18n.t('hero.scrollDown')"
      >
        <app-icon name="chevron-down" />
      </button>
    </section>
  `,
  imports: [RevealDirective, Icon, MagneticDirective, TiltDirective, SplitTextDirective, HeroScene],
})
export class Hero implements OnDestroy {
  readonly profile = input<Profile | null>(null);

  protected readonly i18n = inject(I18nService);
  protected readonly typed = signal('');

  private timer: ReturnType<typeof setTimeout> | undefined;
  private started = false;

  constructor() {
    effect(() => {
      const roles = this.profile()?.typingRoles ?? [];
      if (roles.length > 0 && !this.started) {
        this.started = true;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          // No typewriter for reduced-motion users — show the first role.
          this.typed.set(roles[0]);
        } else {
          this.typeLoop(roles, 0);
        }
      }
    });
  }

  protected initials(): string {
    const name = this.profile()?.fullName ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  private typeLoop(roles: string[], index: number): void {
    const role = roles[index % roles.length];
    this.typeText(role, 0, () => {
      this.timer = setTimeout(() => {
        this.deleteText(() => this.typeLoop(roles, index + 1));
      }, 1800);
    });
  }

  private typeText(text: string, pos: number, done: () => void): void {
    if (pos > text.length) {
      done();
      return;
    }
    this.typed.set(text.slice(0, pos));
    this.timer = setTimeout(() => this.typeText(text, pos + 1, done), 70);
  }

  private deleteText(done: () => void): void {
    const current = this.typed();
    if (current.length === 0) {
      done();
      return;
    }
    this.typed.set(current.slice(0, -1));
    this.timer = setTimeout(() => this.deleteText(done), 35);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
