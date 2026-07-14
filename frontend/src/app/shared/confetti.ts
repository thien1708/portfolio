/**
 * Tiny dependency-free confetti burst. Draws to a one-shot full-screen
 * canvas and removes it when the animation settles. No-op when the user
 * prefers reduced motion.
 */
const COLORS = ['#9D8DF1', '#8B98D4', '#A8D8EA', '#B8B5FF', '#7FC3DE', '#CFC5FF'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
}

export function burstConfetti(originX?: number, originY?: number): void {
  if (
    typeof window === 'undefined' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:80;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const ox = originX ?? window.innerWidth / 2;
  const oy = originY ?? window.innerHeight / 3;
  const pieces: Piece[] = Array.from({ length: 140 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    };
  });

  const gravity = 0.22;
  const start = performance.now();
  const DURATION = 2600;

  function frame(now: number): void {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.vy += gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / DURATION);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    if (elapsed < DURATION) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
