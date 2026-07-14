import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Profile } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { Icon } from '../../shared/icon';
import { SpotlightDirective } from '../../shared/spotlight.directive';
import { MagneticDirective } from '../../shared/magnetic.directive';
import { burstConfetti } from '../../shared/confetti';

@Component({
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
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">Let's talk</p>
          <h2 class="section-title mt-2">Get in <span class="gradient-text">Touch</span></h2>
        </div>

        <div class="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div appReveal="left" class="space-y-6">
            <p class="text-lg leading-relaxed text-ink/75 dark:text-lav-100/75">
              Have a project in mind, a role to discuss, or just want to say hi?
              Drop me a message — I usually reply within a day.
            </p>
            @if (profile(); as p) {
              <ul class="space-y-4 text-sm">
                <li class="flex items-center gap-4">
                  <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="mail" /></span>
                  <div>
                    <p class="text-xs uppercase tracking-wider text-lav-500">Email</p>
                    <a class="font-medium transition-colors hover:text-lav-600 dark:hover:text-lav-300" [href]="'mailto:' + p.email">{{ p.email }}</a>
                  </div>
                </li>
                @if (p.phone) {
                  <li class="flex items-center gap-4">
                    <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="phone" /></span>
                    <div>
                      <p class="text-xs uppercase tracking-wider text-lav-500">Phone</p>
                      <p class="font-medium">{{ p.phone }}</p>
                    </div>
                  </li>
                }
                @if (p.location) {
                  <li class="flex items-center gap-4">
                    <span class="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-lav-600 dark:text-lav-300"><app-icon name="map-pin" /></span>
                    <div>
                      <p class="text-xs uppercase tracking-wider text-lav-500">Location</p>
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
                <label class="label" for="contact-name">Name *</label>
                <input id="contact-name" type="text" formControlName="name" class="input" placeholder="Your name" />
                @if (invalid('name')) {
                  <p class="mt-1 text-xs text-rose-500">Please enter your name.</p>
                }
              </div>
              <div>
                <label class="label" for="contact-email">Email *</label>
                <input id="contact-email" type="email" formControlName="email" class="input" placeholder="you@example.com" />
                @if (invalid('email')) {
                  <p class="mt-1 text-xs text-rose-500">Please enter a valid email.</p>
                }
              </div>
            </div>
            <div>
              <label class="label" for="contact-subject">Subject</label>
              <input id="contact-subject" type="text" formControlName="subject" class="input" placeholder="What is this about?" />
            </div>
            <div>
              <label class="label" for="contact-message">Message *</label>
              <textarea id="contact-message" formControlName="message" rows="5" class="input resize-none" placeholder="Tell me about your project…"></textarea>
              @if (invalid('message')) {
                <p class="mt-1 text-xs text-rose-500">Please write a message.</p>
              }
            </div>
            <button type="submit" appMagnetic class="btn-primary w-full" [disabled]="sending()">
              @if (sending()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                Sending…
              } @else {
                <app-icon name="send" /> Send Message
              }
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class ContactSection {
  readonly profile = input<Profile | null>(null);

  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly sending = signal(false);

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
        this.toast.success('Message sent! I will get back to you soon. 🙌');
        this.celebrate(event);
      },
      error: () => {
        this.sending.set(false);
        this.toast.error('Could not send the message. Please try again later.');
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
