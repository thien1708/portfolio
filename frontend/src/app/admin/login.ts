import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-br from-lav-50 via-peri-100/60 to-sky2-100 dark:from-[#181630] dark:via-[#1e1a3f] dark:to-[#16213a]"></div>
        <div class="absolute -left-20 top-10 h-80 w-80 rounded-full bg-lav-400/40 blur-3xl animate-blob dark:bg-lav-600/30"></div>
        <div class="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-sky2-300/40 blur-3xl animate-blob-slow dark:bg-sky2-500/20"></div>
      </div>

      <div class="card w-full max-w-md p-8 sm:p-10">
        <div class="mb-8 text-center">
          <span class="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-lav-500 to-peri-500 text-3xl shadow-soft">🔐</span>
          <h1 class="font-display text-2xl font-extrabold">Admin <span class="gradient-text">Panel</span></h1>
          <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">Sign in to manage your portfolio</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="label" for="login-email">Email</label>
            <input id="login-email" type="email" formControlName="email" class="input" placeholder="you@example.com" autocomplete="username" />
          </div>
          <div>
            <label class="label" for="login-password">Password</label>
            <input id="login-password" type="password" formControlName="password" class="input" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              Signing in…
            } @else {
              Sign in →
            }
          </button>
        </form>

        <a href="/" class="mt-6 block text-center text-sm text-lav-600 transition-colors hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100">
          ← Back to portfolio
        </a>
      </div>
    </div>
  `,
})
export class AdminLogin {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Welcome back! 👋');
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err?.error?.message ?? 'Login failed. Please check your credentials.';
        this.toast.error(message);
      },
    });
  }
}
