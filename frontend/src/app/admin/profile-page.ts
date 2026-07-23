import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { ChipsInput } from '../shared/chips-input';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-profile-page',
  imports: [ReactiveFormsModule, ChipsInput],
  template: `
    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <h2 class="font-display text-2xl font-extrabold">👤 Profile</h2>
        <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">
          The hero, about and contact sections of the public site are built from this data.
        </p>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="skeleton h-12 w-full"></div>
          }
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="card space-y-6 p-8">
          <!-- Avatar -->
          <div class="flex items-center gap-6">
            @if (form.controls.avatarUrl.value) {
              <img [src]="form.controls.avatarUrl.value" alt="Avatar" class="h-24 w-24 rounded-full border-2 border-lav-300 object-cover" />
            } @else {
              <div class="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-lav-200 to-sky2-200 text-3xl dark:from-lav-800 dark:to-sky2-500/30">👤</div>
            }
            <div class="space-x-2">
              <label class="btn-ghost !px-4 !py-2 text-sm" [class.opacity-60]="uploading()">
                @if (uploading()) { ⏳ Uploading… } @else { 🖼️ Upload avatar }
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" (change)="onAvatar($event)" [disabled]="uploading()" />
              </label>
              @if (form.controls.avatarUrl.value) {
                <button type="button" class="text-sm text-rose-500 hover:underline" (click)="form.controls.avatarUrl.setValue('')">Remove</button>
              }
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="p-fullName">Full name *</label>
              <input id="p-fullName" type="text" formControlName="fullName" class="input" />
            </div>
            <div>
              <label class="label" for="p-title">Title *</label>
              <input id="p-title" type="text" formControlName="title" class="input" />
            </div>
          </div>

          <div>
            <label class="label" for="p-summary">Summary</label>
            <textarea id="p-summary" formControlName="summary" rows="4" class="input resize-y"></textarea>
          </div>

          <div>
            <span class="label">Typing roles (hero animation)</span>
            <app-chips-input formControlName="typingRoles" />
            <p class="mt-1 text-xs text-ink/50 dark:text-lav-100/50">Cycled by the typewriter effect in the hero section.</p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="p-email">Email *</label>
              <input id="p-email" type="email" formControlName="email" class="input" />
            </div>
            <div>
              <label class="label" for="p-phone">Phone</label>
              <input id="p-phone" type="text" formControlName="phone" class="input" />
            </div>
            <div>
              <label class="label" for="p-location">Location</label>
              <input id="p-location" type="text" formControlName="location" class="input" />
            </div>
            <div>
              <label class="label" for="p-years">Years of experience</label>
              <input id="p-years" type="number" formControlName="yearsExperience" class="input" min="0" max="60" />
            </div>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="label" for="p-github">GitHub URL</label>
              <input id="p-github" type="text" formControlName="githubUrl" class="input" placeholder="https://github.com/…" />
            </div>
            <div>
              <label class="label" for="p-linkedin">LinkedIn URL</label>
              <input id="p-linkedin" type="text" formControlName="linkedinUrl" class="input" placeholder="https://linkedin.com/in/…" />
            </div>
            <div>
              <label class="label" for="p-facebook">Facebook URL</label>
              <input id="p-facebook" type="text" formControlName="facebookUrl" class="input" placeholder="https://facebook.com/…" />
            </div>
            <div>
              <label class="label" for="p-cv">CV URL (Download CV button)</label>
              <input id="p-cv" type="text" formControlName="cvUrl" class="input" placeholder="https://… /uploads/cv.pdf" />
            </div>
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="saving()">
            @if (saving()) { Saving… } @else { 💾 Save profile }
          </button>
        </form>
      }
    </div>
  `,
})
export class ProfilePage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly adminApi = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    title: ['', [Validators.required, Validators.maxLength(160)]],
    summary: [''],
    avatarUrl: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    location: [''],
    githubUrl: [''],
    linkedinUrl: [''],
    facebookUrl: [''],
    cvUrl: [''],
    typingRoles: [[] as string[]],
    yearsExperience: [0, [Validators.min(0), Validators.max(60)]],
  });

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (profile) => {
        this.form.patchValue({
          ...profile,
          summary: profile.summary ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          phone: profile.phone ?? '',
          location: profile.location ?? '',
          githubUrl: profile.githubUrl ?? '',
          linkedinUrl: profile.linkedinUrl ?? '',
          facebookUrl: profile.facebookUrl ?? '',
          cvUrl: profile.cvUrl ?? '',
          typingRoles: profile.typingRoles ?? [],
          yearsExperience: profile.yearsExperience ?? 0,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Could not load the profile.');
      },
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.adminApi.updateProfile(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Profile saved! ✨');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? 'Save failed.');
      },
    });
  }

  protected onAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Image is too large (max 2 MB).');
      return;
    }
    this.uploading.set(true);
    this.adminApi.upload(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.form.controls.avatarUrl.setValue(res.url);
        this.toast.success('Avatar uploaded.');
      },
      error: (err) => {
        this.uploading.set(false);
        this.toast.error(err?.error?.message ?? 'Upload failed.');
      },
    });
  }
}
