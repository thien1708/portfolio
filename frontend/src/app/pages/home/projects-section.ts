import { Component, computed, input, signal } from '@angular/core';
import { Project } from '../../core/models';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-projects-section',
  imports: [RevealDirective],
  template: `
    <section id="projects" class="relative scroll-mt-24 overflow-hidden py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute right-10 top-16 h-80 w-80 rounded-full bg-peri-300/30 blur-3xl dark:bg-peri-600/15"></div>
        <div class="absolute bottom-16 left-10 h-80 w-80 rounded-full bg-lav-300/30 blur-3xl dark:bg-lav-700/20"></div>
      </div>

      <div class="mx-auto max-w-6xl px-6">
        <div appReveal class="mb-10 text-center">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">What I've built</p>
          <h2 class="section-title mt-2">Featured <span class="gradient-text">Projects</span></h2>
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
              All
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
            @for (project of filtered(); track project.id; let i = $index) {
              <article
                appReveal
                [revealDelay]="(i % 3) * 100"
                class="card group flex flex-col overflow-hidden !rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
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
                  <div class="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  @if (project.featured) {
                    <span class="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-lav-700 shadow backdrop-blur dark:bg-ink/70 dark:text-lav-200">⭐ Featured</span>
                  }
                </div>

                <div class="flex flex-1 flex-col p-6">
                  @if (project.period) {
                    <span class="mb-2 text-xs font-medium text-lav-500 dark:text-lav-300">🗓 {{ project.period }}</span>
                  }
                  <h3 class="font-display text-lg font-bold leading-snug transition-colors duration-200 group-hover:text-lav-600 dark:group-hover:text-lav-300">
                    {{ project.name }}
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
                    <div class="mt-5 flex gap-3">
                      @if (project.demoUrl) {
                        <a [href]="project.demoUrl" target="_blank" rel="noopener"
                           class="text-sm font-semibold text-lav-600 transition-colors hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100">
                          🔗 Live demo
                        </a>
                      }
                      @if (project.repoUrl) {
                        <a [href]="project.repoUrl" target="_blank" rel="noopener"
                           class="text-sm font-semibold text-lav-600 transition-colors hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100">
                          🐙 Source
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
    </section>
  `,
})
export class ProjectsSection {
  readonly projects = input<Project[]>([]);

  protected readonly filter = signal<string | null>(null);

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

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter((w) => /^[A-Za-z0-9]/.test(w))
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  protected bullets(description: string): string[] {
    return description
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
}
