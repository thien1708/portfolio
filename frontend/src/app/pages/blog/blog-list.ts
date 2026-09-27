import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Post } from '../../core/models';
import { Icon } from '../../shared/icon';
import { SoundService } from '../../core/sound.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, Icon],
  template: `
    <div class="min-h-screen relative overflow-hidden py-12 px-6">
      <!-- Background subtle glows -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-lav-100/40 dark:bg-white/[0.015]"></div>
        <div class="absolute right-10 top-16 h-96 w-96 rounded-full bg-peri-300/25 blur-3xl dark:bg-peri-600/15"></div>
        <div class="absolute bottom-16 left-10 h-96 w-96 rounded-full bg-lav-300/25 blur-3xl dark:bg-lav-700/20"></div>
      </div>

      <div class="mx-auto max-w-5xl">
        <!-- Top Nav Back -->
        <div class="flex items-center justify-between gap-4 mb-10">
          <a
            routerLink="/"
            class="inline-flex items-center gap-2 text-sm font-semibold text-lav-600 hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100 transition-colors"
          >
            <app-icon name="arrow-left" />
            Về Trang Chủ Portfolio
          </a>

          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-lav-500/10 text-lav-600 dark:text-lav-300 border border-lav-500/20">
            ✍️ Tech Blog & Engineering Notes
          </span>
        </div>

        <!-- Header -->
        <div class="text-center mb-12">
          <p class="font-display text-sm font-semibold uppercase tracking-[0.3em] text-lav-500">
            Kinh nghiệm thực chiến & Chia sẻ
          </p>
          <h1 class="section-title mt-2">
            Bài viết <span class="gradient-text">Công nghệ</span>
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-ink/75 dark:text-lav-200/75 leading-relaxed">
            Các bài viết chia sẻ về kiến trúc Spring Boot, Angular, tối ưu hóa hiệu năng, bảo mật và thiết kế hệ thống phần mềm.
          </p>
        </div>

        <!-- Search and Filter Bar -->
        <div class="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Tìm kiếm bài viết hoặc từ khóa..."
              class="input !py-2.5 !pl-10 !pr-4 text-sm w-full"
            />
            <app-icon name="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-50 pointer-events-none" />
          </div>

          @if (allTags().length > 0) {
            <div class="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                class="rounded-full px-3 py-1 text-xs font-medium transition-all"
                [class.bg-lav-500]="selectedTag() === null"
                [class.text-white]="selectedTag() === null"
                [class.chip]="selectedTag() !== null"
                (click)="selectedTag.set(null)"
              >
                Tất cả
              </button>
              @for (tag of allTags(); track tag) {
                <button
                  type="button"
                  class="rounded-full px-3 py-1 text-xs font-medium transition-all"
                  [class.bg-lav-500]="selectedTag() === tag"
                  [class.text-white]="selectedTag() === tag"
                  [class.chip]="selectedTag() !== tag"
                  (click)="selectedTag.set(tag)"
                >
                  {{ tag }}
                </button>
              }
            </div>
          }
        </div>

        <!-- Posts Grid -->
        @if (loading()) {
          <div class="grid gap-6 md:grid-cols-2">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="skeleton h-80 rounded-3xl"></div>
            }
          </div>
        } @else if (filteredPosts().length === 0) {
          <div class="card p-14 text-center">
            <p class="text-4xl">🔍</p>
            <h2 class="mt-3 font-display text-lg font-bold">Không tìm thấy bài viết nào</h2>
            <p class="mt-1 text-sm text-ink/70 dark:text-lav-100/70">Hãy thử tìm với từ khóa khác.</p>
          </div>
        } @else {
          <div class="grid gap-8 md:grid-cols-2">
            @for (post of filteredPosts(); track post.id) {
              <article
                class="card group flex flex-col overflow-hidden !rounded-3xl border border-lav-200/60 dark:border-lav-700/40 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <!-- Cover Image -->
                @if (post.coverImageUrl) {
                  <div class="relative h-48 overflow-hidden">
                    <img
                      [src]="post.coverImageUrl"
                      [alt]="post.title"
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                }

                <div class="flex flex-1 flex-col p-6 sm:p-7">
                  <!-- Meta badges -->
                  <div class="flex items-center gap-3 text-xs text-lav-500 font-medium mb-3">
                    <span class="flex items-center gap-1">
                      <app-icon name="calendar" class="text-[0.7rem]" />
                      {{ post.createdAt | date: 'mediumDate' }}
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      ⏳ {{ post.readingTimeMinutes }} phút đọc
                    </span>
                    <span>•</span>
                    <span class="flex items-center gap-1">
                      👁️ {{ post.viewsCount }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h2 class="font-display text-lg sm:text-xl font-bold leading-snug group-hover:text-lav-600 dark:group-hover:text-lav-300 transition-colors">
                    <a [routerLink]="['/blog', post.slug]" (click)="sound.playClick()">
                      {{ post.title }}
                    </a>
                  </h2>

                  <!-- Summary -->
                  @if (post.summary) {
                    <p class="mt-3 flex-1 text-sm text-ink/75 dark:text-lav-200/75 leading-relaxed line-clamp-3">
                      {{ post.summary }}
                    </p>
                  }

                  <!-- Tags & Read More -->
                  <div class="mt-6 pt-4 border-t border-lav-100 dark:border-lav-800/40 flex items-center justify-between gap-2">
                    <div class="flex flex-wrap gap-1.5">
                      @for (t of post.tags.slice(0, 3); track t) {
                        <span class="chip !text-[11px] !py-0.5 !px-2.5">{{ t }}</span>
                      }
                    </div>

                    <a
                      [routerLink]="['/blog', post.slug]"
                      (click)="sound.playClick()"
                      class="inline-flex items-center gap-1 text-xs font-bold text-lav-600 dark:text-lav-300 hover:underline shrink-0"
                    >
                      Đọc tiếp →
                    </a>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class BlogList implements OnInit {
  private readonly api = inject(ApiService);
  protected readonly sound = inject(SoundService);

  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal(true);
  protected searchQuery = '';
  protected readonly selectedTag = signal<string | null>(null);

  protected readonly allTags = computed(() => {
    const set = new Set<string>();
    this.posts().forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  });

  protected readonly filteredPosts = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const tag = this.selectedTag();
    return this.posts().filter((p) => {
      if (!p.published) return false;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !tag || p.tags.includes(tag);
      return matchesQuery && matchesTag;
    });
  });

  ngOnInit(): void {
    this.api.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
