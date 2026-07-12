import { Component, OnDestroy, effect, input, signal } from '@angular/core';
import { Profile } from '../../core/models';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-hero',
  template: `
    <section id="hero" class="relative flex min-h-screen items-center overflow-hidden pt-24">
      <!-- Animated pastel background -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-br from-lav-50 via-peri-100/60 to-sky2-100 dark:from-[#181630] dark:via-[#1e1a3f] dark:to-[#16213a]"></div>
        <div class="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-lav-400/40 blur-3xl animate-blob dark:bg-lav-600/30"></div>
        <div class="absolute right-0 top-1/4 h-[28rem] w-[28rem] rounded-full bg-sky2-300/40 blur-3xl animate-blob-slow dark:bg-sky2-500/20"></div>
        <div class="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-peri-400/40 blur-3xl animate-blob dark:bg-peri-600/25" style="animation-delay: -8s"></div>
        <!-- Floating particles -->
        @for (p of particles; track $index) {
          <span
            class="absolute rounded-full bg-lav-400/50 dark:bg-lav-300/30 animate-float"
            [style.left.%]="p.x"
            [style.top.%]="p.y"
            [style.width.px]="p.size"
            [style.height.px]="p.size"
            [style.animation-delay]="p.delay + 's'"
            [style.animation-duration]="p.duration + 's'"
          ></span>
        }
      </div>

      <div class="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 lg:grid-cols-[1.2fr_1fr]">
        <div class="order-2 text-center lg:order-1 lg:text-left">
          @if (profile(); as p) {
            <p appReveal class="mb-4 font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-600 dark:text-lav-300">
              👋 Hello, I am
            </p>
            <h1 appReveal [revealDelay]="100" class="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span class="gradient-text">{{ p.fullName }}</span>
            </h1>
            <div appReveal [revealDelay]="200" class="mt-4 flex h-9 items-center justify-center font-display text-xl font-semibold text-lav-700 dark:text-lav-200 sm:text-2xl lg:justify-start">
              <span>{{ typed() }}</span>
              <span class="ml-0.5 inline-block h-6 w-[3px] rounded bg-lav-500 animate-blink sm:h-7"></span>
            </div>
            <p appReveal [revealDelay]="300" class="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70 dark:text-lav-100/70 lg:mx-0">
              {{ p.summary }}
            </p>
            <div appReveal [revealDelay]="420" class="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <button type="button" class="btn-primary" (click)="scrollTo('projects')">
                🚀 View Projects
              </button>
              @if (p.cvUrl) {
                <a class="btn-ghost" [href]="p.cvUrl" target="_blank" rel="noopener">📄 Download CV</a>
              } @else {
                <button type="button" class="btn-ghost" (click)="scrollTo('contact')">💬 Contact Me</button>
              }
            </div>
            <div appReveal [revealDelay]="520" class="mt-8 flex items-center justify-center gap-3 lg:justify-start">
              @if (p.githubUrl) {
                <a [href]="p.githubUrl" target="_blank" rel="noopener" aria-label="GitHub"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">🐙</a>
              }
              @if (p.linkedinUrl) {
                <a [href]="p.linkedinUrl" target="_blank" rel="noopener" aria-label="LinkedIn"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">💼</a>
              }
              @if (p.facebookUrl) {
                <a [href]="p.facebookUrl" target="_blank" rel="noopener" aria-label="Facebook"
                   class="glass grid h-11 w-11 place-items-center rounded-xl text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">📘</a>
              }
              <a [href]="'mailto:' + p.email" aria-label="Email"
                 class="glass grid h-11 w-11 place-items-center rounded-xl text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">✉️</a>
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
          <div appReveal="scale" class="relative">
            <div class="absolute -inset-3 rounded-full bg-gradient-to-tr from-lav-400 via-peri-400 to-sky2-300 opacity-70 blur-lg animate-gradient-x" style="background-size: 200% 200%"></div>
            <div class="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-lav-400 via-peri-400 to-sky2-300 animate-gradient-x" style="background-size: 200% 200%"></div>
            @if (profile()?.avatarUrl) {
              <img
                [src]="profile()!.avatarUrl"
                [alt]="profile()!.fullName"
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
        class="absolute bottom-8 left-1/2 -translate-x-1/2 text-2xl text-lav-500 animate-bounce"
        (click)="scrollTo('about')"
        aria-label="Scroll down"
      >
        ⌄
      </button>
    </section>
  `,
  imports: [RevealDirective],
})
export class Hero implements OnDestroy {
  readonly profile = input<Profile | null>(null);

  protected readonly typed = signal('');
  protected readonly particles = Array.from({ length: 14 }, (_, i) => ({
    x: (i * 37) % 100,
    y: (i * 53) % 90 + 5,
    size: 4 + (i % 4) * 2,
    delay: (i % 7) * 0.8,
    duration: 4 + (i % 5),
  }));

  private timer: ReturnType<typeof setTimeout> | undefined;
  private started = false;

  constructor() {
    effect(() => {
      const roles = this.profile()?.typingRoles ?? [];
      if (roles.length > 0 && !this.started) {
        this.started = true;
        this.typeLoop(roles, 0);
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
