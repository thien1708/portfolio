import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-toast-outlet',
  template: `
    <div class="pointer-events-none fixed right-6 top-6 z-[100] flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-3">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto glass flex items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-soft-lg animate-[toast-in_.3s_ease]"
          [class.border-l-4]="true"
          [class.border-l-emerald-400]="toast.type === 'success'"
          [class.border-l-rose-400]="toast.type === 'error'"
          [class.border-l-lav-400]="toast.type === 'info'"
          role="status"
        >
          <span class="mt-0.5 text-base leading-none">
            @switch (toast.type) {
              @case ('success') { ✅ }
              @case ('error') { ⚠️ }
              @default { 💬 }
            }
          </span>
          <p class="flex-1">{{ toast.message }}</p>
          <button
            type="button"
            class="text-lav-500 transition-colors hover:text-lav-700 dark:hover:text-lav-200"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes toast-in {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: none; }
    }
  `,
})
export class ToastOutlet {
  protected readonly toastService = inject(ToastService);
}
