import { inject, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Experience, Profile, Project, Skill } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { CountUpDirective } from '../../shared/count-up.directive';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { TiltDirective } from '../../shared/tilt.directive';
import { SkillRadar } from '../../shared/skill-radar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-about',
  imports: [
    RevealDirective,
    CountUpDirective,
    Icon,
    SpotlightDirective,
    TiltDirective,
    SkillRadar,
  ],
  template: `
    <section id="about" class="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div appReveal class="mb-14 text-center">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">{{ i18n.t('about.kicker') }}</p>
        <h2 class="section-title mt-2">{{ i18n.t('about.title1') }} <span class="gradient-text">{{ i18n.t('about.title2') }}</span></h2>
      </div>

      <div appReveal class="grid gap-5 md:auto-rows-fr md:grid-cols-4 md:grid-rows-3">
        <!-- Summary + contact -->
        <div
          appSpotlight
          class="card flex flex-col justify-between gap-6 p-7 md:col-span-2 md:col-start-1 md:row-span-2 md:row-start-1"
        >
          @if (profile(); as p) {
            <p class="text-lg leading-relaxed text-ink/80 dark:text-lav-100/80">{{ p.summary }}</p>
            <ul class="space-y-3 text-sm">
              @if (p.location) {
                <li class="flex items-center gap-3">
                  <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lav-600 dark:text-lav-300"><app-icon name="map-pin" /></span>
                  <span>{{ p.location }}</span>
                </li>
              }
              <li class="flex items-center gap-3">
                <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lav-600 dark:text-lav-300"><app-icon name="mail" /></span>
                <a class="transition-colors hover:text-lav-600 dark:hover:text-lav-300" [href]="'mailto:' + p.email">{{ p.email }}</a>
              </li>
              @if (p.phone) {
                <li class="flex items-center gap-3">
                  <span class="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lav-600 dark:text-lav-300"><app-icon name="phone" /></span>
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

        <!-- Stat: years -->
        <div appSpotlight [appTilt]="6" class="card grid place-content-center p-6 text-center md:col-start-3 md:row-start-1">
          <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="profile()?.yearsExperience ?? 0" suffix="+"></p>
          <p class="mt-2 text-sm text-ink/70 dark:text-lav-100/70">{{ i18n.t('about.years') }}</p>
        </div>

        <!-- Stat: projects -->
        <div appSpotlight [appTilt]="6" class="card grid place-content-center p-6 text-center md:col-start-4 md:row-start-1">
          <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="projects().length"></p>
          <p class="mt-2 text-sm text-ink/70 dark:text-lav-100/70">{{ i18n.t('about.projects') }}</p>
        </div>

        <!-- Radar -->
        <div appSpotlight class="card flex flex-col p-6 md:col-span-2 md:col-start-3 md:row-span-2 md:row-start-2">
          <div class="mb-2 flex items-center gap-2">
            <span class="text-lav-500"><app-icon name="sparkles" /></span>
            <h3 class="font-display text-sm font-bold uppercase tracking-wider text-lav-600 dark:text-lav-300">Skill Balance</h3>
          </div>
          @if (skills().length >= 3) {
            <div class="flex-1"><app-skill-radar [skills]="skills()" /></div>
          } @else {
            <div class="skeleton h-40 w-full"></div>
          }
        </div>

        <!-- Stat: technologies -->
        <div appSpotlight [appTilt]="6" class="card grid place-content-center p-6 text-center md:col-start-1 md:row-start-3">
          <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="skills().length"></p>
          <p class="mt-2 text-sm text-ink/70 dark:text-lav-100/70">{{ i18n.t('about.technologies') }}</p>
        </div>

        <!-- Stat: companies -->
        <div appSpotlight [appTilt]="6" class="card grid place-content-center p-6 text-center md:col-start-2 md:row-start-3">
          <p class="font-display text-4xl font-extrabold gradient-text" [appCountUp]="companies()"></p>
          <p class="mt-2 text-sm text-ink/70 dark:text-lav-100/70">{{ i18n.t('about.companies') }}</p>
        </div>
      </div>
    </section>
  `,
})
export class About {
  protected readonly i18n = inject(I18nService);

  readonly profile = input<Profile | null>(null);
  readonly skills = input<Skill[]>([]);
  readonly projects = input<Project[]>([]);
  readonly experiences = input<Experience[]>([]);

  protected readonly companies = computed(
    () => new Set(this.experiences().map((e) => e.company)).size,
  );
}
