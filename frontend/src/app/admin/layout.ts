import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AdminApiService } from '../core/admin-api.service';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';

interface SideLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-lav-200/70 bg-white/80 backdrop-blur-xl transition-transform duration-300 dark:border-lav-700/40 dark:bg-[#1d1a3a]/90 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex items-center gap-3 px-6 py-6">
          <span class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-lav-500 to-peri-500 text-lg shadow-soft">⚡</span>
          <div>
            <p class="font-display text-sm font-extrabold">Portfolio Admin</p>
            <p class="max-w-[9rem] truncate text-xs text-ink/50 dark:text-lav-100/50">{{ auth.email() }}</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-gradient-to-r from-lav-500/15 to-peri-500/10 text-lav-700 dark:text-lav-200 font-semibold"
              class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-lav-100/70 dark:hover:bg-lav-800/40"
              (click)="sidebarOpen.set(false)"
            >
              <span class="text-base">{{ link.icon }}</span>
              <span class="flex-1">{{ link.label }}</span>
              @if (link.path === 'messages' && unread() > 0) {
                <span class="rounded-full bg-gradient-to-r from-lav-500 to-peri-500 px-2 py-0.5 text-xs font-bold text-white">{{ unread() }}</span>
              }
            </a>
          }
        </nav>

        <div class="space-y-1 border-t border-lav-200/70 p-3 dark:border-lav-700/40">
          <a href="/" target="_blank" class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-lav-100/70 dark:hover:bg-lav-800/40">
            <span>🌐</span> View site
          </a>
          <button type="button" class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10" (click)="auth.logout()">
            <span>🚪</span> Log out
          </button>
        </div>
      </aside>

      @if (sidebarOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-30 cursor-default bg-ink/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          tabindex="-1"
          (click)="sidebarOpen.set(false)"
        ></button>
      }

      <!-- Main -->
      <div class="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-lav-200/70 bg-white/70 px-6 py-4 backdrop-blur-xl dark:border-lav-700/40 dark:bg-[#181630]/80">
          <button type="button" class="grid h-10 w-10 place-items-center rounded-xl text-xl lg:hidden" (click)="sidebarOpen.set(true)" aria-label="Open menu">☰</button>
          <h1 class="font-display text-lg font-bold">Dashboard</h1>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl text-lg transition-all duration-300 hover:bg-lav-100/70 hover:rotate-12 dark:hover:bg-lav-800/40"
            (click)="theme.toggle()"
            aria-label="Toggle theme"
          >
            @if (theme.dark()) { ☀️ } @else { 🌙 }
          </button>
        </header>

        <main class="flex-1 px-6 py-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayout implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);

  protected readonly sidebarOpen = signal(false);
  protected readonly unread = signal(0);

  protected readonly links: SideLink[] = [
    { path: 'dashboard', label: 'Dashboard', icon: '📊' },
    { path: 'profile', label: 'Profile', icon: '👤' },
    { path: 'skills', label: 'Skills', icon: '🛠️' },
    { path: 'experiences', label: 'Experience', icon: '💼' },
    { path: 'projects', label: 'Projects', icon: '🚀' },
    { path: 'education', label: 'Education', icon: '🎓' },
    { path: 'certifications', label: 'Certifications', icon: '🏅' },
    { path: 'messages', label: 'Messages', icon: '📬' },
  ];

  ngOnInit(): void {
    this.refreshUnread();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.refreshUnread());
  }

  private refreshUnread(): void {
    this.adminApi.unreadCount().subscribe({
      next: (res) => this.unread.set(res.count),
      error: () => undefined,
    });
  }
}
