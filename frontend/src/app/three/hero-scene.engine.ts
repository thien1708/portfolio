import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Fog,
  Group,
  LineLoop,
  Mesh,
  Object3D,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  ATMO_FRAGMENT,
  ATMO_VERTEX,
  PLANET_FRAGMENT,
  PLANET_VERTEX,
  RING_FRAGMENT,
  RING_VERTEX,
  SUN_FRAGMENT,
  SUN_VERTEX,
  TRAIL_FRAGMENT,
  TRAIL_VERTEX,
} from './shaders';

interface ThemePalette {
  fog: Color;
  sunGlowInner: number;
  sunGlowOuter: number;
  atmoIntensity: number;
  trailBase: number;
  trailHead: number;
  nebulaOpacity: number;
  planetAmbient: number;
  ringOpacity: number;
}

const LIGHT: ThemePalette = {
  fog: new Color('#f7f5ff'),
  sunGlowInner: 0.75,
  sunGlowOuter: 0.4,
  atmoIntensity: 0.4,
  trailBase: 0.1,
  trailHead: 0.55,
  nebulaOpacity: 0.1,
  planetAmbient: 0.5,
  ringOpacity: 0.5,
};

const DARK: ThemePalette = {
  fog: new Color('#181630'),
  sunGlowInner: 1.0,
  sunGlowOuter: 0.65,
  atmoIntensity: 0.9,
  trailBase: 0.16,
  trailHead: 0.9,
  nebulaOpacity: 0.24,
  planetAmbient: 0.3,
  ringOpacity: 0.65,
};

/** Pastel planets: orbit radius, body size, angular speed, start angle, tilt, band frequency. */
const PLANETS = [
  { label: 'Java', color: '#a6b1e1', radius: 1.25, size: 0.1, speed: 0.5, phase: 0.8, incl: 0.07, bands: 9.0 },
  { label: 'Spring Boot', color: '#7fc3de', radius: 1.75, size: 0.14, speed: 0.37, phase: 2.4, incl: -0.06, bands: 6.0 },
  { label: 'Angular', color: '#9d8df1', radius: 2.35, size: 0.18, speed: 0.27, phase: 4.4, incl: 0.1, bands: 5.0, moon: true },
  { label: 'TypeScript', color: '#e8a7c8', radius: 3.0, size: 0.13, speed: 0.2, phase: 1.6, incl: -0.09, bands: 8.0 },
  { label: 'PostgreSQL', color: '#cfc5ff', radius: 3.8, size: 0.24, speed: 0.14, phase: 5.3, incl: 0.06, bands: 4.0, ring: true },
  { label: 'Docker', color: '#9fe0cb', radius: 4.6, size: 0.15, speed: 0.1, phase: 3.1, incl: -0.05, bands: 7.0 },
];

interface PlanetRuntime {
  mesh: Mesh;
  material: ShaderMaterial;
  atmosphere: ShaderMaterial;
  trail: ShaderMaterial;
  radius: number;
  speed: number;
  phase: number;
}

/**
 * The hero background: a pastel solar system — an fBm-churning sun with a
 * two-layer glow, six banded planets with fresnel atmospheres on inclined
 * orbits (one ringed, one with a moon), comet-tail orbit trails — over
 * faint static nebulae. Loaded via dynamic import so three.js ships as its
 * own lazy chunk, off the critical path. Purely decorative: no pointer
 * interaction, the camera only drifts on a slow idle path.
 *
 * Perf guards: DPR is capped and steps down automatically when the frame
 * rate drops, the loop pauses while the canvas is offscreen or the tab is
 * hidden, and reduced-motion renders exactly one static frame.
 */
export class HeroSceneEngine {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly solar = new Group();
  private readonly sunMaterial: ShaderMaterial;
  private glowInner!: SpriteMaterial;
  private glowOuter!: SpriteMaterial;
  private readonly nebulaMaterials: SpriteMaterial[] = [];
  private ringMaterial?: ShaderMaterial;
  private readonly planets: PlanetRuntime[] = [];
  private moonPivot?: Object3D;
  private readonly sunWorldPos = new Vector3();
  private glowTexture!: CanvasTexture;
  private readonly disposables: { dispose(): void }[] = [];
  private readonly resizeObserver: ResizeObserver;
  private readonly intersection: IntersectionObserver;

