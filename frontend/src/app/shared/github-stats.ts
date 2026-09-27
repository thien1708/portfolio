import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Icon } from './icon';

interface GitHubUserResponse {
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  login: string;
  avatar_url: string;
  bio: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-github-stats',
  standalone: true,
  imports: [CommonModule, Icon],
  template: `
    <div class="card !rounded-2xl p-4 sm:p-5 border border-lav-200/60 dark:border-lav-700/40 bg-white/50 dark:bg-white/[0.02] backdrop-blur transition-all duration-300 hover:shadow-glow">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white dark:bg-white dark:text-ink shadow-sm">
            <app-icon name="github" class="text-lg" />
          </div>
          <div>
            <p class="font-display text-xs font-bold text-lav-500 uppercase tracking-wider">GitHub Activity</p>
            <a
              href="https://github.com/thien1708"
              target="_blank"
              rel="noopener"
              class="font-display font-extrabold text-sm hover:text-lav-500 transition-colors flex items-center gap-1"
            >
              &#64;thien1708
              <app-icon name="external" class="text-[0.65rem] opacity-60" />
            </a>
          </div>
        </div>

        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync
        </span>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl bg-lav-100/50 dark:bg-lav-800/20 p-2.5">
          <p class="font-display text-base font-extrabold gradient-text">{{ stats().repos }}</p>
          <p class="text-[11px] text-ink/70 dark:text-lav-200/70 font-medium mt-0.5">Repositories</p>
        </div>
        <div class="rounded-xl bg-lav-100/50 dark:bg-lav-800/20 p-2.5">
          <p class="font-display text-base font-extrabold gradient-text">{{ stats().followers }}</p>
          <p class="text-[11px] text-ink/70 dark:text-lav-200/70 font-medium mt-0.5">Followers</p>
        </div>
        <div class="rounded-xl bg-lav-100/50 dark:bg-lav-800/20 p-2.5">
          <p class="font-display text-base font-extrabold gradient-text">Top 1%</p>
          <p class="text-[11px] text-ink/70 dark:text-lav-200/70 font-medium mt-0.5">Clean Code</p>
        </div>
      </div>
    </div>
  `,
})
export class GithubStats implements OnInit {
  protected readonly stats = signal({
    repos: 18,
    followers: 12,
    following: 15,
  });

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const CACHE_KEY = 'pf_gh_stats';
    const CACHE_TIME_KEY = 'pf_gh_stats_time';

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
      if (cached && cachedTime && Date.now() - Number(cachedTime) < 3600_000) {
        this.stats.set(JSON.parse(cached));
        return;
      }
    } catch {
      // Ignore cache read errors
    }

    this.http.get<GitHubUserResponse>('https://api.github.com/users/thien1708').subscribe({
      next: (data) => {
        const val = {
          repos: data.public_repos || 18,
          followers: data.followers || 12,
          following: data.following || 15,
        };
        this.stats.set(val);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(val));
          sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch {
          // Ignore
        }
      },
      error: () => {
        // Keep default optimistic stats if rate limited
      },
    });
  }
}
