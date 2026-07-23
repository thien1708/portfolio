import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Project } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { initialsOf, splitBullets } from '../../shared/text-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-projects-section',
  imports: [RevealDirective, Icon, SpotlightDirective, CdkTrapFocus],
  template: `
    <section id="projects" class="relative scroll-mt-24 overflow-hidden py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute right-10 top-16 h-80 w-80 rounded-full bg-peri-300/30 blur-3xl dark:bg-peri-600/15"></div>
        <div class="absolute bottom-16 left-10 h-80 w-80 rounded-full bg-lav-300/30 blur-3xl dark:bg-lav-700/20"></div>
      </div>

      <div class="mx-auto max-w-6xl px-6">
        <div appReveal class="mb-10 text-center">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">{{ i18n.t('projects.kicker') }}</p>
          <h2 class="section-title mt-2">{{ i18n.t('projects.title1') }} <span class="gradient-text">{{ i18n.t('projects.title2') }}</span></h2>
        </div>

        @if (projects().length > 0) {
          <!-- Tech filter -->
          <div appReveal class="mb-12 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
              [class.bg-gradient-to-r]="filter() === null"
              [class.from-lav-500]="filter() === null"
              [class.to-peri-500]="filter() === null"
              [class.text-white]="filter() === null"
              [class.shadow-soft]="filter() === null"
              [class.chip]="filter() !== null"
              (click)="filter.set(null)"
            >
              {{ i18n.t('projects.all') }}
            </button>
            @for (tech of allTech(); track tech) {
              <button
                type="button"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200"
                [class.bg-gradient-to-r]="filter() === tech"
                [class.from-lav-500]="filter() === tech"
                [class.to-peri-500]="filter() === tech"
                [class.text-white]="filter() === tech"
                [class.shadow-soft]="filter() === tech"
                [class.chip]="filter() !== tech"
                (click)="filter.set(tech)"
              >
                {{ tech }}
              </button>
            }
          </div>

          <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            @for (project of filtered(); track project.id + '|' + filterKey(); let i = $index) {
              <article
                appSpotlight
                [style.animation-delay]="(i % 3) * 70 + 'ms'"
                [class.conic-border]="project.featured"
                class="card-enter card group relative flex cursor-pointer flex-col overflow-hidden !rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
              >
                <!-- Cover -->
                <div class="relative h-44 overflow-hidden">
                  @if (project.imageUrl) {
                    <img
                      [src]="project.imageUrl"
                      [alt]="project.name"
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  } @else {
                    <div
                      class="grid h-full w-full place-items-center bg-gradient-to-br transition-transform duration-500 group-hover:scale-110"
                      [class]="gradientFor(i)"
                    >
                      <span class="font-display text-5xl font-extrabold text-white/80 drop-shadow">{{ initials(project.name) }}</span>
                    </div>
                  }
                  <div class="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <!-- Quick actions on hover -->
                  @if (project.demoUrl || project.repoUrl) {
                    <div class="absolute inset-x-0 bottom-0 z-10 flex translate-y-3 gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      @if (project.demoUrl) {
                        <a [href]="project.demoUrl" target="_blank" rel="noopener" aria-label="Live demo"
                           class="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-lav-700 shadow backdrop-blur transition-transform hover:scale-105 dark:bg-ink/80 dark:text-lav-100">
                          <app-icon name="external" /> Demo
                        </a>
                      }
                      @if (project.repoUrl) {
                        <a [href]="project.repoUrl" target="_blank" rel="noopener" aria-label="Source code"
                           class="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-semibold text-lav-700 shadow backdrop-blur transition-transform hover:scale-105 dark:bg-ink/80 dark:text-lav-100">
                          <app-icon name="github" /> Code
                        </a>
                      }
                    </div>
                  }
                  @if (project.featured) {
                    <span class="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-lav-700 shadow backdrop-blur dark:bg-ink/70 dark:text-lav-200"><app-icon name="star" class="text-[0.7rem]" /> {{ i18n.t('projects.featured') }}</span>
                  }
                </div>

                <div class="flex flex-1 flex-col p-6">
                  @if (project.period) {
                    <span class="mb-2 flex items-center gap-1.5 text-xs font-medium text-lav-500 dark:text-lav-300"><app-icon name="calendar" class="text-[0.7rem]" /> {{ project.period }}</span>
                  }
                  <h3 class="font-display text-lg font-bold leading-snug">
                    <!-- Stretched over the whole card via ::after — one real
                         interactive element, click-anywhere UX preserved. -->
                    <button
                      type="button"
                      class="rounded-md text-left transition-colors duration-200 after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-lav-400 group-hover:text-lav-600 dark:group-hover:text-lav-300"
                      [attr.aria-label]="'View details of ' + project.name"
                      (click)="openLightbox(project, $event)"
                    >
                      {{ project.name }}
                    </button>
                  </h3>
                  @if (project.description) {
                    <ul class="mt-3 flex-1 space-y-1.5 text-sm leading-relaxed text-ink/70 dark:text-lav-100/70">
                      @for (line of bullets(project.description).slice(0, 3); track $index) {
                        <li class="flex gap-2">
                          <span class="mt-0.5 text-lav-500">▸</span>
                          <span>{{ line }}</span>
                        </li>
                      }
                    </ul>
                  }
                  @if (project.techStack.length > 0) {
                    <div class="mt-4 flex flex-wrap gap-1.5">
                      @for (tech of project.techStack; track tech) {
                        <span class="chip">{{ tech }}</span>
                      }
                    </div>
                  }
                  @if (project.demoUrl || project.repoUrl) {
                    <div class="relative z-10 mt-5 flex gap-4">
                      @if (project.demoUrl) {
                        <a [href]="project.demoUrl" target="_blank" rel="noopener"
                           class="flex items-center gap-1.5 text-sm font-semibold text-lav-600 transition-colors hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100">
                          <app-icon name="external" /> {{ i18n.t('projects.demo') }}
                        </a>
                      }
                      @if (project.repoUrl) {
                        <a [href]="project.repoUrl" target="_blank" rel="noopener"
                           class="flex items-center gap-1.5 text-sm font-semibold text-lav-600 transition-colors hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100">
                          <app-icon name="github" /> {{ i18n.t('projects.source') }}
                        </a>
                      }
                    </div>
                  }
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton h-96 w-full rounded-3xl"></div>
            }
          </div>
        }
      </div>

      <!-- Lightbox -->
      @if (selected(); as p) {
        <div class="lightbox-backdrop">
          <button
            type="button"
            class="absolute inset-0 cursor-default"
            aria-label="Close dialog"
            tabindex="-1"
            (click)="closeLightbox()"
          ></button>
          <div
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="p.name"
            cdkTrapFocus
            class="lightbox-panel glass relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-soft-lg"
          >
            <div class="relative h-56 shrink-0 overflow-hidden">
              @if (selectedImages().length > 0) {
                <img [src]="selectedImages()[galleryIndex()]" [alt]="p.name" class="h-full w-full object-cover" />
                @if (selectedImages().length > 1) {
                  <button
                    type="button"
                    class="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-lav-700 shadow backdrop-blur transition-transform hover:scale-110 dark:bg-ink/70 dark:text-lav-200"
                    (click)="prevImage()"
                    aria-label="Previous image"
                  >
                    <app-icon name="arrow-left" />
                  </button>
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-lav-700 shadow backdrop-blur transition-transform hover:scale-110 dark:bg-ink/70 dark:text-lav-200"
                    (click)="nextImage()"
                    aria-label="Next image"
                  >
                    <app-icon name="arrow-right" />
                  </button>
                  <div class="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                    @for (img of selectedImages(); track $index) {
                      <button
                        type="button"
                        class="h-1.5 rounded-full transition-all duration-200"
                        [class.w-5]="galleryIndex() === $index"
                        [class.bg-white]="galleryIndex() === $index"
                        [class.w-1.5]="galleryIndex() !== $index"
                        [class.bg-white/50]="galleryIndex() !== $index"
                        (click)="galleryIndex.set($index)"
                        [attr.aria-label]="i18n.t('projects.gallery') + ' ' + ($index + 1)"
                      ></button>
                    }
                  </div>
                }
              } @else {
                <div class="grid h-full w-full place-items-center bg-gradient-to-br from-lav-500 to-sky2-400">
                  <span class="font-display text-6xl font-extrabold text-white/80">{{ initials(p.name) }}</span>
                </div>
              }
              <button
                #lightboxClose
                type="button"
                class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-lav-700 shadow backdrop-blur transition-transform hover:scale-110 dark:bg-ink/70 dark:text-lav-200"
                (click)="closeLightbox()"
                aria-label="Close"
              >
                <app-icon name="close" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-7">
              @if (p.period) {
                <span class="mb-2 flex items-center gap-1.5 text-xs font-medium text-lav-500 dark:text-lav-300"><app-icon name="calendar" class="text-[0.7rem]" /> {{ p.period }}</span>
              }
              <h3 class="font-display text-2xl font-extrabold">{{ p.name }}</h3>
              @if (p.description) {
                <ul class="mt-4 space-y-2 text-sm leading-relaxed text-ink/75 dark:text-lav-100/75">
                  @for (line of bullets(p.description); track $index) {
                    <li class="flex gap-2"><span class="mt-0.5 text-lav-500">▸</span><span>{{ line }}</span></li>
                  }
                </ul>
              }
              @if (p.highlights.length > 0) {
                <div class="mt-6 rounded-2xl border border-lav-200/70 bg-lav-50/60 p-5 dark:border-lav-700/40 dark:bg-lav-800/20">
                  <p class="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-lav-600 dark:text-lav-300">
                    {{ i18n.t('projects.highlights') }}
                  </p>
                  <ul class="space-y-2 text-sm leading-relaxed">
                    @for (line of p.highlights; track $index) {
                      <li class="flex gap-2.5">
                        <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lav-500 to-sky2-400 text-[0.6rem] text-white"><app-icon name="check" /></span>
                        <span>{{ line }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }
              @if (p.techStack.length > 0) {
                <div class="mt-5 flex flex-wrap gap-1.5">
                  @for (tech of p.techStack; track tech) {
                    <span class="chip">{{ tech }}</span>
                  }
                </div>
              }
              @if (p.demoUrl || p.repoUrl) {
                <div class="mt-6 flex gap-3">
                  @if (p.demoUrl) {
                    <a [href]="p.demoUrl" target="_blank" rel="noopener" class="btn-primary text-sm"><app-icon name="external" /> {{ i18n.t('projects.demo') }}</a>
                  }
                  @if (p.repoUrl) {
                    <a [href]="p.repoUrl" target="_blank" rel="noopener" class="btn-ghost text-sm"><app-icon name="github" /> {{ i18n.t('projects.source') }}</a>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class ProjectsSection {
  readonly projects = input<Project[]>([]);

  protected readonly i18n = inject(I18nService);
  protected readonly filter = signal<string | null>(null);
  protected readonly selected = signal<Project | null>(null);
  protected readonly galleryIndex = signal(0);

  /** Cover + gallery of the open project, deduped — computed once per open. */
  protected readonly selectedImages = computed<string[]>(() => {
    const p = this.selected();
    if (!p) {
      return [];
    }
    const all = [p.imageUrl, ...p.galleryUrls].filter((u): u is string => !!u);
    return [...new Set(all)];
  });

  protected prevImage(): void {
    const count = this.selectedImages().length;
    this.galleryIndex.update((i) => (i - 1 + count) % count);
  }

  protected nextImage(): void {
    const count = this.selectedImages().length;
    this.galleryIndex.update((i) => (i + 1) % count);
  }

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('lightboxClose');
  /** Element that opened the lightbox; focus returns to it on close. */
  private opener: HTMLElement | null = null;

  constructor() {
    // Move focus into the dialog when it opens and lock body scroll.
    effect(() => {
      const open = this.selected() !== null;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        this.closeButton()?.nativeElement.focus();
      } else {
        this.opener?.focus();
        this.opener = null;
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selected() !== null) {
      this.closeLightbox();
    }
  }

  // Changes whenever the active filter changes, re-keying @for so surviving
  // cards replay the entrance animation on each filter switch.
  protected readonly filterKey = computed(() => this.filter() ?? 'all');

  protected readonly allTech = computed(() => {
    const set = new Set<string>();
    for (const project of this.projects()) {
      for (const tech of project.techStack) {
        set.add(tech);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  protected readonly filtered = computed(() => {
    const tech = this.filter();
    if (tech === null) {
      return this.projects();
    }
    return this.projects().filter((p) => p.techStack.includes(tech));
  });

  private readonly gradients = [
    'from-lav-500 to-sky2-400',
    'from-peri-500 to-lav-400',
    'from-sky2-400 to-peri-400',
    'from-lav-600 to-peri-300',
  ];

  protected gradientFor(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  protected readonly initials = initialsOf;
  protected readonly bullets = splitBullets;

  protected openLightbox(project: Project, event: Event): void {
    // Ignore clicks that landed on the quick-action links.
    if ((event.target as HTMLElement).closest('a')) {
      return;
    }
    this.opener = event.currentTarget as HTMLElement;
    this.galleryIndex.set(0);
    const show = () => this.selected.set(project);
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition) {
      doc.startViewTransition(show);
    } else {
      show();
    }
  }

  protected closeLightbox(): void {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const hide = () => this.selected.set(null);
    if (doc.startViewTransition) {
      doc.startViewTransition(hide);
    } else {
      hide();
    }
  }
}