  private raf = 0;
  private time = 0;
  private lastFrame = 0;
  private running = false;
  private inView = true;
  /** Rolling frame-time average for the adaptive-quality step-down. */
  private frameAvg = 16.7;
  private dpr: number;

  constructor(
    private readonly host: HTMLElement,
    private readonly reducedMotion: boolean,
  ) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.appendChild(this.renderer.domElement);

    this.camera = new PerspectiveCamera(45, 1, 0.1, 60);
    this.camera.position.set(0, 0.6, 9);
    this.scene.fog = new Fog(LIGHT.fog, 9, 30);

    this.buildGlowTexture();
    this.buildNebulae();

    // Solar system, tilted so the orbits read as ellipses with depth.
    this.solar.rotation.set(-0.52, 0, 0.1);
    this.sunMaterial = this.buildSun();
    this.buildPlanets();
    this.scene.add(this.solar);

    this.setTheme(document.documentElement.classList.contains('dark'));
    this.applySize();

    this.resizeObserver = new ResizeObserver(() => {
      this.applySize();
      if (this.reducedMotion) this.renderOnce();
    });
    this.resizeObserver.observe(host);

    this.intersection = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.syncLoop();
    });
    this.intersection.observe(host);

    document.addEventListener('visibilitychange', this.onVisibility);

    if (this.reducedMotion) {
      this.renderOnce();
    } else {
      this.running = true;
      this.syncLoop();
    }
  }

  /** Re-tint every material for light/dark without rebuilding the scene. */
  setTheme(dark: boolean): void {
    const p = dark ? DARK : LIGHT;
    this.glowInner.opacity = p.sunGlowInner;
    this.glowOuter.opacity = p.sunGlowOuter;
    for (const nebula of this.nebulaMaterials) {
      nebula.opacity = p.nebulaOpacity;
    }
    if (this.ringMaterial) {
      this.ringMaterial.uniforms['uOpacity'].value = p.ringOpacity;
    }
    for (const planet of this.planets) {
      planet.material.uniforms['uAmbient'].value = p.planetAmbient;
      planet.atmosphere.uniforms['uIntensity'].value = p.atmoIntensity;
      planet.trail.uniforms['uBase'].value = p.trailBase;
      planet.trail.uniforms['uTrail'].value = p.trailHead;
    }
    (this.scene.fog as Fog).color.copy(p.fog);
    if (this.reducedMotion) this.renderOnce();
  }

  dispose(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  /** Shared radial-gradient billboard used by the sun glow and nebulae. */
  private buildGlowTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.32)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    this.glowTexture = new CanvasTexture(canvas);
    this.disposables.push(this.glowTexture);
  }

  /** Two faint colored clouds far behind everything — cheap depth and mood. */
  private buildNebulae(): void {
    const defs = [
      { color: '#9d8df1', pos: new Vector3(-6, 3.2, -16), scale: 17 },
      { color: '#57aacb', pos: new Vector3(7.5, -4, -18), scale: 20 },
    ];
    for (const def of defs) {
      const material = new SpriteMaterial({
        map: this.glowTexture,
        color: new Color(def.color),
        transparent: true,
        opacity: LIGHT.nebulaOpacity,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new Sprite(material);
      sprite.position.copy(def.pos);
      sprite.scale.setScalar(def.scale);
      this.scene.add(sprite);
      this.nebulaMaterials.push(material);
      this.disposables.push(material);
    }
  }

  private buildSun(): ShaderMaterial {
    const geometry = new SphereGeometry(0.58, 48, 32);
    const material = new ShaderMaterial({
      vertexShader: SUN_VERTEX,
      fragmentShader: SUN_FRAGMENT,
      uniforms: {
        uHot: { value: new Color('#ff8a4a') },
        uMid: { value: new Color('#ffc47e') },
        uEdge: { value: new Color('#ff7a5c') },
        uTime: { value: 0 },
      },
    });
    const sun = new Mesh(geometry, material);
    sun.name = 'sun';
    this.solar.add(sun);
    this.disposables.push(geometry, material);

    // Two-layer glow: tight bright halo + wide warm corona.
    this.glowInner = new SpriteMaterial({
      map: this.glowTexture,
      color: new Color('#ffe9c4'),
      transparent: true,
      opacity: LIGHT.sunGlowInner,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const inner = new Sprite(this.glowInner);
    inner.scale.setScalar(2.1);
    this.solar.add(inner);

    this.glowOuter = new SpriteMaterial({
      map: this.glowTexture,
      color: new Color('#ffab6b'),
      transparent: true,
      opacity: LIGHT.sunGlowOuter,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const outer = new Sprite(this.glowOuter);
    outer.scale.setScalar(4.6);
    this.solar.add(outer);
    this.disposables.push(this.glowInner, this.glowOuter);

    return material;
  }

  private buildPlanets(): void {
    const sphere = new SphereGeometry(1, 28, 20);
    this.disposables.push(sphere);

    for (const [index, def] of PLANETS.entries()) {
      // Each orbit lives on its own slightly inclined plane.
      const plane = new Group();
      plane.rotation.x = def.incl;
      plane.rotation.z = def.incl * 0.6;
      this.solar.add(plane);

      // Comet-tail orbit line: faint full ellipse + bright fading trail.
      const segments = 160;
      const positions = new Float32Array(segments * 3);
      const angles = new Float32Array(segments);
      for (let s = 0; s < segments; s++) {
        const a = (s / segments) * Math.PI * 2;
        positions[s * 3] = Math.cos(a) * def.radius;
        positions[s * 3 + 1] = 0;
        positions[s * 3 + 2] = Math.sin(a) * def.radius;
        angles[s] = a;
      }
      const trailGeometry = new BufferGeometry();
      trailGeometry.setAttribute('position', new BufferAttribute(positions, 3));
      trailGeometry.setAttribute('aAngle', new BufferAttribute(angles, 1));
      const trail = new ShaderMaterial({
        vertexShader: TRAIL_VERTEX,
        fragmentShader: TRAIL_FRAGMENT,
        uniforms: {
          uColor: { value: new Color(def.color) },
          uHead: { value: def.phase },
          uBase: { value: LIGHT.trailBase },
          uTrail: { value: LIGHT.trailHead },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      });
      plane.add(new LineLoop(trailGeometry, trail));
      this.disposables.push(trailGeometry, trail);

      // The planet body with banded procedural surface.
      const material = new ShaderMaterial({
        vertexShader: PLANET_VERTEX,
        fragmentShader: PLANET_FRAGMENT,
        uniforms: {
          uColor: { value: new Color(def.color) },
          uSunPos: { value: this.sunWorldPos },
          uAmbient: { value: LIGHT.planetAmbient },
          uSeed: { value: index * 7.31 + 2.4 },
          uBandFreq: { value: def.bands },
        },
      });
      const mesh = new Mesh(sphere, material);
      mesh.scale.setScalar(def.size);
      mesh.position.set(Math.cos(def.phase) * def.radius, 0, Math.sin(def.phase) * def.radius);
      plane.add(mesh);
      this.disposables.push(material);

      // Fresnel atmosphere: enlarged BackSide shell → soft halo at the limb.
      const atmosphere = new ShaderMaterial({
        vertexShader: ATMO_VERTEX,
        fragmentShader: ATMO_FRAGMENT,
        uniforms: {
          uColor: { value: new Color(def.color).lerp(new Color('#ffffff'), 0.35) },
          uIntensity: { value: LIGHT.atmoIntensity },
        },
        transparent: true,
        depthWrite: false,
        side: BackSide,
        blending: AdditiveBlending,
      });
      const shell = new Mesh(sphere, atmosphere);
      shell.scale.setScalar(1.35);
      mesh.add(shell);
      this.disposables.push(atmosphere);

      if (def.ring) {
        // Banded translucent ring in the planet's local space.
        const ringGeometry = new RingGeometry(1.55, 2.6, 64);
        this.ringMaterial = new ShaderMaterial({
          vertexShader: RING_VERTEX,
          fragmentShader: RING_FRAGMENT,
          uniforms: {
            uColor: { value: new Color('#d9d2ff') },
            uInner: { value: 1.55 },
            uOuter: { value: 2.6 },
            uOpacity: { value: LIGHT.ringOpacity },
          },
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
        });
        const ring = new Mesh(ringGeometry, this.ringMaterial);
        ring.rotation.x = -1.15;
        mesh.add(ring);
        this.disposables.push(ringGeometry, this.ringMaterial);
      }

      if (def.moon) {
        const pivot = new Object3D();
        const moonMaterial = new ShaderMaterial({
          vertexShader: PLANET_VERTEX,
          fragmentShader: PLANET_FRAGMENT,
          uniforms: {
            uColor: { value: new Color('#d8dcf5') },
            uSunPos: { value: this.sunWorldPos },
            uAmbient: { value: LIGHT.planetAmbient },
            uSeed: { value: 31.7 },
            uBandFreq: { value: 14.0 },
          },
        });
        const moon = new Mesh(sphere, moonMaterial);
        moon.scale.setScalar(0.3);
        moon.position.set(2.1, 0.5, 0);
        pivot.add(moon);
        mesh.add(pivot);
        this.moonPivot = pivot;
        this.disposables.push(moonMaterial);
      }

      this.planets.push({
        mesh,
        material,
        atmosphere,
        trail,
        radius: def.radius,
        speed: def.speed,
        phase: def.phase,
      });
    }
  }

  private readonly onVisibility = (): void => {
    this.syncLoop();
  };

  /** Start or stop the rAF loop based on visibility — never runs offscreen. */
  private syncLoop(): void {
    const shouldRun = this.running && this.inView && !document.hidden;
    if (shouldRun && !this.raf) {
      this.lastFrame = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!shouldRun && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  private readonly frame = (now: number): void => {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.time += dt;

    // Adaptive quality: if the rolling average drops under ~40fps, shave the
    // render resolution instead of letting the whole page stutter.
    this.frameAvg = this.frameAvg * 0.95 + (dt * 1000) * 0.05;
    if (this.frameAvg > 25 && this.dpr > 0.75) {
      this.dpr = Math.max(0.75, this.dpr - 0.25);
      this.frameAvg = 16.7;
      this.applySize();
    }

    this.sunMaterial.uniforms['uTime'].value = this.time;
    // Slow corona breathing.
    const sun = this.solar.getObjectByName('sun') as Mesh | undefined;
    sun?.scale.setScalar(1 + Math.sin(this.time * 1.1) * 0.05);

    // Advance every orbit; the shared uSunPos uniform keeps lighting honest.
    sun?.getWorldPosition(this.sunWorldPos);
    for (const planet of this.planets) {
      const a = planet.phase + this.time * planet.speed;
      planet.mesh.position.set(
        Math.cos(a) * planet.radius,
        0,
        Math.sin(a) * planet.radius,
      );
      // The trail fades behind the planet's current angle (kept small for
      // float precision in the shader's mod()).
      planet.trail.uniforms['uHead'].value = a % (Math.PI * 2);
    }
    if (this.moonPivot) {
      this.moonPivot.rotation.y = this.time * 1.6;
    }
    // The whole system breathes very slowly.
    this.solar.rotation.y = Math.sin(this.time * 0.05) * 0.08;

    // A slow idle drift so the scene never feels frozen.
    const targetX = Math.sin(this.time * 0.1) * 0.25;
    const targetY = 0.6 + Math.cos(this.time * 0.13) * 0.15;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, -2);

    this.renderer.render(this.scene, this.camera);
    this.raf = 0;
    this.syncLoop();
  };

  private renderOnce(): void {
    this.sunMaterial.uniforms['uTime'].value = 12;
    this.solar.getObjectByName('sun')?.getWorldPosition(this.sunWorldPos);
    for (const planet of this.planets) {
      planet.trail.uniforms['uHead'].value = planet.phase % (Math.PI * 2);
    }
    this.renderer.render(this.scene, this.camera);
  }

  private applySize(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    if (width === 0 || height === 0) return;
    this.renderer.setPixelRatio(this.dpr);
    // false: keep the canvas styled at 100%/100% so it can never overflow
    // or crop — the drawing buffer follows the host box exactly.
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Wide layouts: system sits behind the avatar column, nudged up-left so
    // the sun peeks out from behind the avatar instead of hiding behind it.
    // Stacked layouts: tucked toward the top-right, clear of the copy.
    if (width / height >= 1) {
      this.solar.position.set(3.35, 1.45, -7);
    } else {
      this.solar.position.set(2.0, 3.6, -10);
    }
  }
}
