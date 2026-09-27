import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profile, Project, Skill } from '../core/models';
import { ThemeService, ACCENTS } from '../core/theme.service';
import { SoundService } from '../core/sound.service';
import { Icon } from './icon';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-terminal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <button
          type="button"
          class="absolute inset-0 bg-ink/60 backdrop-blur-md transition-opacity cursor-default"
          (click)="close()"
          aria-label="Close terminal"
          tabindex="-1"
        ></button>

        <!-- Terminal Window -->
        <div
          class="relative flex flex-col w-full max-w-3xl h-[32rem] max-h-[90vh] rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#0c1017]/95 text-emerald-400 font-mono text-sm shadow-2xl shadow-emerald-950/40 backdrop-blur-xl animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Developer Terminal"
        >
          <!-- Title Bar -->
          <div class="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-emerald-500/20 select-none">
            <div class="flex items-center gap-2">
              <span class="inline-block w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer hover:opacity-80" (click)="close()"></span>
              <span class="inline-block w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span class="inline-block w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span class="ml-2 text-xs font-semibold text-emerald-300/80 tracking-wide flex items-center gap-1.5">
                <app-icon name="terminal" class="text-xs" />
                bash — visitor&#64;tranvuthien:~ (CLI Mode)
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-emerald-500/50 hidden sm:inline">Type 'help' for commands</span>
              <button
                type="button"
                class="text-emerald-400/70 hover:text-emerald-300 p-1 rounded transition-colors"
                (click)="close()"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Terminal Body / History -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-2 text-xs sm:text-sm">
            @for (line of lines(); track $index) {
              @if (line.type === 'input') {
                <div class="flex items-start gap-2">
                  <span class="text-emerald-500/70 select-none font-bold">visitor&#64;tranvuthien:~$</span>
                  <span class="text-white">{{ line.text }}</span>
                </div>
              } @else if (line.type === 'error') {
                <div class="text-rose-400 pl-4 border-l-2 border-rose-500/40 whitespace-pre-wrap">{{ line.text }}</div>
              } @else if (line.type === 'success') {
                <div class="text-emerald-300 pl-4 border-l-2 border-emerald-500/40 whitespace-pre-wrap">{{ line.text }}</div>
              } @else {
                <div class="text-emerald-400/90 pl-4 border-l-2 border-emerald-500/20 whitespace-pre-wrap leading-relaxed">{{ line.text }}</div>
              }
            }
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="px-4 py-2 bg-[#12161f] border-t border-emerald-500/10 flex flex-wrap items-center gap-1.5">
            <span class="text-[11px] text-emerald-500/50 uppercase tracking-wider mr-1">Quick:</span>
            @for (cmd of quickCommands; track cmd) {
              <button
                type="button"
                class="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all hover:scale-105"
                (click)="runCommand(cmd)"
              >
                {{ cmd }}
              </button>
            }
          </div>

          <!-- Prompt Input Bar -->
          <form (ngSubmit)="submit()" class="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-t border-emerald-500/20">
            <span class="text-emerald-500 select-none font-bold">visitor&#64;tranvuthien:~$</span>
            <input
              #cmdInput
              type="text"
              [(ngModel)]="currentInput"
              name="terminalInput"
              (keydown)="onKeyDown($event)"
              class="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs sm:text-sm caret-emerald-400"
              autocomplete="off"
              spellcheck="false"
              placeholder="type a command..."
            />
          </form>
        </div>
      </div>
    }
  `,
})
export class TerminalModal implements OnInit {
  readonly open = input<boolean>(false);
  readonly profile = input<Profile | null>(null);
  readonly skills = input<Skill[]>([]);
  readonly projects = input<Project[]>([]);

  @Output() closed = new EventEmitter<void>();
  @Output() openCv = new EventEmitter<void>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('cmdInput') private cmdInput?: ElementRef<HTMLInputElement>;

  private readonly theme = inject(ThemeService);
  private readonly sound = inject(SoundService);

  protected currentInput = '';
  protected readonly lines = signal<TerminalLine[]>([]);
  private readonly history: string[] = [];
  private historyIndex = -1;

  protected readonly quickCommands = ['help', 'bio', 'skills', 'projects', 'cv', 'theme cyberpunk', 'sound'];

  ngOnInit(): void {
    this.lines.set([
      { type: 'output', text: '╔═══════════════════════════════════════════════════════════════════╗' },
      { type: 'output', text: '║   Welcome to Tran Vu Thien Interactive Terminal v2.4 (CLI mode)   ║' },
      { type: 'output', text: '║   Type "help" to view all available commands.                    ║' },
      { type: 'output', text: '╚═══════════════════════════════════════════════════════════════════╝' },
    ]);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    this.closed.emit();
  }

  runCommand(cmd: string): void {
    this.currentInput = cmd;
    this.submit();
  }

  submit(): void {
    const raw = this.currentInput.trim();
    this.sound.playClick();
    if (!raw) return;

    // Add input line
    this.lines.update((prev) => [...prev, { type: 'input', text: raw }]);
    this.history.push(raw);
    this.historyIndex = this.history.length;
    this.currentInput = '';

    const args = raw.split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        this.addOutput(
          `Available commands:\n` +
          `  bio / about       - Information about Tran Vu Thien\n` +
          `  skills            - List categorized technical skills & proficiencies\n` +
          `  projects          - List highlight projects and repositories\n` +
          `  cv [--download]   - Open CV preview modal or download PDF\n` +
          `  theme <name>      - Switch color accent: default, cyberpunk, matrix, tokyo-night, dracula\n` +
          `  sound [on|off]    - Toggle Web Audio interactive sound feedback\n` +
          `  contact           - View direct contact details & social channels\n` +
          `  clear             - Clear terminal screen\n` +
          `  exit              - Exit CLI mode\n` +
          `  sudo <cmd>        - Execute root command`
        );
        break;

      case 'bio':
      case 'about':
        const p = this.profile();
        if (p) {
          this.addOutput(
            `Name:      ${p.fullName}\n` +
            `Title:     ${p.title}\n` +
            `Location:  ${p.location || 'Ho Chi Minh City, Vietnam'}\n` +
            `Email:     ${p.email}\n` +
            `Summary:   ${p.summary || 'Software Development Engineer'}`
          );
        } else {
          this.addOutput('Tran Vu Thien — Software Engineer specializing in Spring Boot, Angular, and High-Performance Web Architecture.');
        }
        break;

      case 'skills':
        const sks = this.skills();
        if (sks.length > 0) {
          const grouped: Record<string, string[]> = {};
          sks.forEach((s) => {
            grouped[s.category] = grouped[s.category] || [];
            grouped[s.category].push(`${s.name} (${s.proficiency}%)`);
          });
          let out = 'Technical Competencies:\n';
          Object.entries(grouped).forEach(([cat, list]) => {
            out += `  [${cat}]: ${list.join(', ')}\n`;
          });
          this.addOutput(out.trim());
        } else {
          this.addOutput('Skills: Java, Spring Boot, Angular, TypeScript, PostgreSQL, Docker, Microservices, CI/CD.');
        }
        break;

      case 'projects':
        const projs = this.projects();
        if (projs.length > 0) {
          let out = 'Highlighted Projects:\n';
          projs.slice(0, 5).forEach((proj, i) => {
            out += `  ${i + 1}. ${proj.name} [${proj.period || 'Recent'}]\n` +
                   `     Stack: ${proj.techStack.join(', ')}\n` +
                   (proj.demoUrl ? `     Demo:  ${proj.demoUrl}\n` : '') +
                   (proj.repoUrl ? `     Repo:  ${proj.repoUrl}\n` : '');
          });
          this.addOutput(out.trim());
        } else {
          this.addOutput('No projects loaded yet.');
        }
        break;

      case 'cv':
        if (args.includes('--download')) {
          const cvUrl = this.profile()?.cvUrl || '/cv.pdf';
          window.open(cvUrl, '_blank');
          this.addSuccess(`Downloading CV from: ${cvUrl}`);
        } else {
          this.openCv.emit();
          this.addSuccess('Opening CV preview modal in background...');
        }
        break;

      case 'theme':
        const themeArg = args[1]?.toLowerCase();
        if (!themeArg) {
          this.addOutput(`Current theme: ${this.theme.accent()}\nAvailable: default, cyberpunk, matrix, tokyo-night, dracula`);
        } else if (ACCENTS.some((a) => a.id === themeArg)) {
          this.theme.setAccent(themeArg);
          this.sound.playSuccess();
          this.addSuccess(`Switched theme accent to: [${themeArg}]`);
        } else {
          this.addError(`Unknown theme: "${themeArg}". Choose from: default, cyberpunk, matrix, tokyo-night, dracula`);
        }
        break;

      case 'sound':
        const state = this.sound.toggle();
        this.addSuccess(`Audio feedback: ${state ? 'ENABLED (Synthesized Web Audio)' : 'DISABLED'}`);
        break;

      case 'contact':
        const prof = this.profile();
        this.addOutput(
          `Contact Information:\n` +
          `  Email:    ${prof?.email || 'thientran1708@gmail.com'}\n` +
          `  GitHub:   ${prof?.githubUrl || 'https://github.com/thien1708'}\n` +
          `  LinkedIn: ${prof?.linkedinUrl || 'https://linkedin.com/in/thien1708'}\n` +
          `  Location: ${prof?.location || 'Ho Chi Minh City, Vietnam'}`
        );
        break;

      case 'clear':
        this.lines.set([]);
        break;

      case 'exit':
      case 'quit':
        this.close();
        break;

      case 'sudo':
        this.sound.playSuccess();
        this.addSuccess('Access granted. You already possess root superpowers here! 🚀');
        break;

      default:
        this.addError(`Command not found: "${cmd}". Type "help" for a list of available commands.`);
        break;
    }

    this.scrollToBottom();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.currentInput = this.history[this.historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.currentInput = this.history[this.historyIndex] || '';
      } else {
        this.historyIndex = this.history.length;
        this.currentInput = '';
      }
    }
  }

  private addOutput(text: string): void {
    this.lines.update((prev) => [...prev, { type: 'output', text }]);
  }

  private addError(text: string): void {
    this.lines.update((prev) => [...prev, { type: 'error', text }]);
  }

  private addSuccess(text: string): void {
    this.lines.update((prev) => [...prev, { type: 'success', text }]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
      if (this.cmdInput) {
        this.cmdInput.nativeElement.focus();
      }
    }, 20);
  }
}
