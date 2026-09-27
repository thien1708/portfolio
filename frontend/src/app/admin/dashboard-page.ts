import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AdminApiService } from '../core/admin-api.service';
import { AnalyticsSummary, ContactMessage } from '../core/models';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  link: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 class="font-display text-2xl font-extrabold">📊 Dashboard</h2>
        <p class="mt-1 text-sm text-ink/70 dark:text-lav-100/70">
          Tổng quan website, lượt xem thực tế và các tin nhắn liên hệ.
        </p>
      </div>

      <!-- Unread message notice -->
      @if (unread() > 0) {
        <a
          routerLink="/admin/messages"
          class="flex items-center gap-4 rounded-2xl border border-lav-300 bg-gradient-to-r from-lav-500/15 to-peri-500/15 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow dark:border-lav-600/50"
        >
          <span class="text-3xl">📬</span>
          <div class="flex-1">
            <p class="font-display font-bold">
              {{ unread() }} tin nhắn chưa đọc
            </p>
            <p class="text-sm text-ink/70 dark:text-lav-100/70">Có khách liên hệ mới — bấm vào để xem chi tiết.</p>
          </div>
          <span class="text-lav-500 font-bold">→</span>
        </a>
      }

      <!-- Real-time Analytics Cards -->
      <div>
        <h3 class="font-display text-lg font-bold flex items-center gap-2">
          <span>📈</span> Thống kê lưu lượng truy cập (Privacy Analytics)
        </h3>

        @if (analytics(); as a) {
          <div class="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Tổng lượt xem</span>
              <p class="mt-1 font-display text-2xl sm:text-3xl font-extrabold gradient-text">{{ a.totalViews }}</p>
              <p class="text-[11px] text-ink/65 dark:text-lav-200/65 mt-0.5">+{{ a.viewsToday }} hôm nay</p>
            </div>

            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Khách truy cập</span>
              <p class="mt-1 font-display text-2xl sm:text-3xl font-extrabold gradient-text">{{ a.uniqueVisitors }}</p>
              <p class="text-[11px] text-ink/65 dark:text-lav-200/65 mt-0.5">Unique visitors</p>
            </div>

            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Lượt xem / Tải CV</span>
              <p class="mt-1 font-display text-2xl sm:text-3xl font-extrabold gradient-text">{{ a.cvViews }} / {{ a.cvDownloads }}</p>
              <p class="text-[11px] text-ink/65 dark:text-lav-200/65 mt-0.5">Quan tâm hồ sơ</p>
            </div>

            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Click Demo Dự Án</span>
              <p class="mt-1 font-display text-2xl sm:text-3xl font-extrabold gradient-text">{{ a.projectClicks }}</p>
              <p class="text-[11px] text-ink/65 dark:text-lav-200/65 mt-0.5">Tương tác dự án</p>
            </div>
          </div>

          <!-- Pure SVG 14-Day Traffic Trend Chart -->
          @if (chartPoints(); as cp) {
            <div class="card !rounded-2xl p-5 mt-4">
              <div class="flex items-center justify-between mb-3">
                <p class="font-display text-sm font-bold text-ink dark:text-white">
                  Xu hướng truy cập 14 ngày qua
                </p>
                <span class="text-xs text-lav-500 font-medium">
                  Tổng 14 ngày: {{ a.viewsLast7Days * 2 }} views
                </span>
              </div>

              <!-- SVG Chart -->
              <div class="w-full overflow-hidden">
                <svg viewBox="0 0 600 160" class="w-full h-36 overflow-visible">
                  <defs>
                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>

                  <!-- Area Fill -->
                  @if (cp.polygon) {
                    <polygon [attr.points]="cp.polygon" fill="url(#chartGrad)" />
                  }

                  <!-- Trend Polyline -->
                  @if (cp.polyline) {
                    <polyline
                      [attr.points]="cp.polyline"
                      fill="none"
                      stroke="#8b5cf6"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  }

                  <!-- Data Point Dots -->
                  @for (pt of cp.points; track pt.date) {
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.y"
                      r="4"
                      class="fill-lav-500 stroke-white dark:stroke-[#181630] stroke-2 hover:r-6 transition-all cursor-pointer"
                    >
                      <title>{{ pt.date }}: {{ pt.count }} views</title>
                    </circle>
                  }
                </svg>
              </div>

              <div class="flex justify-between text-[10px] text-ink/50 dark:text-lav-300/50 mt-1 border-t border-lav-100 dark:border-lav-800/40 pt-1">
                <span>{{ a.dailyViews[0]?.date }}</span>
                <span>Hôm nay ({{ a.dailyViews[a.dailyViews.length - 1]?.date }})</span>
              </div>
            </div>
          }

          <!-- Device Breakdown & Top Referrers -->
          <div class="grid gap-4 sm:grid-cols-2 mt-4">
            <!-- Devices -->
            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Thiết bị truy cập</span>
              <div class="mt-3 space-y-2">
                @for (entry of deviceList(); track entry.device) {
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium flex items-center gap-1.5">
                      {{ entry.icon }} {{ entry.device }}
                    </span>
                    <span class="font-mono font-bold">{{ entry.count }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Referrers -->
            <div class="card !rounded-2xl p-4">
              <span class="text-xs font-semibold text-lav-500 uppercase tracking-wider">Nguồn giới thiệu (Top Referrers)</span>
              <div class="mt-3 space-y-2">
                @if (a.topReferrers.length === 0) {
                  <p class="text-xs text-ink/60 dark:text-lav-300/60 italic">Chưa có nguồn giới thiệu bên ngoài (Direct traffic).</p>
                } @else {
                  @for (ref of a.topReferrers.slice(0, 4); track ref.referrer) {
                    <div class="flex items-center justify-between text-xs">
                      <span class="truncate max-w-[12rem] font-medium text-ink/80 dark:text-lav-200/80">{{ ref.referrer }}</span>
                      <span class="font-mono font-bold">{{ ref.count }}</span>
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- CMS Content Counts -->
      <div>
        <h3 class="font-display text-lg font-bold flex items-center gap-2">
          <span>🗂️</span> Nội dung quản trị trên Portfolio
        </h3>

        @if (loading()) {
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="skeleton h-24 w-full rounded-2xl"></div>
            }
          </div>
        } @else {
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        }
      </div>

      <!-- Latest Contact Messages -->
      @if (latest().length > 0) {
        <div>
          <h3 class="font-display text-lg font-extrabold">Tin nhắn liên hệ mới nhất</h3>
          <div class="mt-3 space-y-2">
            @for (msg of latest(); track msg.id) {
              <a
                routerLink="/admin/messages"
                class="card flex items-center gap-3 !rounded-2xl p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-glow"
                [class.border-l-4]="!msg.read"
                [class.border-l-lav-500]="!msg.read"
              >
                <span class="font-display font-bold">{{ msg.name }}</span>
                <span class="min-w-0 flex-1 truncate text-ink/70 dark:text-lav-100/70">
                  {{ msg.subject || msg.message }}
                </span>
                <span class="shrink-0 text-xs text-lav-500">{{ msg.createdAt | date: 'MMM d' }}</span>
              </a>
            }
          </div>
        </div>
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
  protected readonly analytics = signal<AnalyticsSummary | null>(null);

  protected readonly deviceList = computed(() => {
    const a = this.analytics();
    if (!a || !a.deviceBreakdown) return [];
    return Object.entries(a.deviceBreakdown).map(([device, count]) => {
      let icon = '💻';
      if (device === 'MOBILE') icon = '📱';
      if (device === 'TABLET') icon = '📟';
      return { device, count, icon };
    });
  });

  protected readonly chartPoints = computed(() => {
    const a = this.analytics();
    if (!a || !a.dailyViews || a.dailyViews.length === 0) return null;

    const data = a.dailyViews;
    const width = 580;
    const height = 130;
    const max = Math.max(5, ...data.map((d) => d.count));

    const points = data.map((d, i) => {
      const x = 10 + (i / Math.max(1, data.length - 1)) * width;
      const y = height - (d.count / max) * (height - 30) - 15;
      return { x: Math.round(x), y: Math.round(y), count: d.count, date: d.date };
    });

    const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const polygon = `${firstX},${height} ${polyline} ${lastX},${height}`;

    return { points, polyline, polygon };
  });

  ngOnInit(): void {
    forkJoin({
      skills: this.api.getSkills(),
      experiences: this.api.getExperiences(),
      projects: this.api.getProjects(),
      education: this.api.getEducation(),
      certifications: this.api.getCertifications(),
      posts: this.api.getPosts(),
    }).subscribe({
      next: (data) => {
        this.stats.set([
          { label: 'Skills', value: data.skills.length, icon: '🛠️', link: '/admin/skills' },
          { label: 'Experience', value: data.experiences.length, icon: '💼', link: '/admin/experiences' },
          { label: 'Projects', value: data.projects.length, icon: '🚀', link: '/admin/projects' },
          { label: 'Blog Posts', value: data.posts.length, icon: '✍️', link: '/admin/posts' },
          { label: 'Education', value: data.education.length, icon: '🎓', link: '/admin/education' },
          { label: 'Certifications', value: data.certifications.length, icon: '🏅', link: '/admin/certifications' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.adminApi.getAnalyticsSummary(14).subscribe({
      next: (summary) => this.analytics.set(summary),
      error: () => undefined,
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
