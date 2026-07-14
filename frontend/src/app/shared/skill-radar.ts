import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Skill } from '../core/models';

interface Axis {
  label: string;
  value: number;
  x: number;
  y: number;
  lx: number;
  ly: number;
  anchor: string;
}

const CX = 125;
const CY = 105;
const R = 72;

@Component({
  selector: 'app-skill-radar',
  template: `
    @if (axes().length >= 3) {
      <svg viewBox="0 0 250 210" class="mx-auto h-full w-full max-w-sm">
        <!-- grid rings -->
        @for (ring of rings; track ring) {
          <polygon
            [attr.points]="ringPoints(ring)"
            fill="none"
            class="stroke-lav-300/50 dark:stroke-lav-600/40"
            stroke-width="1"
          />
        }
        <!-- axes -->
        @for (a of axes(); track a.label) {
          <line
            [attr.x1]="cx"
            [attr.y1]="cy"
            [attr.x2]="edgeX(a)"
            [attr.y2]="edgeY(a)"
            class="stroke-lav-300/50 dark:stroke-lav-600/40"
            stroke-width="1"
          />
        }
        <!-- data polygon -->
        <polygon
          [attr.points]="polygon()"
          class="fill-lav-400/30 stroke-lav-500 dark:fill-lav-500/25 dark:stroke-lav-300"
          stroke-width="2"
          stroke-linejoin="round"
          [style.transform]="shown() ? 'scale(1)' : 'scale(0)'"
          [style.transform-origin]="cx + 'px ' + cy + 'px'"
          style="transition: transform 1s cubic-bezier(0.22,0.61,0.36,1)"
        />
        <!-- vertices -->
        @for (a of axes(); track a.label) {
          <circle
            [attr.cx]="a.x"
            [attr.cy]="a.y"
            r="3"
            class="fill-lav-500 dark:fill-lav-300"
            [style.opacity]="shown() ? 1 : 0"
            style="transition: opacity 0.6s ease 0.5s"
          />
        }
        <!-- labels -->
        @for (a of axes(); track a.label) {
          <text
            [attr.x]="a.lx"
            [attr.y]="a.ly"
            [attr.text-anchor]="a.anchor"
            class="fill-ink/70 text-[9px] font-semibold dark:fill-lav-100/70"
            dominant-baseline="middle"
          >
            {{ a.label }}
          </text>
        }
      </svg>
    }
  `,
})
export class SkillRadar implements AfterViewInit, OnDestroy {
  readonly skills = input<Skill[]>([]);

  protected readonly cx = CX;
  protected readonly cy = CY;
  protected readonly rings = [0.25, 0.5, 0.75, 1];
  protected readonly shown = signal(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  protected readonly axes = computed<Axis[]>(() => {
    const map = new Map<string, { sum: number; n: number }>();
    for (const s of this.skills()) {
      const key = this.titleCase(s.category);
      const acc = map.get(key) ?? { sum: 0, n: 0 };
      acc.sum += s.proficiency;
      acc.n += 1;
      map.set(key, acc);
    }
    const cats = [...map.entries()].map(([label, { sum, n }]) => ({
      label: this.shorten(label),
      value: Math.round(sum / n),
    }));
    const count = cats.length;
    return cats.map((c, i) => {
      const angle = (-90 + (i * 360) / count) * (Math.PI / 180);
      const r = (c.value / 100) * R;
      const lr = R + 14;
      const lx = CX + Math.cos(angle) * lr;
      const cos = Math.cos(angle);
      return {
        ...c,
        x: CX + Math.cos(angle) * r,
        y: CY + Math.sin(angle) * r,
        lx,
        ly: CY + Math.sin(angle) * lr,
        anchor: cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle',
      };
    });
  });

  protected readonly polygon = computed(() =>
    this.axes()
      .map((a) => `${a.x.toFixed(1)},${a.y.toFixed(1)}`)
      .join(' '),
  );

  protected ringPoints(scale: number): string {
    const axes = this.axes();
    const count = axes.length;
    return Array.from({ length: count }, (_, i) => {
      const angle = (-90 + (i * 360) / count) * (Math.PI / 180);
      const r = R * scale;
      return `${(CX + Math.cos(angle) * r).toFixed(1)},${(CY + Math.sin(angle) * r).toFixed(1)}`;
    }).join(' ');
  }

  protected edgeX(a: Axis): number {
    const angle = Math.atan2(a.y - CY, a.x - CX);
    return CX + Math.cos(angle) * R;
  }

  protected edgeY(a: Axis): number {
    const angle = Math.atan2(a.y - CY, a.x - CX);
    return CY + Math.sin(angle) * R;
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.shown.set(true);
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.shown.set(true);
            this.observer?.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this.host.nativeElement);
  }

  private titleCase(value: string): string {
    return value
      .split(/[\s/]+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Keep radar labels short so they never clip the SVG box.
  private shorten(label: string): string {
    const t = this.titleCase(label);
    return t.length > 10 ? t.split(' ')[0] : t;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
