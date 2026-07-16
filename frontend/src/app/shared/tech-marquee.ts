import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Infinite horizontal ticker of technology names. The track is duplicated
 * so the -50% translate loops seamlessly. Pauses on hover.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tech-marquee',
  template: `
    @if (items().length > 0) {
      <div class="marquee-mask relative overflow-hidden py-4">
        <div class="marquee-track animate-marquee gap-4">
          @for (item of loop(); track $index) {
            <span
              class="flex items-center gap-2 whitespace-nowrap rounded-full border border-lav-200/70 bg-white/50 px-5 py-2 text-sm font-medium text-lav-700 backdrop-blur dark:border-lav-700/40 dark:bg-[#232048]/40 dark:text-lav-200"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-lav-500 to-sky2-400"></span>
              {{ item }}
            </span>
          }
        </div>
      </div>
    }
  `,
})
export class TechMarquee {
  readonly items = input<string[]>([]);

  // Duplicate the list so the animation can loop without a visible seam.
  protected readonly loop = computed(() => {
    const list = this.items();
    return list.length > 0 ? [...list, ...list] : [];
  });
}
