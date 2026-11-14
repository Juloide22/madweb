import { Renderer, Program, Mesh, Geometry, Triangle, Texture, RenderTarget } from './ogl.module.js';

const MAX_WAVES = 100;
const QUALITY_SCALE = { low: 0.4, medium: 0.7, high: 1 };
const START_SCALE = 1.5;
const LIFE_CONSTANT = Math.log(500);

const waveVertex = `
precision highp float;

attribute vec2 position;
attribute vec2 uv;
attribute vec2 iOffset;
attribute vec2 iScale;
attribute float iOpacity;

varying vec2 vUv;
varying float vOpacity;

void main() {
  vUv = uv;
  vOpacity = iOpacity;
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);
}
`;

const waveFragment = `
precision highp float;

varying vec2 vUv;
varying float vOpacity;

uniform float uRings;

const float PI = 3.141592653589793;
const float EDGE = 0.006737947;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = dot(p, p);
  if (r > 1.0) discard;

  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);

  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);
}
`;

const screenVertex = `
precision highp float;
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const compositeFragment = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uTexel;
uniform vec3 uTint;
uniform vec3 uHighlight;
uniform float uStrength;
uniform float uSwirl;
uniform float uDispersion;
uniform float uGlint;
uniform float uTintAmount;
uniform float uGrayscale;

const float TAU = 6.283185307179586;

vec2 coverUV(vec2 uv) {
  vec2 safe = max(uTextureSize, vec2(1.0));
  vec2 s = uResolution / safe;
  vec2 scaledSize = safe * max(s.x, s.y);
  vec2 offset = (uResolution - scaledSize) * 0.5;
  return (uv * uResolution - offset) / scaledSize;
}

void main() {
  float amount = texture2D(uDisplacement, vUv).r;
  vec2 base = coverUV(vUv);

  float theta = amount * uSwirl * TAU;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 push = dir * amount * uStrength;

  vec3 color;
  if (uDispersion > 0.001) {
    float split = uDispersion * 0.25;
    color.r = texture2D(uTexture, base + push * (1.0 + split)).r;
    color.g = texture2D(uTexture, base + push).g;
    color.b = texture2D(uTexture, base + push * (1.0 - split)).b;
  } else {
    color = texture2D(uTexture, base + push).rgb;
  }

  if (uGrayscale > 0.001) {
    color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale);
  }

  if (uTintAmount > 0.001) {
    color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount);
  }

  if (uGlint > 0.001) {
    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;
    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;
    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0));
    vec3 light = normalize(vec3(-0.35, 0.55, 1.0));
    float raw = pow(max(dot(normal, light), 0.0), 22.0);
    float flatSpec = pow(max(light.z, 0.0), 22.0);
    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

const hexToRGB = hex => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export class VanillaRippleDistortion {
  constructor(mount, options = {}) {
    this.mount = mount;
    if (!this.mount) return;

    this.cfg = {
      src: options.src ?? 'images/galeria-bg-ripple.jpg',
      brushSize: options.brushSize ?? 80,
      strength: options.strength ?? 0.23,
      swirl: options.swirl ?? 2.35,
      rings: options.rings ?? 2.25,
      grayscale: options.grayscale ?? false,
      spread: options.spread ?? 7.25,
      fade: options.fade ?? 3.8,
      spacing: options.spacing ?? 20,
      dispersion: options.dispersion ?? 0.5,
      glint: options.glint ?? 0.05,
      tint: options.tint ?? '#0e024a',
      tintAmount: options.tintAmount ?? 0.56,
      highlightColor: options.highlightColor ?? '#200995',
      trigger: options.trigger ?? 'both',
      clickStrength: options.clickStrength ?? 2,
      quality: options.quality ?? 'medium',
      enabled: options.enabled ?? true
    };

    this.init();
  }

  init() {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.reduceMotion = reduceMotion;

    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.35)
    });
    this.renderer = renderer;
    const gl = renderer.gl;
    this.gl = gl;
    gl.clearColor(0, 0, 0, 1);

    const canvas = gl.canvas;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    this.mount.appendChild(canvas);
    this.canvas = canvas;

    const imageTexture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    });

    this.disposed = false;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      if (this.disposed) return;
      imageTexture.image = image;
      this.compositeUniforms.uTextureSize.value = [image.naturalWidth || 1, image.naturalHeight || 1];
      this.dirty = true;
      this.wake();
    };
    image.src = this.cfg.src;

    const offsets = new Float32Array(MAX_WAVES * 2);
    const scales = new Float32Array(MAX_WAVES * 2);
    const opacities = new Float32Array(MAX_WAVES);

    this.offsets = offsets;
    this.scales = scales;
    this.opacities = opacities;
    this.waves = Array.from({ length: MAX_WAVES }, () => ({
      x: 0,
      y: 0,
      scale: START_SCALE,
      target: START_SCALE,
      size: 1,
      opacity: 0
    }));
    this.current = 0;

    this.geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },
      uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]) },
      iOffset: { instanced: 1, size: 2, data: offsets },
      iScale: { instanced: 1, size: 2, data: scales },
      iOpacity: { instanced: 1, size: 1, data: opacities }
    });

    const waveProgram = new Program(gl, {
      vertex: waveVertex,
      fragment: waveFragment,
      uniforms: { uRings: { value: this.cfg.rings } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      cullFace: false
    });
    waveProgram.setBlendFunc(gl.ONE, gl.ONE);
    this.waveMesh = new Mesh(gl, { geometry: this.geometry, program: waveProgram, frustumCulled: false });

    this.displacementTarget = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    });

    this.compositeUniforms = {
      uTexture: { value: imageTexture },
      uDisplacement: { value: this.displacementTarget.texture },
      uResolution: { value: [1, 1] },
      uTextureSize: { value: [1, 1] },
      uTexel: { value: [1, 1] },
      uTint: { value: hexToRGB(this.cfg.tint) },
      uHighlight: { value: hexToRGB(this.cfg.highlightColor) },
      uStrength: { value: this.cfg.strength },
      uSwirl: { value: this.cfg.swirl },
      uDispersion: { value: this.cfg.dispersion },
      uGlint: { value: this.cfg.glint },
      uTintAmount: { value: this.cfg.tintAmount },
      uGrayscale: { value: this.cfg.grayscale ? 1 : 0 }
    };

    this.compositeMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: screenVertex,
        fragment: compositeFragment,
        uniforms: this.compositeUniforms,
        depthTest: false,
        depthWrite: false
      })
    });

    this.width = 1;
    this.height = 1;
    this.resizePending = false;
    this.raf = 0;
    this.previousTime = 0;
    this.dirty = true;

    this.ro = new ResizeObserver(() => {
      this.resizePending = true;
      this.wake();
    });
    this.ro.observe(this.mount);
    this.resize();

    let previousX = 0;
    let previousY = 0;

    const localPoint = (clientX, clientY) => {
      const rect = this.mount.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        return null;
      }
      return [clientX - rect.left, rect.height - (clientY - rect.top)];
    };

    this.onMove = event => {
      if (!this.cfg.enabled || this.reduceMotion || this.cfg.trigger === 'click') return;
      const point = localPoint(event.clientX, event.clientY);
      if (!point) return;
      const step = Math.max(1, this.cfg.spacing);
      if (Math.abs(point[0] - previousX) > step || Math.abs(point[1] - previousY) > step) {
        this.setNewWave(point[0], point[1], 1);
        previousX = point[0];
        previousY = point[1];
      }
    };

    this.onDown = event => {
      if (!this.cfg.enabled || this.reduceMotion || this.cfg.trigger === 'hover') return;
      const point = localPoint(event.clientX, event.clientY);
      if (!point) return;
      this.setNewWave(point[0], point[1], Math.max(1, this.cfg.clickStrength));
    };

    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerdown', this.onDown, { passive: true });

    this.wake();
  }

  resize() {
    this.width = Math.max(1, this.mount.clientWidth);
    this.height = Math.max(1, this.mount.clientHeight);
    this.renderer.setSize(this.width, this.height);
    this.compositeUniforms.uResolution.value = [this.width, this.height];

    const scale = QUALITY_SCALE[this.cfg.quality] || QUALITY_SCALE.medium;
    const fieldW = Math.max(2, Math.round(this.width * scale));
    const fieldH = Math.max(2, Math.round(this.height * scale));
    this.displacementTarget.setSize(fieldW, fieldH);
    this.compositeUniforms.uTexel.value = [1 / fieldW, 1 / fieldH];
    this.dirty = true;
  }

  setNewWave(x, y, power) {
    const wave = this.waves[this.current];
    this.current = (this.current + 1) % MAX_WAVES;
    wave.x = x;
    wave.y = y;
    wave.scale = START_SCALE * power;
    wave.target = START_SCALE * Math.max(1, this.cfg.spread) * power;
    wave.size = Math.max(1, this.cfg.brushSize);
    wave.opacity = 1;
    this.dirty = true;
    this.wake();
  }

  wake() {
    if (this.disposed || this.raf) return;
    this.previousTime = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  loop = now => {
    this.raf = 0;
    if (this.disposed) return;

    if (this.resizePending) {
      this.resizePending = false;
      this.resize();
    }

    const delta = this.previousTime ? Math.min(0.05, (now - this.previousTime) / 1000) : 0;
    this.previousTime = now;

    const growth = this.reduceMotion ? 0 : 1 - Math.exp(-delta * 1.09);
    const decay = this.reduceMotion ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, this.cfg.fade));

    let hasActiveWaves = false;

    for (let i = 0; i < MAX_WAVES; i += 1) {
      const wave = this.waves[i];
      if (wave.opacity <= 0) {
        this.opacities[i] = 0;
        continue;
      }

      wave.opacity *= decay;
      wave.scale += (wave.target - wave.scale) * growth;

      if (wave.opacity < 0.002) {
        wave.opacity = 0;
        this.opacities[i] = 0;
        this.dirty = true;
        continue;
      }

      hasActiveWaves = true;
      const half = (wave.scale * wave.size) / 2;
      this.offsets[i * 2] = (wave.x / this.width) * 2 - 1;
      this.offsets[i * 2 + 1] = (wave.y / this.height) * 2 - 1;
      this.scales[i * 2] = (half / this.width) * 2;
      this.scales[i * 2 + 1] = (half / this.height) * 2;
      this.opacities[i] = wave.opacity;
    }

    if (hasActiveWaves || this.dirty) {
      this.dirty = false;
      this.geometry.attributes.iOffset.needsUpdate = true;
      this.geometry.attributes.iScale.needsUpdate = true;
      this.geometry.attributes.iOpacity.needsUpdate = true;

      this.renderer.render({ scene: this.waveMesh, target: this.displacementTarget, clear: true });
      this.renderer.render({ scene: this.compositeMesh });
    }

    if (hasActiveWaves) {
      this.raf = requestAnimationFrame(this.loop);
    }
  };

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerdown', this.onDown);
    if (this.canvas && this.canvas.parentNode === this.mount) {
      this.mount.removeChild(this.canvas);
    }
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
