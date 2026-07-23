import { inject, ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Certification, EducationItem } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-education-section',
  imports: [RevealDirective, Icon, SpotlightDirective],
  template: `
    <section id="education" class="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div appReveal class="mb-14 text-center">
        <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">{{ i18n.t('edu.kicker') }}</p>
        <h2 class="section-title mt-2">{{ i18n.t('edu.title1') }} <span class="gradient-text">{{ i18n.t('edu.title2') }}</span></h2>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <div appReveal="left" class="space-y-6">
          <h3 class="flex items-center gap-3 font-display text-xl font-bold">
            <span class="glass grid h-11 w-11 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="graduation-cap" /></span>
            Education
          </h3>
          @if (education().length > 0) {
            @for (item of education(); track item.id) {
              <div appSpotlight class="card group p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                @if (item.period) {
                  <span class="chip mb-3 gap-1.5"><app-icon name="calendar" class="text-xs" /> {{ item.period }}</span>
                }
                <h4 class="font-display text-lg font-bold">{{ item.school }}</h4>
                @if (item.degree) {
                  <p class="mt-1 font-medium text-lav-600 dark:text-lav-300">{{ item.degree }}</p>
                }
                @if (item.description) {
                  <p class="mt-3 text-sm leading-relaxed text-ink/70 dark:text-lav-100/70">{{ item.description }}</p>
                }
              </div>
            }
          } @else {
            <div class="skeleton h-44 w-full rounded-3xl"></div>
          }
        </div>

        <div appReveal="right" class="space-y-6">
          <h3 class="flex items-center gap-3 font-display text-xl font-bold">
            <span class="glass grid h-11 w-11 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="award" /></span>
            Certifications
          </h3>
          @if (certifications().length > 0) {
            @for (cert of certifications(); track cert.id) {
              <div appSpotlight class="card group flex items-center gap-4 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow">
                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lav-200 to-sky2-200 text-2xl text-lav-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:from-lav-800 dark:to-sky2-500/30 dark:text-lav-100"><app-icon name="award" /></span>
                <div>
                  <h4 class="font-display text-lg font-bold">{{ cert.name }}</h4>
                  @if (cert.issuer) {
                    <p class="text-sm text-lav-600 dark:text-lav-300">{{ cert.issuer }}</p>
                  }
                  @if (cert.issued) {
                    <p class="mt-0.5 text-xs text-ink/70 dark:text-lav-100/70">{{ cert.issued }}</p>
                  }
                  @if (cert.url) {
                    <a [href]="cert.url" target="_blank" rel="noopener"
                       class="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-lav-600 hover:underline dark:text-lav-300">
                      View credential <app-icon name="arrow-right" class="text-[0.7rem]" />
                    </a>
                  }
                </div>
              </div>
            }
          } @else {
            <div class="skeleton h-32 w-full rounded-3xl"></div>
          }
        </div>
      </div>
    </section>
  `,
})
export class EducationSection {
  protected readonly i18n = inject(I18nService);

  readonly education = input<EducationItem[]>([]);
  readonly certifications = input<Certification[]>([]);
}
