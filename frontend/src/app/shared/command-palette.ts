import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { Profile } from '../core/models';
import { Icon } from './icon';

interface Command {
  label: string;
  hint: string;
  icon: string;
  action: () => void;
  keywords: string;
}

/**
 * Command palette (Ctrl/⌘+K) for jumping to sections and external links.
 * Keyboard: ↑/↓ to move, Enter to run, Esc to close.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-command-palette',
  imports: [Icon],
  template: `
    @if (open()) {
      <div class="cmdk-backdrop">
        <button
          type="button"
          class="absolute inset-0 cursor-default"
          aria-label="Close command palette"
          tabindex="-1"
          (click)="close()"
        ></button>
        <div
          class="cmdk-panel glass relative w-full max-w-lg overflow-hidden rounded-2xl shadow-soft-lg"
        >
          <div class="flex items-center gap-3 border-b border-lav-200/50 px-4 py-3 dark:border-lav-700/40">
            <span class="text-lav-500"><app-icon name="sparkles" /></span>
            <input
              #search
              type="text"
              class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-lav-500/50 dark:text-lav-100"
              placeholder="Jump to a section or link…"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKeydown($event)"
            />
            <kbd class="rounded-md border border-lav-300/60 px-1.5 py-0.5 text-[10px] font-semibold text-lav-500 dark:border-lav-600/60">ESC</kbd>
          </div>
          <ul class="max-h-80 overflow-y-auto p-2">
            @for (cmd of filtered(); track cmd.label; let i = $index) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
                  [class.bg-lav-100]="i === activeIndex()"
                  [class.dark:bg-lav-800]="i === activeIndex()"
                  (click)="run(cmd)"
                  (mouseenter)="activeIndex.set(i)"
                >
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-lav-100 text-lav-600 dark:bg-lav-800/60 dark:text-lav-300">
                    <app-icon [name]="cmd.icon" />
                  </span>
                  <span class="flex-1 font-medium">{{ cmd.label }}</span>
                  <span class="text-xs text-lav-500/70">{{ cmd.hint }}</span>
                </button>
              </li>
            } @empty {
              <li class="px-3 py-6 text-center text-sm text-lav-500/70">No matches</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
})
export class CommandPalette {
  readonly profile = input<Profile | null>(null);

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  private readonly sections: { id: string; label: string }[] = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];

  private readonly commands = computed<Command[]>(() => {
    const list: Command[] = this.sections.map((s) => ({
      label: s.label,
      hint: 'Section',
      icon: 'arrow-right',
      keywords: s.label.toLowerCase(),
      action: () => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }),
    }));
    const p = this.profile();
    if (p?.githubUrl) {
      list.push({ label: 'GitHub', hint: 'Link', icon: 'github', keywords: 'github code source', action: () => this.openUrl(p.githubUrl!) });
    }
    if (p?.linkedinUrl) {
      list.push({ label: 'LinkedIn', hint: 'Link', icon: 'linkedin', keywords: 'linkedin', action: () => this.openUrl(p.linkedinUrl!) });
    }
    if (p?.cvUrl) {
      list.push({ label: 'Download CV', hint: 'Link', icon: 'download', keywords: 'cv resume', action: () => this.openUrl(p.cvUrl!) });
    }
    if (p?.email) {
      list.push({ label: 'Email me', hint: 'Link', icon: 'mail', keywords: 'email contact mail', action: () => this.openUrl('mailto:' + p.email) });
    }
    return list;
  });

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return this.commands();
    }
    return this.commands().filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q),
    );
  });

  constructor() {
    // Keep the highlighted item in range as the list shrinks.
    effect(() => {
      const len = this.filtered().length;
      if (this.activeIndex() >= len) {
        this.activeIndex.set(Math.max(0, len - 1));
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape' && this.open()) {
      this.close();
    }
  }

  private toggle(): void {
    this.open.update((o) => !o);
    if (this.open()) {
      this.query.set('');
      this.activeIndex.set(0);
      setTimeout(() => document.querySelector<HTMLInputElement>('.cmdk-panel input')?.focus(), 40);
    }
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.filtered();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => (i + 1) % Math.max(1, items.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => (i - 1 + items.length) % Math.max(1, items.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const cmd = items[this.activeIndex()];
      if (cmd) {
        this.run(cmd);
      }
    }
  }

  protected run(cmd: Command): void {
    this.close();
    cmd.action();
  }

  private openUrl(url: string): void {
    window.open(url, url.startsWith('mailto:') ? '_self' : '_blank', 'noopener');
  }
}
