import { Component, input } from '@angular/core';
import { Experience } from '../../core/models';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'app-experience-section',
  imports: [RevealDirective, Icon, SpotlightDirective],
  template: `
    <section id="experience" class="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <div appReveal class="mb-16 text-center">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">Where I've been</p>
        <h2 class="section-title mt-2">Work <span class="gradient-text">Experience</span></h2>
      </div>

      @if (experiences().length > 0) {
        <div class="relative">
          <!-- Timeline line (draws in on scroll) -->
          <div appReveal class="timeline-line absolute left-5 top-0 h-full w-0.5 bg-gradient-to-b from-lav-400 via-peri-400 to-sky2-300 md:left-1/2 md:-translate-x-1/2"></div>

          <ol class="space-y-12">
            @for (exp of experiences(); track exp.id; let i = $index) {
              <li
                class="relative pl-14 md:pl-0"
                [class]="i % 2 === 0 ? 'md:pr-[calc(50%+2.5rem)]' : 'md:pl-[calc(50%+2.5rem)]'"
              >
                <!-- Dot -->
                <span class="absolute left-5 top-2 -translate-x-1/2 md:left-1/2">
                  <span class="relative grid h-5 w-5 place-items-center">
                    <span class="absolute h-5 w-5 rounded-full bg-lav-400/70 animate-pulse-ring"></span>
                    <span class="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-gradient-to-br from-lav-500 to-sky2-400 dark:border-[#181630]"></span>
                  </span>
                </span>

                <div
                  [appReveal]="i % 2 === 0 ? 'left' : 'right'"
                  appSpotlight
                  class="card group p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
                >
                  <span class="chip mb-3 gap-1.5"><app-icon name="calendar" class="text-xs" /> {{ exp.period }}</span>
                  <h3 class="font-display text-xl font-bold">{{ exp.role }}</h3>
                  <p class="mt-0.5 font-medium text-lav-600 dark:text-lav-300">{{ exp.company }}</p>
                  @if (exp.description) {
                    <ul class="mt-4 space-y-2 text-sm leading-relaxed text-ink/70 dark:text-lav-100/70">
                      @for (line of bullets(exp.description); track $index) {
                        <li class="flex gap-2">
                          <span class="mt-1 text-lav-500">▸</span>
                          <span>{{ line }}</span>
                        </li>
                      }
                    </ul>
                  }
                  @if (exp.techStack.length > 0) {
                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (tech of exp.techStack; track tech) {
                        <span class="chip transition-transform duration-200 hover:scale-105">{{ tech }}</span>
                      }
                    </div>
                  }
                </div>
              </li>
            }
          </ol>
        </div>
      } @else {
        <div class="space-y-8">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton h-48 w-full rounded-3xl"></div>
          }
        </div>
      }
    </section>
  `,
})
export class ExperienceSection {
  readonly experiences = input<Experience[]>([]);

  protected bullets(description: string): string[] {
    return description
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }
}
