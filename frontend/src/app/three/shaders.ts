/**
 * Hand-written GLSL for the hero solar system. Everything is shader-lit (no
 * scene lights, no post-processing) so the scene stays GPU-cheap.
 *
 * Technique notes (researched refs):
 * - Sun surface: animated fBm value-noise, orange→white by n², center
 *   brightening + double fresnel rim (à la sangillee.com realistic-sun).
 * - Planet atmospheres: enlarged BackSide shell with a fresnel falloff
 *   (classic stemkoski glow / rim-lighting pattern).
 * - Orbit trails: line alpha decays exponentially with angular distance
 *   behind the planet — a comet-tail trail without a trail renderer.
 */

/** Cheap 3D value noise + 3-octave fBm shared by the sun and planets. */
const NOISE_GLSL = /* glsl */ `
  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    float n000 = hash3(i);
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));
    return mix(
      mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
      mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
      u.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.55;
    for (int i = 0; i < 3; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec3(1.7);
      a *= 0.5;
    }
    return v;
  }
`;

export const SUN_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vLocal = position;
    gl_Position = projectionMatrix * mv;
  }
`;

export const SUN_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uHot;
  uniform vec3 uMid;
  uniform vec3 uEdge;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;

  ${'{NOISE}'}

  void main() {
    // Churning surface: two fBm fields drifting against each other.
    vec3 sp = normalize(vLocal);
    float n = fbm(sp * 2.6 + vec3(uTime * 0.05, uTime * 0.035, 0.0));
    float m = fbm(sp * 5.5 - vec3(0.0, uTime * 0.06, uTime * 0.045));
    float t = clamp(n * 0.75 + m * 0.55, 0.0, 1.0);

    vec3 col = mix(uHot, uMid, t);
    // White-hot cells where the noise peaks.
    col = mix(col, vec3(1.0, 0.97, 0.9), t * t * 0.9);

    float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    // Center brightening: a luminous core reads as emitted light.
    col += vec3(1.0, 0.92, 0.78) * pow(facing, 3.0) * 0.5;
    // Warm fresnel limb so the edge burns instead of clipping flat.
    float rim = pow(1.0 - facing, 2.0);
    col += uEdge * rim * 0.9;

    gl_FragColor = vec4(col, 1.0);
  }
`.replace('{NOISE}', NOISE_GLSL);

export const PLANET_VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vToCamera;
  varying vec3 vLocal;

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vToCamera = cameraPosition - wp.xyz;
    vLocal = position;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const PLANET_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uSunPos;
  uniform float uAmbient;
  uniform float uSeed;
  uniform float uBandFreq;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  varying vec3 vToCamera;
  varying vec3 vLocal;

  ${'{NOISE}'}

  void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 sunDir = normalize(uSunPos - vWorldPos);
    // Soft terminator between day and night side.
    float diff = smoothstep(-0.25, 0.6, dot(n, sunDir));
    float light = uAmbient + (1.0 - uAmbient) * diff;

    // Procedural latitude bands warped by noise — gas-giant flavor.
    float nz = fbm(vLocal * 2.4 + uSeed);
    float band = sin(vLocal.y * uBandFreq + nz * 2.6 + uSeed) * 0.5 + 0.5;
    vec3 base = mix(uColor * 0.78, min(uColor * 1.28, vec3(1.0)), band);
    base *= 0.88 + 0.28 * nz;

    vec3 col = base * light;
    // Subtle rim so planets lift off the background.
    float rim = pow(1.0 - abs(dot(n, normalize(vToCamera))), 3.0);
    col += uColor * rim * 0.5;

    gl_FragColor = vec4(col, 1.0);
  }
`.replace('{NOISE}', NOISE_GLSL);

export const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const ATMO_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    // BackSide shell: fresnel peaks at the silhouette → soft halo.
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
    gl_FragColor = vec4(uColor, f * uIntensity);
  }
`;

export const TRAIL_VERTEX = /* glsl */ `
  attribute float aAngle;
  varying float vAngle;

  void main() {
    vAngle = aAngle;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const TRAIL_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uHead;
  uniform float uBase;
  uniform float uTrail;
  varying float vAngle;

  void main() {
    // Comet-tail orbit: bright right behind the planet, exponential fade,
    // with a faint full ellipse (uBase) so the path stays legible.
    float d = mod(uHead - vAngle, 6.28318);
    float a = uBase + uTrail * exp(-d * 1.7);
    gl_FragColor = vec4(uColor, a);
  }
`;

export const RING_VERTEX = /* glsl */ `
  varying vec2 vPos;

  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const RING_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  uniform float uOpacity;
  varying vec2 vPos;

  void main() {
    float r = length(vPos);
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    // Feathered edges + concentric density bands, like a real ring system.
    float edge = smoothstep(0.0, 0.18, t) * smoothstep(1.0, 0.72, t);
    float bands = 0.68 + 0.32 * sin(t * 26.0 + 1.5);
    gl_FragColor = vec4(uColor, edge * bands * uOpacity);
  }
`;
