import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Profile } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { MagneticDirective } from '../../shared/magnetic.directive';
import { burstConfetti } from '../../shared/confetti';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact-section',
  imports: [ReactiveFormsModule, RevealDirective, Icon, SpotlightDirective, MagneticDirective],
  template: `
    <section id="contact" class="relative scroll-mt-24 overflow-hidden py-24">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-lav-300/30 blur-3xl dark:bg-lav-700/20"></div>
        <div class="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky2-300/30 blur-3xl dark:bg-sky2-500/10"></div>
      </div>

      <div class="mx-auto max-w-6xl px-6">
        <div appReveal class="mb-14 text-center">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">{{ i18n.t('contact.kicker') }}</p>
          <h2 class="section-title mt-2">{{ i18n.t('contact.title1') }} <span class="gradient-text">{{ i18n.t('contact.title2') }}</span></h2>
        </div>

        <div class="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div appReveal="left" class="space-y-6">
            <p class="text-lg leading-relaxed text-ink/75 dark:text-lav-100/75">
              {{ i18n.t('contact.blurb') }}
            </p>
            @if (profile(); as p) {
              <ul class="space-y-4 text-sm">
                <li class="flex items-center gap-4">
                  <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="mail" /></span>
                  <div class="min-w-0">
                    <p class="text-xs uppercase tracking-wider text-lav-500">{{ i18n.t('contact.email') }}</p>
                    <div class="flex items-center gap-2">
                      <a class="truncate font-medium transition-colors hover:text-lav-600 dark:hover:text-lav-300" [href]="'mailto:' + p.email">{{ p.email }}</a>
                      <button
                        type="button"
                        class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-lav-500 transition-all hover:bg-lav-100/70 hover:text-lav-700 dark:hover:bg-lav-800/40 dark:hover:text-lav-200"
                        (click)="copyEmail(p.email)"
                        [attr.aria-label]="copied() ? i18n.t('contact.copied') : i18n.t('contact.copy')"
                      >
                        <app-icon [name]="copied() ? 'check' : 'copy'" class="text-sm" />
                      </button>
                    </div>
                  </div>
                </li>
                @if (p.phone) {
                  <li class="flex items-center gap-4">
                    <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="phone" /></span>
                    <div>
                      <p class="text-xs uppercase tracking-wider text-lav-500">{{ i18n.t('contact.phone') }}</p>
                      <p class="font-medium">{{ p.phone }}</p>
                    </div>
                  </li>
                }
                @if (p.location) {
                  <li class="flex items-center gap-4">
                    <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="map-pin" /></span>
                    <div>
                      <p class="text-xs uppercase tracking-wider text-lav-500">{{ i18n.t('contact.location') }}</p>
                      <p class="font-medium">{{ p.location }}</p>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <form appReveal="right" appSpotlight [formGroup]="form" (ngSubmit)="submit($event)" class="card space-y-5 p-8">
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="label" for="contact-name">{{ i18n.t('contact.name') }} *</label>
                <input id="contact-name" type="text" formControlName="name" class="input" [placeholder]="i18n.t('contact.namePh')" />
                @if (invalid('name')) {
                  <p class="mt-1 text-xs text-rose-500">{{ i18n.t('contact.errName') }}</p>
                }
              </div>
              <div>
                <label class="label" for="contact-email">{{ i18n.t('contact.email') }} *</label>
                <input id="contact-email" type="email" formControlName="email" class="input" placeholder="you@example.com" />
                @if (invalid('email')) {
                  <p class="mt-1 text-xs text-rose-500">{{ i18n.t('contact.errEmail') }}</p>
                }
              </div>
            </div>
            <div>
              <label class="label" for="contact-subject">{{ i18n.t('contact.subject') }}</label>
              <input id="contact-subject" type="text" formControlName="subject" class="input" [placeholder]="i18n.t('contact.subjectPh')" />
            </div>
            <div>
              <label class="label" for="contact-message">{{ i18n.t('contact.message') }} *</label>
              <textarea id="contact-message" formControlName="message" rows="5" class="input resize-none" [placeholder]="i18n.t('contact.messagePh')"></textarea>
              @if (invalid('message')) {
                <p class="mt-1 text-xs text-rose-500">{{ i18n.t('contact.errMessage') }}</p>
              }
            </div>
            <button type="submit" appMagnetic class="btn-primary w-full" [disabled]="sending()">
              @if (sending()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                {{ i18n.t('contact.sending') }}
              } @else {
                <app-icon name="send" /> {{ i18n.t('contact.send') }}
              }
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class ContactSection implements OnDestroy {
  readonly profile = input<Profile | null>(null);

  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(I18nService);

  protected readonly sending = signal(false);
  protected readonly copied = signal(false);
  private copyTimer: ReturnType<typeof setTimeout> | undefined;

  protected copyEmail(email: string): void {
    navigator.clipboard?.writeText(email).then(() => {
      this.copied.set(true);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 2000);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.copyTimer);
  }

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    subject: ['', [Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.maxLength(5000)]],
  });

  protected invalid(control: string): boolean {
    const c = this.form.get(control);
    return c !== null && c.invalid && (c.dirty || c.touched);
  }

  protected submit(event?: Event): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.api.sendContact(this.form.getRawValue()).subscribe({
      next: () => {
        this.sending.set(false);
        this.form.reset();
        this.toast.success(this.i18n.t('contact.sent'));
        this.celebrate(event);
      },
      error: () => {
        this.sending.set(false);
        this.toast.error(this.i18n.t('contact.sendFail'));
      },
    });
  }

  private celebrate(event?: Event): void {
    // Fire confetti from the submit button, if we can locate it.
    const submitter = (event as SubmitEvent | undefined)?.submitter as HTMLElement | undefined;
    const target =
      (event?.target as HTMLElement | undefined)?.querySelector('button[type=submit]') ?? submitter;
    const rect = target?.getBoundingClientRect();
    if (rect) {
      burstConfetti(rect.left + rect.width / 2, rect.top);
    } else {
      burstConfetti();
    }
  }
}
