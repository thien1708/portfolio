import { Component, computed, input } from '@angular/core';
import { Experience, Profile, Project, Skill } from '../../core/models';
import { CountUpDirective } from '../../shared/count-up.directive';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  imports: [RevealDirective, CountUpDirective],
  template: `
    <section id="about" class="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div appReveal class="mb-14 text-center">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">Get to know me</p>
        <h2 class="section-title mt-2">About <span class="gradient-text">Me</span></h2>
      </div>

      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div appReveal="left" class="space-y-5">
          @if (profile(); as p) {
            <p class="text-lg leading-relaxed text-ink/80 dark:text-lav-100/80">{{ p.summary }}</p>
            <ul class="space-y-3 text-sm">
              <li class="flex items-center gap-3">
                <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl">📍</span>
                <span>{{ p.location }}</span>
              </li>
              <li class="flex items-center gap-3">
                <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl">✉️</span>
                <a class="transition-colors hover:text-lav-600 dark:hover:text-lav-300" [href]="'mailto:' + p.email">{{ p.email }}</a>
              </li>
              @if (p.phone) {
                <li class="flex items-center gap-3">
                  <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl">📞</span>
                  <span>{{ p.phone }}</span>
                </li>
              }
            </ul>
          } @else {
            <div class="space-y-4">
              <div class="skeleton h-28 w-full"></div>
              <div class="skeleton h-6 w-2/3"></div>
              <div class="skeleton h-6 w-1/2"></div>
            </div>
          }
        </div>

        <div appReveal="right" class="grid grid-cols-2 gap-5">
          <div class="card group p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
            <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="profile()?.yearsExperience ?? 0" suffix="+"></p>
            <p class="mt-2 text-sm text-ink/60 dark:text-lav-100/60">Years of Experience</p>
          </div>
          <div class="card group p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
            <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="projects().length"></p>
            <p class="mt-2 text-sm text-ink/60 dark:text-lav-100/60">Projects Delivered</p>
          </div>
          <div class="card group p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
            <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="skills().length"></p>
            <p class="mt-2 text-sm text-ink/60 dark:text-lav-100/60">Technologies</p>
          </div>
          <div class="card group p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
            <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="companies()"></p>
            <p class="mt-2 text-sm text-ink/60 dark:text-lav-100/60">Companies</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class About {
  readonly profile = input<Profile | null>(null);
  readonly skills = input<Skill[]>([]);
  readonly projects = input<Project[]>([]);
  readonly experiences = input<Experience[]>([]);

  protected readonly companies = computed(
    () => new Set(this.experiences().map((e) => e.company)).size,
  );
}
