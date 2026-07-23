import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AdminApiService } from '../core/admin-api.service';
import { ContactMessage } from '../core/models';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  link: string;
}

/** Landing view after login: content counts, inbox status, quick actions. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-page',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="mx-auto max-w-5xl">
      <h2 class="font-display text-2xl font-extrabold">📊 Dashboard</h2>
      <p class="mt-1 text-sm text-ink/60 dark:text-lav-100/60">
        Everything on the public site at a glance.
      </p>

      @if (unread() > 0) {
        <a
          routerLink="/admin/messages"
          class="mt-6 flex items-center gap-4 rounded-2xl border border-lav-300 bg-gradient-to-r from-lav-500/10 to-peri-500/10 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow dark:border-lav-600/50"
        >
          <span class="text-3xl">📬</span>
          <div class="flex-1">
            <p class="font-display font-bold">
              {{ unread() }} unread message{{ unread() === 1 ? '' : 's' }}
            </p>
            <p class="text-sm text-ink/60 dark:text-lav-100/60">Someone reached out — take a look.</p>
          </div>
          <span class="text-lav-500">→</span>
        </a>
      }

      @if (loading()) {
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="skeleton h-28 w-full rounded-2xl"></div>
          }
        </div>
      } @else {
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          @for (stat of stats(); track stat.label) {
            <a
              [routerLink]="stat.link"
              class="card group !rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow"
            >
              <div class="flex items-center justify-between">
                <span class="text-2xl transition-transform duration-200 group-hover:scale-110">{{ stat.icon }}</span>
                <span class="font-display text-3xl font-extrabold gradient-text">{{ stat.value }}</span>
              </div>
              <p class="mt-3 font-display text-sm font-bold">{{ stat.label }}</p>
            </a>
          }
        </div>

        @if (latest().length > 0) {
          <h3 class="mt-10 font-display text-lg font-extrabold">Latest messages</h3>
          <div class="mt-3 space-y-2">
            @for (msg of latest(); track msg.id) {
              <a
                routerLink="/admin/messages"
                class="card flex items-center gap-3 !rounded-2xl p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-glow"
                [class.border-l-4]="!msg.read"
                [class.border-l-lav-500]="!msg.read"
              >
                <span class="font-display font-bold">{{ msg.name }}</span>
                <span class="min-w-0 flex-1 truncate text-ink/60 dark:text-lav-100/60">
                  {{ msg.subject || msg.message }}
                </span>
                <span class="shrink-0 text-xs text-lav-500">{{ msg.createdAt | date: 'MMM d' }}</span>
              </a>
            }
          </div>
        }
      }
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly adminApi = inject(AdminApiService);

  protected readonly loading = signal(true);
  protected readonly unread = signal(0);
  protected readonly stats = signal<StatCard[]>([]);
  protected readonly latest = signal<ContactMessage[]>([]);

  ngOnInit(): void {
    forkJoin({
      skills: this.api.getSkills(),
      experiences: this.api.getExperiences(),
      projects: this.api.getProjects(),
      education: this.api.getEducation(),
      certifications: this.api.getCertifications(),
    }).subscribe({
      next: (data) => {
        this.stats.set([
          { label: 'Skills', value: data.skills.length, icon: '🛠️', link: '/admin/skills' },
          { label: 'Experience', value: data.experiences.length, icon: '💼', link: '/admin/experiences' },
          { label: 'Projects', value: data.projects.length, icon: '🚀', link: '/admin/projects' },
          { label: 'Education', value: data.education.length, icon: '🎓', link: '/admin/education' },
          { label: 'Certifications', value: data.certifications.length, icon: '🏅', link: '/admin/certifications' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.adminApi.unreadCount().subscribe({
      next: (res) => this.unread.set(res.count),
      error: () => undefined,
    });
    this.adminApi.listMessages(0, 3).subscribe({
      next: (page) => this.latest.set(page.content),
      error: () => undefined,
    });
  }
}
