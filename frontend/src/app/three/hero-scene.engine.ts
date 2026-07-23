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
  Points,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  ATMO_FRAGMENT,
  ATMO_VERTEX,
  PARTICLE_FRAGMENT,
  PARTICLE_VERTEX,
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
  particles: [Color, Color, Color];
  fog: Color;
  particleOpacity: number;
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
  particles: [new Color('#7e6bd9'), new Color('#6f7ec0'), new Color('#57aacb')],
  fog: new Color('#f7f5ff'),
  particleOpacity: 0.3,
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
  particles: [new Color('#b8b5ff'), new Color('#a6b1e1'), new Color('#a8d8ea')],
  fog: new Color('#181630'),
  particleOpacity: 0.55,
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
 * orbits (one ringed, one with a moon), comet-tail orbit trails — floating
 * in a swirling particle starfield over faint nebulae. Loaded via dynamic
 * import so three.js ships as its own lazy chunk, off the critical path.
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
  private readonly particleMaterial: ShaderMaterial;
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

  /** Hover callback: label + client coords, or null when nothing is hovered. */
  onPlanetHover?: (label: string | null, x: number, y: number) => void;
  /** Fired when the user clicks while a planet is hovered. */
  onPlanetSelect?: (label: string) => void;

  private readonly raycaster = new Raycaster();
  private readonly ndc = new Vector2();
  private hoveredLabel: string | null = null;
  private pointerClientX = -1;
  private pointerClientY = -1;

  private raf = 0;
  private time = 0;
  private lastFrame = 0;
  private running = false;
  private inView = true;
  private pointerX = 0;
  private pointerY = 0;
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
    this.particleMaterial = this.buildParticles();
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
      window.addEventListener('pointermove', this.onPointer, { passive: true });
      window.addEventListener('click', this.onClick);
      this.running = true;
      this.syncLoop();
    }
  }

  /** Re-tint every material for light/dark without rebuilding the scene. */
  setTheme(dark: boolean): void {
    const p = dark ? DARK : LIGHT;
    this.particleMaterial.uniforms['uOpacity'].value = p.particleOpacity;

    const geometry = (this.scene.getObjectByName('galaxy') as Points).geometry;
    const colorAttr = geometry.getAttribute('aColor') as BufferAttribute;
    const seeds = geometry.getAttribute('aPhase') as BufferAttribute;
    for (let i = 0; i < colorAttr.count; i++) {
      const c = p.particles[Math.floor(seeds.getX(i) * 997) % 3];
      colorAttr.setXYZ(i, c.r, c.g, c.b);
    }
    colorAttr.needsUpdate = true;

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
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('click', this.onClick);
    document.removeEventListener('visibilitychange', this.onVisibility);
    document.body.style.cursor = '';
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

  private buildParticles(): ShaderMaterial {
    const count = 650;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 0.6) * 12 + 0.6;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (0.7 + radius * 0.16);
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      // Mostly small crisp stars; the occasional bigger soft glow for depth.
      scales[i] = Math.random() < 0.88 ? 2.5 + Math.random() * 6 : 10 + Math.random() * 8;
      phases[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new BufferAttribute(phases, 1));
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3));

    const material = new ShaderMaterial({
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 20 },
        uOpacity: { value: LIGHT.particleOpacity },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const points = new Points(geometry, material);
    points.name = 'galaxy';
    points.rotation.x = 0.42;
    points.position.set(0, -1.6, -7);
    this.scene.add(points);
    this.disposables.push(geometry, material);
    return material;
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
      mesh.userData['label'] = def.label;
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

  private readonly onPointer = (e: PointerEvent): void => {
    this.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    this.pointerClientX = e.clientX;
    this.pointerClientY = e.clientY;
  };

  private readonly onClick = (e: MouseEvent): void => {
    // Navigate only when a planet is hovered and the click didn't land on a
    // real control (links, buttons, form fields keep their own behavior).
    if (!this.hoveredLabel || !this.onPlanetSelect) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, textarea, select, [role="button"]')) return;
    this.onPlanetSelect(this.hoveredLabel);
  };

  /** Raycast against planet bodies (their atmosphere shells pad the hit area). */
  private pickPlanet(): void {
    if (!this.onPlanetHover) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const inside =
      this.pointerClientX >= rect.left &&
      this.pointerClientX <= rect.right &&
      this.pointerClientY >= rect.top &&
      this.pointerClientY <= rect.bottom;

    let label: string | null = null;
    if (inside && rect.width > 0 && rect.height > 0) {
      this.ndc.set(
        ((this.pointerClientX - rect.left) / rect.width) * 2 - 1,
        -((this.pointerClientY - rect.top) / rect.height) * 2 + 1,
      );
      this.raycaster.setFromCamera(this.ndc, this.camera);
      const meshes = this.planets.map((p) => p.mesh);
      const hit = this.raycaster.intersectObjects(meshes, true)[0];
      let node: Object3D | null = hit?.object ?? null;
      while (node && !node.userData['label']) node = node.parent;
      label = (node?.userData['label'] as string | undefined) ?? null;
    }

    if (label !== this.hoveredLabel) {
      this.hoveredLabel = label;
      document.body.style.cursor = label ? 'pointer' : '';
    }
    // Emit every frame; the component dedups nulls and tracks the pointer
    // while a planet stays hovered.
    this.onPlanetHover(label, this.pointerClientX, this.pointerClientY);
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

    this.particleMaterial.uniforms['uTime'].value = this.time;
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

    this.pickPlanet();

    // Mouse parallax + a slow idle drift so the scene never feels frozen.
    const targetX = this.pointerX * 0.7 + Math.sin(this.time * 0.1) * 0.25;
    const targetY = 0.6 - this.pointerY * 0.45 + Math.cos(this.time * 0.13) * 0.15;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, -2);

    this.renderer.render(this.scene, this.camera);
    this.raf = 0;
    this.syncLoop();
  };

  private renderOnce(): void {
    this.particleMaterial.uniforms['uTime'].value = 12;
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
