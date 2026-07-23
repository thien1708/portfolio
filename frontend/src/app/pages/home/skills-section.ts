import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Skill } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { TiltDirective } from '../../shared/tilt.directive';

type SkillLevel = 'daily' | 'proficient' | 'familiar';

interface LeveledSkill {
  skill: Skill;
  level: SkillLevel;
}

interface SkillGroup {
  category: string;
  icon: string;
  skills: LeveledSkill[];
}

const CATEGORY_ICONS: Record<string, string> = {
  backend: 'server',
  frontend: 'sparkles',
  database: 'database',
  'messaging / integration': 'share',
  tools: 'wrench',
};

/**
 * Percentage bars invite the question "80% compared to whom?" — instead the
 * stored proficiency maps to three honest usage tiers shown as colored dots.
 */
function toLevel(proficiency: number): SkillLevel {
  if (proficiency >= 85) return 'daily';
  if (proficiency >= 70) return 'proficient';
  return 'familiar';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-skills-section',
  imports: [RevealDirective, Icon, SpotlightDirective, TiltDirective],
  template: `
    <section id="skills" class="relative scroll-mt-24 overflow-hidden py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-lav-300/30 blur-3xl dark:bg-lav-700/20"></div>
        <div class="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-sky2-300/30 blur-3xl dark:bg-sky2-500/10"></div>
      </div>

      <div class="mx-auto max-w-6xl px-6">
        <div appReveal class="mb-8 text-center">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">{{ i18n.t('skills.kicker') }}</p>
          <h2 class="section-title mt-2">{{ i18n.t('skills.title1') }} <span class="gradient-text">{{ i18n.t('skills.title2') }}</span></h2>
        </div>

        @if (skills().length > 0) {
          <!-- Level legend -->
          <div appReveal [revealDelay]="80" class="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink/70 dark:text-lav-100/70">
            <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-lav-500 to-peri-500"></span>{{ i18n.t('skills.daily') }}</span>
            <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-sky2-400"></span>{{ i18n.t('skills.proficient') }}</span>
            <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full border border-lav-400 bg-lav-200/60 dark:bg-lav-700/40"></span>{{ i18n.t('skills.familiar') }}</span>
          </div>

          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (group of groups(); track group.category; let gi = $index) {
              <div
                appReveal
                appSpotlight
                [appTilt]="5"
                [revealDelay]="gi * 90"
                class="card group p-6 transition-shadow duration-300 hover:shadow-glow"
              >
                <div class="mb-5 flex items-center gap-3">
                  <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-lav-200 to-sky2-200 text-xl text-lav-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:from-lav-800 dark:to-sky2-500/30 dark:text-lav-100">
                    <app-icon [name]="group.icon" />
                  </span>
                  <h3 class="font-display text-lg font-bold">{{ group.category }}</h3>
                </div>
                <ul class="flex flex-wrap gap-2">
                  @for (item of group.skills; track item.skill.id) {
                    <li>
                      <span
                        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                        [class.border-lav-300]="item.level === 'daily'"
                        [class.bg-lav-100/80]="item.level === 'daily'"
                        [class.text-lav-800]="item.level === 'daily'"
                        [class.dark:border-lav-500/50]="item.level === 'daily'"
                        [class.dark:bg-lav-800/60]="item.level === 'daily'"
                        [class.dark:text-lav-100]="item.level === 'daily'"
                        [class.border-sky2-300]="item.level === 'proficient'"
                        [class.bg-sky2-100/70]="item.level === 'proficient'"
                        [class.text-ink]="item.level === 'proficient'"
                        [class.dark:border-sky2-500/40]="item.level === 'proficient'"
                        [class.dark:bg-sky2-500/15]="item.level === 'proficient'"
                        [class.dark:text-sky2-200]="item.level === 'proficient'"
                        [class.border-lav-200]="item.level === 'familiar'"
                        [class.bg-white/50]="item.level === 'familiar'"
                        [class.text-ink]="item.level === 'familiar'"
                        [class.dark:border-lav-700/50]="item.level === 'familiar'"
                        [class.dark:bg-lav-800/30]="item.level === 'familiar'"
                        [class.dark:text-lav-200]="item.level === 'familiar'"
                        [attr.title]="levelLabel(item.level)"
                      >
                        <span
                          class="h-2 w-2 shrink-0 rounded-full"
                          [class.bg-gradient-to-r]="item.level === 'daily'"
                          [class.from-lav-500]="item.level === 'daily'"
                          [class.to-peri-500]="item.level === 'daily'"
                          [class.bg-sky2-400]="item.level === 'proficient'"
                          [class.border]="item.level === 'familiar'"
                          [class.border-lav-400]="item.level === 'familiar'"
                          [class.bg-lav-200/60]="item.level === 'familiar'"
                        ></span>
                        {{ item.skill.name }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        } @else {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton h-56 w-full rounded-3xl"></div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SkillsSection {
  readonly skills = input<Skill[]>([]);

  protected readonly i18n = inject(I18nService);

  protected readonly groups = computed<SkillGroup[]>(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of this.skills()) {
      const list = map.get(skill.category) ?? [];
      list.push(skill);
      map.set(skill.category, list);
    }
    return [...map.entries()].map(([category, skills]) => ({
      category,
      icon: CATEGORY_ICONS[category.toLowerCase()] ?? 'layers',
      skills: skills.map((skill) => ({ skill, level: toLevel(skill.proficiency) })),
    }));
  });

  protected levelLabel(level: SkillLevel): string {
    return this.i18n.t(level === 'daily' ? 'skills.daily' : level === 'proficient' ? 'skills.proficient' : 'skills.familiar');
  }
}
