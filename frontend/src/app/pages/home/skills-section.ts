import { Component, computed, input } from '@angular/core';
import { Skill } from '../../core/models';
import { RevealDirective } from '../../shared/reveal.directive';

interface SkillGroup {
  category: string;
  icon: string;
  skills: Skill[];
}

const CATEGORY_ICONS: Record<string, string> = {
  backend: '⚙️',
  frontend: '🎨',
  database: '🗄️',
  'messaging / integration': '📡',
  tools: '🧰',
};

@Component({
  selector: 'app-skills-section',
  imports: [RevealDirective],
  template: `
    <section id="skills" class="relative scroll-mt-24 overflow-hidden py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-lav-300/30 blur-3xl dark:bg-lav-700/20"></div>
        <div class="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-sky2-300/30 blur-3xl dark:bg-sky2-500/10"></div>
      </div>

      <div class="mx-auto max-w-6xl px-6">
        <div appReveal class="mb-14 text-center">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">What I work with</p>
          <h2 class="section-title mt-2">My <span class="gradient-text">Skills</span></h2>
        </div>

        @if (skills().length > 0) {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (group of groups(); track group.category; let gi = $index) {
              <div
                appReveal
                [revealDelay]="gi * 90"
                class="card group p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <div class="mb-5 flex items-center gap-3">
                  <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-lav-200 to-sky2-200 text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:from-lav-800 dark:to-sky2-500/30">
                    {{ group.icon }}
                  </span>
                  <h3 class="font-display text-lg font-bold">{{ group.category }}</h3>
                </div>
                <ul class="space-y-4">
                  @for (skill of group.skills; track skill.id) {
                    <li>
                      <div class="mb-1.5 flex items-center justify-between text-sm">
                        <span class="font-medium">{{ skill.name }}</span>
                        <span class="text-xs text-lav-500 dark:text-lav-300">{{ skill.proficiency }}%</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-lav-100 dark:bg-lav-800/50">
                        <div
                          class="bar-fill h-full rounded-full bg-gradient-to-r from-lav-500 via-peri-400 to-sky2-400"
                          [style.width.%]="skill.proficiency"
                        ></div>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        } @else {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton h-72 w-full rounded-3xl"></div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SkillsSection {
  readonly skills = input<Skill[]>([]);

  protected readonly groups = computed<SkillGroup[]>(() => {
    const map = new Map<string, Skill[]>();
    for (const skill of this.skills()) {
      const list = map.get(skill.category) ?? [];
      list.push(skill);
      map.set(skill.category, list);
    }
    return [...map.entries()].map(([category, skills]) => ({
      category,
      icon: CATEGORY_ICONS[category.toLowerCase()] ?? '⭐',
      skills,
    }));
  });
}
