import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/api.service';
import { Post } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { SoundService } from '../../core/sound.service';
import { SeoService } from '../../core/seo.service';
import { Icon } from '../../shared/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, Icon],
  template: `
    <div class="min-h-screen relative overflow-hidden py-12 px-6">
      <!-- Background subtle glows -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-lav-100/40 dark:bg-white/[0.015]"></div>
        <div class="absolute right-10 top-16 h-96 w-96 rounded-full bg-peri-300/25 blur-3xl dark:bg-peri-600/15"></div>
        <div class="absolute bottom-16 left-10 h-96 w-96 rounded-full bg-lav-300/25 blur-3xl dark:bg-lav-700/20"></div>
      </div>

      <div class="mx-auto max-w-3xl">
        <!-- Back Link & Share -->
        <div class="flex items-center justify-between gap-4 mb-8">
          <a
            routerLink="/blog"
            class="inline-flex items-center gap-2 text-sm font-semibold text-lav-600 hover:text-lav-800 dark:text-lav-300 dark:hover:text-lav-100 transition-colors"
          >
            <app-icon name="arrow-left" />
            Về danh sách bài viết
          </a>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/70 dark:bg-white/10 border border-lav-200 dark:border-lav-700/50 shadow-sm hover:scale-105 transition-all"
            (click)="copyShareLink()"
          >
            🔗 Chia sẻ bài viết
          </button>
        </div>

        @if (loading()) {
          <div class="space-y-4">
            <div class="skeleton h-12 w-3/4 rounded-2xl"></div>
            <div class="skeleton h-6 w-1/3 rounded-xl"></div>
            <div class="skeleton h-64 w-full rounded-3xl mt-6"></div>
            <div class="skeleton h-32 w-full rounded-2xl"></div>
          </div>
        } @else if (post(); as p) {
          <article class="card p-6 sm:p-10 !rounded-3xl border border-lav-200/70 dark:border-lav-700/40 bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-soft">
            <!-- Meta Bar -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-lav-500 font-medium mb-4">
              <span class="flex items-center gap-1">
                <app-icon name="calendar" class="text-[0.7rem]" />
                {{ p.createdAt | date: 'longDate' }}
              </span>
              <span>•</span>
              <span>⏳ {{ p.readingTimeMinutes }} phút đọc</span>
              <span>•</span>
              <span>👁️ {{ p.viewsCount }} lượt xem</span>
            </div>

            <!-- Title -->
            <h1 class="font-display text-2xl sm:text-4xl font-extrabold leading-tight">
              {{ p.title }}
            </h1>

            <!-- Tags -->
            <div class="mt-4 flex flex-wrap gap-2">
              @for (tag of p.tags; track tag) {
                <span class="chip text-xs">{{ tag }}</span>
              }
            </div>

            <!-- Cover -->
            @if (p.coverImageUrl) {
              <div class="mt-8 overflow-hidden rounded-2xl border border-lav-200/50 dark:border-lav-700/30">
                <img [src]="p.coverImageUrl" [alt]="p.title" class="h-64 sm:h-80 w-full object-cover" />
              </div>
            }

            <!-- Content HTML -->
            <div class="mt-8 prose prose-lav dark:prose-invert max-w-none text-ink/85 dark:text-lav-100/90 leading-relaxed text-sm sm:text-base space-y-4" [innerHTML]="renderedContent()"></div>

            <!-- Bottom author box -->
            <div class="mt-12 pt-6 border-t border-lav-200/70 dark:border-lav-700/40 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-lav-500 to-peri-500 text-white font-display font-extrabold shadow-soft">
                  TVT
                </div>
                <div>
                  <p class="font-display font-bold text-sm">Trần Vũ Thiện</p>
                  <p class="text-xs text-ink/65 dark:text-lav-200/65">Software Development Engineer</p>
                </div>
              </div>

              <a
                routerLink="/blog"
                class="btn-ghost !px-4 !py-2 text-xs font-semibold"
              >
                Xem thêm bài viết →
              </a>
            </div>
          </article>
        } @else {
          <div class="card p-14 text-center">
            <p class="text-4xl">📄</p>
            <h2 class="mt-3 font-display text-lg font-bold">Không tìm thấy bài viết</h2>
            <p class="mt-1 text-sm text-ink/70 dark:text-lav-100/70">Bài viết có thể đã bị gỡ hoặc chưa được công khai.</p>
            <a routerLink="/blog" class="btn-primary mt-6 text-sm">Về danh sách bài viết</a>
          </div>
        }
      </div>
    </div>
  `,
})
export class BlogPost implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly sound = inject(SoundService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(SeoService);

  protected readonly post = signal<Post | null>(null);
  protected readonly loading = signal(true);

  protected readonly renderedContent = computed<SafeHtml>(() => {
    const p = this.post();
    if (!p) return '';
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownToHtml(p.content));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.router.navigate(['/blog']);
        return;
      }
      this.loadPost(slug);
    });
  }

  private loadPost(slug: string): void {
    this.loading.set(true);
    this.api.getPostBySlug(slug).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
        // Dynamic SEO tags for the post
        this.seo.updateArticleSeo({
          title: `${post.title} — Trần Vũ Thiện`,
          description: post.summary || post.title,
          image: post.coverImageUrl || undefined,
          url: window.location.href,
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  copyShareLink(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.sound.playSuccess();
      this.toast.success('Đã sao chép link bài viết vào bộ nhớ tạm!');
    }
  }

  private markdownToHtml(md: string): string {
    if (!md) return '';

    let html = md
      // Escape HTML entities to prevent XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced Code blocks
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      return `<pre class="my-4 overflow-x-auto rounded-2xl bg-[#0e1117] p-4 text-xs sm:text-sm font-mono text-emerald-400 border border-emerald-500/20"><div class="mb-2 text-[10px] text-lav-400 uppercase font-bold tracking-wider">${lang || 'CODE'}</div><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-lav-200/60 dark:bg-lav-800/60 font-mono text-xs text-lav-700 dark:text-lav-300">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="font-display text-lg font-bold mt-6 mb-2 text-lav-600 dark:text-lav-300">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="font-display text-xl sm:text-2xl font-extrabold mt-8 mb-3 text-ink dark:text-white">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="font-display text-2xl sm:text-3xl font-extrabold mt-8 mb-4 gradient-text">$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-ink dark:text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="flex gap-2 items-start my-1"><span class="text-lav-500 mt-1">▸</span><span>$1</span></li>');

    // Paragraphs
    const lines = html.split('\n\n');
    return lines
      .map((block) => {
        block = block.trim();
        if (
          block.startsWith('<h') ||
          block.startsWith('<pre') ||
          block.startsWith('<li') ||
          block.startsWith('<div')
        ) {
          return block;
        }
        return `<p class="leading-relaxed my-3">${block.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('\n');
  }
}
