import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ApiService } from '../../core/api.service';
import {
  Certification,
  EducationItem,
  Experience,
  Profile,
  Project,
  Skill,
} from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { Navbar } from './navbar';
import { Hero } from './hero';
import { About } from './about';
import { SkillsSection } from './skills-section';
import { ExperienceSection } from './experience-section';
import { ProjectsSection } from './projects-section';
import { EducationSection } from './education-section';
import { ContactSection } from './contact-section';
import { Footer } from './footer';
import { Icon } from '../../shared/icon';
import { ScrollProgress } from '../../shared/scroll-progress';
import { CursorGlow } from '../../shared/cursor-glow';
import { TechMarquee } from '../../shared/tech-marquee';
import { SectionDots } from '../../shared/section-dots';
import { CommandPalette } from '../../shared/command-palette';
import { CvModal } from '../../shared/cv-modal';
import { TerminalModal } from '../../shared/terminal-modal';
import { SeoService } from '../../core/seo.service';
import { AnalyticsService } from '../../core/analytics.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [
    Navbar,
    Hero,
    About,
    SkillsSection,
    ExperienceSection,
    ProjectsSection,
    EducationSection,
    ContactSection,
    Footer,
    Icon,
    ScrollProgress,
    CursorGlow,
    TechMarquee,
    SectionDots,
    CommandPalette,
    CvModal,
    TerminalModal,
  ],
  template: `
    <app-scroll-progress />
    <app-cursor-glow />
    <app-section-dots />
    <app-command-palette [profile]="profile()" (openCv)="cvOpen.set(true)" (openTerminal)="terminalOpen.set(true)" />
    <app-cv-modal [open]="cvOpen()" [cvUrl]="activeCvUrl()" (closed)="cvOpen.set(false)" />
    <app-terminal-modal
      [open]="terminalOpen()"
      [profile]="profile()"
      [skills]="skills()"
      [projects]="projects()"
      (closed)="terminalOpen.set(false)"
      (openCv)="cvOpen.set(true)"
    />
    <div class="grain-overlay"></div>

    <app-navbar [brand]="brand()" (openTerminal)="terminalOpen.set(true)" />
    <main>
      <app-hero [profile]="profile()" [cvUrl]="activeCvUrl()" (openCv)="cvOpen.set(true)" />
      @if (techList().length > 0) {
        <app-tech-marquee [items]="techList()" />
      }
      <app-about
        [profile]="profile()"
        [skills]="skills()"
        [projects]="projects()"
        [experiences]="experiences()"
      />
      <app-skills-section [skills]="skills()" />
      <app-experience-section [experiences]="experiences()" />
      <app-projects-section [projects]="projects()" />
      <app-education-section [education]="education()" [certifications]="certifications()" />
      <app-contact-section [profile]="profile()" />
    </main>
    <app-footer [profile]="profile()" />

    <!-- Floating Quick CLI Terminal Launcher -->
    <button
      type="button"
      class="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-2xl bg-[#0c1017]/90 text-emerald-400 border border-emerald-500/30 px-3.5 py-2.5 font-mono text-xs font-bold shadow-soft-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-[#161b22] hover:border-emerald-400/60"
      (click)="terminalOpen.set(true)"
      title="Mở Developer Terminal (Ctrl+~)"
      aria-label="Developer Terminal"
    >
      <span class="text-sm font-extrabold">&gt;_</span>
      <span class="hidden sm:inline">CLI Mode</span>
    </button>

    @if (showTop()) {
      <button
        type="button"
        class="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lav-500 to-peri-500 text-lg text-white shadow-soft-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
        (click)="scrollTop()"
        [attr.aria-label]="i18n.t('misc.backToTop')"
      >
        <app-icon name="arrow-up" />
      </button>
    }
  `,
})
export class Home implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly toast = inject(ToastService);
  private readonly seo = inject(SeoService);
  private readonly ngZone = inject(NgZone);
  private scrollTicking = false;

  protected readonly profile = signal<Profile | null>(null);
  protected readonly skills = signal<Skill[]>([]);
  protected readonly experiences = signal<Experience[]>([]);
  protected readonly projects = signal<Project[]>([]);
  protected readonly education = signal<EducationItem[]>([]);
  protected readonly certifications = signal<Certification[]>([]);
  protected readonly showTop = signal(false);
  protected readonly cvOpen = signal(false);
  protected readonly terminalOpen = signal(false);

  protected readonly i18n = inject(I18nService);

  protected readonly activeCvUrl = computed(() => {
    const profileUrl = this.profile()?.cvUrl;
    if (profileUrl && profileUrl !== '/cv.pdf') {
      return profileUrl;
    }
    return this.i18n.lang() === 'vi' ? '/cv-vi.pdf' : '/cv-en.pdf';
  });

  // Unique technology names across skills, projects and experience for the ticker.
  protected readonly techList = computed(() => {
    const set = new Set<string>();
    for (const s of this.skills()) set.add(s.name);
    for (const p of this.projects()) for (const t of p.techStack) set.add(t);
    for (const e of this.experiences()) for (const t of e.techStack) set.add(t);
    return [...set];
  });

  protected brand(): string {
    const name = this.profile()?.fullName;
    if (!name) {
      return 'Portfolio';
    }
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  ngOnInit(): void {
    this.analytics.init();
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onWindowScroll, { passive: true });
    });

    this.api.getPortfolio().subscribe({
      next: (data) => {
        this.profile.set(data.profile);
        this.seo.updateProfileSeo(data.profile);
        this.skills.set(data.skills);
        this.experiences.set(data.experiences);
        this.projects.set(data.projects);
        this.education.set(data.education);
        this.certifications.set(data.certifications);
      },
      error: () => this.toast.error(this.i18n.t('misc.loadFail')),
    });
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKey(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && (event.key === '`' || event.key === '~')) {
      event.preventDefault();
      this.terminalOpen.update((o) => !o);
    }
  }

  private readonly onWindowScroll = (): void => {
    if (this.scrollTicking) return;
    this.scrollTicking = true;
    requestAnimationFrame(() => {
      this.scrollTicking = false;
      const shouldShow = window.scrollY > 600;
      if (this.showTop() !== shouldShow) {
        this.ngZone.run(() => this.showTop.set(shouldShow));
      }
    });
  };

  protected scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
  }
}
