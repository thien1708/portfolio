import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import {
  Certification,
  EducationItem,
  Experience,
  Profile,
  Project,
  Skill,
} from '../../core/models';
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
  ],
  template: `
    <app-scroll-progress />
    <app-cursor-glow />
    <app-section-dots />
    <app-command-palette [profile]="profile()" />
    <div class="grain-overlay"></div>

    <app-navbar [brand]="brand()" />
    <main>
      <app-hero [profile]="profile()" />
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

    @if (showTop()) {
      <button
        type="button"
        class="fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lav-500 to-peri-500 text-lg text-white shadow-soft-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
        (click)="scrollTop()"
        aria-label="Back to top"
      >
        <app-icon name="arrow-up" />
      </button>
    }
  `,
})
export class Home implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  protected readonly profile = signal<Profile | null>(null);
  protected readonly skills = signal<Skill[]>([]);
  protected readonly experiences = signal<Experience[]>([]);
  protected readonly projects = signal<Project[]>([]);
  protected readonly education = signal<EducationItem[]>([]);
  protected readonly certifications = signal<Certification[]>([]);
  protected readonly showTop = signal(false);

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
    this.api.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: () => this.toast.error('Could not load the portfolio data. Is the backend running?'),
    });
    this.api.getSkills().subscribe((s) => this.skills.set(s));
    this.api.getExperiences().subscribe((e) => this.experiences.set(e));
    this.api.getProjects().subscribe((p) => this.projects.set(p));
    this.api.getEducation().subscribe((e) => this.education.set(e));
    this.api.getCertifications().subscribe((c) => this.certifications.set(c));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showTop.set(window.scrollY > 600);
  }

  protected scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
