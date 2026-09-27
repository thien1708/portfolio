import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private ctx: AudioContext | null = null;
  readonly enabled = signal<boolean>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_sound') === 'true' : false
  );

  toggle(): boolean {
    const next = !this.enabled();
    this.enabled.set(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio_sound', String(next));
    }
    if (next) {
      this.playChime();
    }
    return next;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playClick(): void {
    if (!this.enabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio errors gracefully
    }
  }

  playChime(): void {
    if (!this.enabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const time = now + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  playSuccess(): void {
    if (!this.enabled()) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const time = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.07, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}
