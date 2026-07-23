import { DatePipe } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../core/admin-api.service';
import { ContactMessage, Page } from '../core/models';
import { ToastService } from '../core/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-messages-page',
  imports: [DatePipe, CdkTrapFocus],
  template: `
    <div class="mx-auto max-w-4xl">
      <div class="mb-8">
        <h2 class="font-display text-2xl font-extrabold">📬 Messages</h2>
        <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">
          Messages sent through the public contact form.
        </p>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton h-20 w-full"></div>
          }
        </div>
      } @else if (page()?.content?.length === 0) {
        <div class="card p-14 text-center">
          <p class="text-4xl">📭</p>
          <p class="mt-3 font-display font-bold">Inbox zero</p>
          <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">No messages yet.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (msg of page()!.content; track msg.id) {
            <article
              class="card relative cursor-pointer !rounded-2xl p-5 transition-all duration-200 hover:shadow-glow"
              [class.border-l-4]="!msg.read"
              [class.border-l-lav-500]="!msg.read"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-3">
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lav-200 to-sky2-200 font-display font-bold text-lav-700 dark:from-lav-800 dark:to-sky2-500/30 dark:text-lav-200">
                    {{ msg.name.charAt(0).toUpperCase() }}
                  </span>
                  <div>
                    <p>
                      <!-- Stretched over the whole card via ::after — one
                           real interactive element, click-anywhere UX. -->
                      <button
                        type="button"
                        class="rounded-md font-semibold after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:ring-2 focus-visible:ring-lav-400"
                        [class.font-extrabold]="!msg.read"
                        [attr.aria-expanded]="expandedId() === msg.id"
                        (click)="toggleExpand(msg)"
                      >
                        {{ msg.name }}
                      </button>
                      @if (!msg.read) {
                        <span class="ml-2 inline-block h-2 w-2 rounded-full bg-lav-500 align-middle"></span>
                      }
                    </p>
                    <p class="text-xs text-ink/50 dark:text-lav-100/50">{{ msg.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-ink/50 dark:text-lav-100/50">
                  <span>{{ msg.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                  <button
                    type="button"
                    class="relative z-10 rounded-lg px-2 py-1 transition-colors hover:bg-lav-100 dark:hover:bg-lav-800/50"
                    (click)="toggleRead(msg)"
                    [attr.aria-label]="msg.read ? 'Mark unread' : 'Mark read'"
                  >
                    {{ msg.read ? '📖' : '✉️' }}
                  </button>
                  <button
                    type="button"
                    class="relative z-10 rounded-lg px-2 py-1 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    (click)="confirmDeleteId.set(msg.id)"
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              @if (msg.subject) {
                <p class="mt-3 text-sm font-semibold">{{ msg.subject }}</p>
              }
              <p class="mt-1 text-sm leading-relaxed text-ink/70 dark:text-lav-100/70" [class.line-clamp-2]="expandedId() !== msg.id">
                {{ msg.message }}
              </p>
            </article>
          }
        </div>

        <!-- Pagination -->
        @if (page()!.totalPages > 1) {
          <div class="mt-6 flex items-center justify-center gap-4 text-sm">
            <button type="button" class="btn-ghost !px-4 !py-2" [disabled]="page()!.number === 0" (click)="goTo(page()!.number - 1)">← Prev</button>
            <span>Page {{ page()!.number + 1 }} / {{ page()!.totalPages }}</span>
            <button type="button" class="btn-ghost !px-4 !py-2" [disabled]="page()!.number >= page()!.totalPages - 1" (click)="goTo(page()!.number + 1)">Next →</button>
          </div>
        }
      }
    </div>

    @if (confirmDeleteId() !== null) {
      <div class="fixed inset-0 z-50 grid place-items-center px-6">
        <button
          type="button"
          class="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-sm"
          aria-label="Cancel"
          tabindex="-1"
          (click)="confirmDeleteId.set(null)"
        ></button>
        <div
          class="card relative w-full max-w-sm p-8 text-center"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          cdkTrapFocus
          cdkTrapFocusAutoCapture
        >
          <p class="text-4xl">🗑️</p>
          <h3 class="mt-3 font-display text-lg font-extrabold">Delete this message?</h3>
          <div class="mt-6 flex gap-3">
            <button type="button" class="flex-1 rounded-2xl bg-rose-500 px-5 py-2.5 font-semibold text-white transition-all hover:bg-rose-600" (click)="doDelete()">Delete</button>
            <button type="button" class="btn-ghost flex-1 !px-5 !py-2.5" (click)="confirmDeleteId.set(null)">Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `,
})
export class MessagesPage implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  protected readonly page = signal<Page<ContactMessage> | null>(null);
  protected readonly loading = signal(true);
  protected readonly expandedId = signal<number | null>(null);
  protected readonly confirmDeleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.goTo(0);
  }

  protected goTo(pageNumber: number): void {
    this.loading.set(true);
    this.adminApi.listMessages(pageNumber, 10).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load messages.');
      },
    });
  }

  protected toggleExpand(msg: ContactMessage): void {
    this.expandedId.set(this.expandedId() === msg.id ? null : msg.id);
    if (!msg.read) {
      this.toggleRead(msg);
    }
  }

  protected toggleRead(msg: ContactMessage): void {
    this.adminApi.markRead(msg.id, !msg.read).subscribe({
      next: (updated) => {
        this.page.update((page) =>
          page === null
            ? page
            : { ...page, content: page.content.map((m) => (m.id === updated.id ? updated : m)) },
        );
      },
      error: () => this.toast.error('Could not update the message.'),
    });
  }

  protected doDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) {
      return;
    }
    this.adminApi.deleteMessage(id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.toast.success('Message deleted.');
        this.goTo(this.page()?.number ?? 0);
      },
      error: () => {
        this.confirmDeleteId.set(null);
        this.toast.error('Delete failed.');
      },
    });
  }
}
