import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Profile } from '../../core/models';
import { I18nService } from '../../core/i18n.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-footer',
  template: `
    <footer class="relative mt-8">
      <div class="h-px bg-gradient-to-r from-transparent via-lav-400 to-transparent"></div>
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink/60 dark:text-lav-100/60 sm:flex-row">
        <p>© {{ year }} {{ profile()?.fullName ?? 'Trần Vũ Thiện' }}. {{ i18n.t('footer.rights') }}</p>
        <p class="flex items-center gap-1.5">
          Built with
          <span class="font-semibold text-lav-600 dark:text-lav-300">Spring Boot</span> ·
          <span class="font-semibold text-lav-600 dark:text-lav-300">Angular</span> ·
          <span class="font-semibold text-lav-600 dark:text-lav-300">Supabase</span>
        </p>
      </div>
    </footer>
  `,
})
export class Footer {
  readonly profile = input<Profile | null>(null);
  protected readonly i18n = inject(I18nService);
  protected readonly year = new Date().getFullYear();
}
