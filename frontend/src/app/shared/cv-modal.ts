import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18nService } from '../core/i18n.service';
import { Icon } from './icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cv-modal',
  imports: [Icon, CdkTrapFocus],
  template: `
    @if (open() && cvUrl()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="i18n.t('cv.title')"
      >
        <!-- Backdrop click closes modal -->
        <button
          type="button"
          class="absolute inset-0 cursor-default"
          aria-label="Close dialog"
          tabindex="-1"
          (click)="close()"
        ></button>

        <!-- Modal container -->
        <div
          cdkTrapFocus
          cdkTrapFocusAutoCapture
          class="relative z-10 flex flex-col w-full max-w-5xl h-[90vh] rounded-3xl bg-white/95 dark:bg-ink-raised/95 border border-lav-200/60 dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-scale-in"
        >
          <!-- Top bar -->
          <header class="flex items-center justify-between px-6 py-4 border-b border-lav-200/60 dark:border-white/10 bg-lav-50/50 dark:bg-white/[0.02]">
            <div class="flex items-center gap-3 min-w-0">
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lav-500/10 text-lav-600 dark:bg-lav-400/10 dark:text-lav-300">
                <app-icon name="file-text" class="text-xl" />
              </span>
              <div class="min-w-0">
                <h3 class="font-display font-bold text-base sm:text-lg text-ink dark:text-white truncate">
                  {{ i18n.t('cv.title') }}
                </h3>
                <p class="text-xs text-lav-500 dark:text-lav-400 truncate">
                  PDF Document — Trần Vũ Thiện
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a
                [href]="cvUrl()!"
                target="_blank"
                rel="noopener noreferrer"
                class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-lav-700 dark:text-lav-200 hover:bg-lav-100 dark:hover:bg-white/10 transition-colors"
                [attr.aria-label]="i18n.t('cv.openNewTab')"
              >
                <app-icon name="external" />
                <span>{{ i18n.t('cv.openNewTab') }}</span>
              </a>

              <a
                [href]="cvUrl()!"
                download
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-lav-500 to-peri-500 text-white shadow-soft hover:shadow-glow transition-all"
                [attr.aria-label]="i18n.t('cv.download')"
              >
                <app-icon name="download" />
                <span>{{ i18n.t('cv.download') }}</span>
              </a>

              <button
                #closeBtn
                type="button"
                class="grid h-9 w-9 place-items-center rounded-xl text-lav-500 hover:bg-lav-100 hover:text-lav-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors ml-1"
                (click)="close()"
                [attr.aria-label]="i18n.t('cv.close')"
              >
                <app-icon name="x" class="text-lg" />
              </button>
            </div>
          </header>

          <!-- PDF Viewer body -->
          <div class="relative flex-1 w-full h-full bg-slate-100 dark:bg-ink">
            @if (safeCvUrl(); as src) {
              <iframe
                [src]="src"
                class="w-full h-full border-0"
                title="Curriculum Vitae"
              ></iframe>
            }

            <!-- Mobile fallback bar -->
            <div class="sm:hidden absolute bottom-3 inset-x-4 p-3 rounded-2xl bg-white/90 dark:bg-ink-raised/90 border border-lav-200/50 dark:border-white/10 shadow-lg text-center text-xs backdrop-blur">
              <p class="text-ink/80 dark:text-lav-200/80 mb-2">{{ i18n.t('cv.fallbackMsg') }}</p>
              <a
                [href]="cvUrl()!"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-lav-500 text-white font-semibold"
              >
                <app-icon name="external" /> {{ i18n.t('cv.openDirect') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CvModal {
  readonly open = input<boolean>(false);
  readonly cvUrl = input<string | null>(null);
  readonly closed = output<void>();

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  protected readonly safeCvUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.cvUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        setTimeout(() => this.closeBtn()?.nativeElement?.focus(), 50);
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  protected close(): void {
    this.closed.emit();
  }
}
