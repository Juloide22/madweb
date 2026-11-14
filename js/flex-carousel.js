import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from './ogl.module.js';

const BEND_PRESETS = {
  liquid: {
    lensWidth: 0.74,
    lensHeight: 1.18,
    tilt: 62,
    roundness: 1,
    bend: 0.34,
    reach: 0.38,
    curl: 'twist',
    dispersion: 0.45,
    liquid: 0,
    followCursor: false
  },
  ribbon: {
    lensWidth: 0.8,
    lensHeight: 0.8,
    tilt: 0,
    roundness: 1,
    bend: 0.34,
    reach: 0.34,
    curl: 'twist',
    dispersion: 0.4,
    liquid: 0,
    followCursor: false
  },
  vortex: {
    lensWidth: 0.7,
    lensHeight: 0.95,
    tilt: 30,
    roundness: 1,
    bend: 0.46,
    reach: 0.3,
    curl: 'twist',
    dispersion: 0.5,
    liquid: 0,
    followCursor: false
  },
  arch: {
    lensWidth: 0.8,
    lensHeight: 0.8,
    tilt: 0,
    roundness: 1,
    bend: 0.3,
    reach: 0.36,
    curl: 'rise',
    dispersion: 0.4,
    liquid: 0,
    followCursor: false
  }
};

const FIT_ASPECT = { portrait: 0.75, square: 1, landscape: 4 / 3 };
const TAPS = 6;
const PIXEL_BUDGET = 2.0e6;
const INTRO_DURATION = { rise: 2.1, bloom: 1.6, spin: 2.2, deal: 1.5, fade: 0.35 };

const wrap = (value, size) => ((((value + size / 2) % size) + size) % size) - size / 2;
const clamp01 = value => Math.min(Math.max(value, 0), 1);
const easeOut = value => 1 - Math.pow(1 - clamp01(value), 3);
const easeOutQuint = value => 1 - Math.pow(1 - clamp01(value), 5);
const easeInOut = value => {
  const t = clamp01(value);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const cardVertex = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}
`;

const cardFragment = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += uShift * (1.0 - scale.x) * 0.5;
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}
`;

const lensVertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const lensFragment = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);

  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;

  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));

  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < ${TAPS}; i++) {
      float s = (float(i) + 0.5) / float(${TAPS});
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }

  fragColor = color * uSceneAlpha;
}
`;

export class VanillaFlexCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    const base = BEND_PRESETS[options.preset || 'arch'] || BEND_PRESETS.arch;
    const pick = (val, key) => (val === undefined || val === null ? base[key] : val);

    this.settings = {
      preset: options.preset ?? 'arch',
      intro: options.intro ?? 'deal',
      cardHeight: options.cardHeight ?? 0.61,
      gap: options.gap ?? 17,
      radius: options.radius ?? 0,
      fit: options.fit ?? 'natural',
      lensWidth: pick(options.lensWidth, 'lensWidth'),
      lensHeight: pick(options.lensHeight, 'lensHeight'),
      tilt: pick(options.tilt, 'tilt'),
      roundness: pick(options.roundness, 'roundness'),
      bend: pick(options.bend, 'bend'),
      reach: pick(options.reach, 'reach'),
      curl: pick(options.curl, 'curl'),
      dispersion: pick(options.dispersion, 'dispersion'),
      liquid: pick(options.liquid, 'liquid'),
      followCursor: pick(options.followCursor, 'followCursor'),
      squeeze: options.squeeze ?? 0.19,
      focusOnClick: options.focusOnClick ?? false,
      autoplay: options.autoplay ?? false,
      interval: options.interval ?? 4,
      captions: options.captions ?? true,
      captureWheel: options.captureWheel ?? true
    };

    this.items = options.items || [];
    this.onChange = options.onChange;
    this.onSelect = options.onSelect;

    this.initDOM();
    this.initGL();
  }

  initDOM() {
    this.container.classList.add('flex-carousel');
    this.container.style.setProperty('--flex-carousel-half', `${Math.min(Math.max(this.settings.cardHeight, 0.05), 1) * 50}%`);
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-roledescription', 'carousel');
    this.container.setAttribute('tabindex', '0');

    // Canvas WebGL
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'flex-carousel__canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.canvas);

    // Caption Container
    if (this.settings.captions) {
      this.captionEl = document.createElement('div');
      this.captionEl.className = 'flex-carousel__caption';
      this.captionEl.setAttribute('aria-hidden', 'true');

      this.titleEl = document.createElement('span');
      this.titleEl.className = 'flex-carousel__title';
      this.captionEl.appendChild(this.titleEl);

      this.countEl = document.createElement('span');
      this.countEl.className = 'flex-carousel__count';
      
      this.digitsEl = document.createElement('span');
      this.digitsEl.className = 'flex-carousel__digits';
      
      // Build initial 2 digit reels
      for (let i = 0; i < 2; i++) {
        const digitWrap = document.createElement('span');
        digitWrap.className = 'flex-carousel__digit';
        const reel = document.createElement('span');
        reel.className = 'flex-carousel__reel';
        for (let n = 0; n <= 9; n++) {
          const numSpan = document.createElement('span');
          numSpan.textContent = n;
          reel.appendChild(numSpan);
        }
        digitWrap.appendChild(reel);
        this.digitsEl.appendChild(digitWrap);
      }

      this.countEl.appendChild(this.digitsEl);

      const slash = document.createElement('span');
      slash.className = 'flex-carousel__slash';
      slash.textContent = '/';
      this.countEl.appendChild(slash);

      this.totalEl = document.createElement('span');
      this.totalEl.textContent = String(this.items.length).padStart(2, '0');
      this.countEl.appendChild(this.totalEl);

      this.captionEl.appendChild(this.countEl);
      this.container.appendChild(this.captionEl);
    }
  }

  updateCaption(index) {
    if (!this.settings.captions || !this.captionEl || !this.items.length) return;
    const current = this.items[index] || this.items[0];
    if (!current) return;

    this.titleEl.innerHTML = '';
    const mainTitle = document.createElement('span');
    mainTitle.textContent = current.title || current.alt || '';
    this.titleEl.appendChild(mainTitle);

    if (current.subtitle) {
      const sub = document.createElement('span');
      sub.className = 'flex-carousel__subtitle';
      sub.textContent = current.subtitle;
      this.titleEl.appendChild(sub);
    }

    const digitsStr = String(index + 1).padStart(2, '0');
    const reels = this.digitsEl.querySelectorAll('.flex-carousel__reel');
    digitsStr.split('').forEach((d, idx) => {
      if (reels[idx]) {
        reels[idx].style.transform = `translateY(${-Number(d) * 10}%)`;
      }
    });

    this.totalEl.textContent = String(this.items.length).padStart(2, '0');
  }

  initGL() {
    const glCanvas = this.canvas;
    const renderer = new Renderer({
      canvas: glCanvas,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false
    });
    this.renderer = renderer;
    const gl = renderer.gl;
    if (!renderer.isWebgl2) {
      console.warn('WebGL2 not supported');
      return;
    }
    this.gl = gl;
    gl.clearColor(0, 0, 0, 0);

    const cardProgram = new Program(gl, {
      vertex: cardVertex,
      fragment: cardFragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tMap: { value: new Texture(gl) },
        uRect: { value: [0, 0, 1, 1] },
        uResolution: { value: [1, 1] },
        uSize: { value: [1, 1] },
        uImage: { value: [1, 1] },
        uRadius: { value: 16 },
        uAlpha: { value: 1 },
        uReady: { value: 0 },
        uShift: { value: 0 },
        uDpr: { value: 1 },
        uPlaceholder: { value: [0.5, 0.5, 0.5] }
      }
    });
    cardProgram.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.cardProgram = cardProgram;
    this.cardMesh = new Mesh(gl, { geometry: new Plane(gl), program: cardProgram });

    this.target = new RenderTarget(gl, {
      width: 2,
      height: 2,
      depth: false,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR
    });

    this.lensUniforms = {
      tScene: { value: this.target.texture },
      uResolution: { value: [1, 1] },
      uDpr: { value: 1 },
      uCenter: { value: [0, 0] },
      uHalf: { value: [1, 1] },
      uAngle: { value: 0 },
      uExponent: { value: 2 },
      uInner: { value: 60 },
      uOuter: { value: 80 },
      uFlow: { value: 0 },
      uCurl: { value: 0 },
      uDispersion: { value: 0 },
      uStrength: { value: 0 },
      uSceneAlpha: { value: 0 }
    };

    this.lensMesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: lensVertex,
        fragment: lensFragment,
        uniforms: this.lensUniforms,
        depthTest: false,
        depthWrite: false
      })
    });

    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.anisotropy = renderer.getExtension('EXT_texture_filter_anisotropic') ? 4 : 0;
    this.maxDpr = 1.5;
    this.slowFrames = 0;
    this.loadGeneration = 0;
    this.uploadQueue = [];

    this.slots = [];
    this.width = 1;
    this.height = 1;
    this.pos = 0;
    this.vel = 0;
    this.goal = 0;
    this.mode = 'spring';
    this.wheelAt = 0;
    this.raf = 0;
    this.last = performance.now();
    this.visible = true;
    this.alive = true;
    this.dirty = true;
    this.activeIndex = -1;
    this.interactedAt = -Infinity;
    this.autoplayAt = performance.now();
    this.hasFocus = false;
    this.deform = 0;
    this.deformVel = 0;
    this.layout = null;
    this.resnap = false;
    this.hover = '';
    this.lift = 1;
    this.energy = 0;
    this.lastPos = 0;
    this.lens = { x: 0, y: 0, vx: 0, vy: 0, ready: false };
    this.pointer = {
      x: 0,
      y: 0,
      over: false,
      down: false,
      id: -1,
      startX: 0,
      startY: 0,
      startPos: 0,
      dragging: false,
      touch: false,
      samples: []
    };
    this.introState = { kind: 'none', t: 0, running: false, done: false, readyAt: 0 };
    this.focus = { index: -1, pending: -1, t: 0, v: 0, target: 0 };
    this.instances = [];

    this.initListeners();
    this.resize();
    this.setItems(this.items);
  }

  loadSlot(item, index) {
    const gl = this.gl;
    const texture = new Texture(gl, {
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
      anisotropy: this.anisotropy
    });
    const slot = {
      item,
      index,
      texture,
      aspect: 0.8,
      loaded: false,
      failed: false,
      ready: 0,
      color: [0.5, 0.5, 0.5],
      image: [1, 1],
      startLoad: () => {},
      dispose: () => {}
    };
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    let disposed = false;
    let started = false;

    slot.startLoad = (onDone) => {
      if (disposed || started) {
        onDone?.();
        return;
      }
      started = true;
      image.onload = () => {
        if (disposed || !this.alive || !this.slots.includes(slot)) {
          onDone?.();
          return;
        }
        this.uploadQueue.push({ slot, image });
        this.dirty = true;
        this.start();
        onDone?.();
      };
      image.onerror = () => {
        if (!disposed && this.alive) {
          slot.failed = true;
          this.dirty = true;
          this.start();
        }
        onDone?.();
      };
      image.src = item.src;
    };

    slot.dispose = () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      gl.deleteTexture(texture.texture);
    };
    return slot;
  }

  flushOneUpload() {
    while (this.uploadQueue.length) {
      const { slot, image } = this.uploadQueue.shift();
      if (!this.alive || !this.slots.includes(slot)) continue;
      slot.texture.image = image;
      slot.texture.update();
      slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
      slot.aspect = slot.image[0] / slot.image[1];
      try {
        const probe = document.createElement('canvas');
        probe.width = 8;
        probe.height = 8;
        const ctx = probe.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(image, 0, 0, 8, 8);
          const data = ctx.getImageData(0, 0, 8, 8).data;
          const avg = [0, 0, 0];
          for (let i = 0; i < data.length; i += 4) {
            avg[0] += data[i];
            avg[1] += data[i + 1];
            avg[2] += data[i + 2];
          }
          slot.color = avg.map(v => v / 64 / 255);
        }
      } catch {
        slot.color = [0.5, 0.5, 0.5];
      }
      slot.loaded = true;
      this.dirty = true;
      break;
    }
  }

  setItems(next) {
    this.loadGeneration += 1;
    const gen = this.loadGeneration;
    this.uploadQueue = [];
    this.slots.forEach(slot => slot.dispose());
    this.items = next;
    this.slots = next.map((it, idx) => this.loadSlot(it, idx));

    // Prioritize center/adjacent slots outward so visible cards load first without saturating main thread
    const n = this.slots.length;
    const order = [];
    if (n > 0) {
      order.push(0);
      for (let d = 1; d <= Math.floor(n / 2); d++) {
        if (d < n) order.push(d);
        const opp = n - d;
        if (opp !== d && opp > 0 && opp < n) order.push(opp);
      }
    }
    let cursor = 0;
    let active = 0;
    const MAX_CONCURRENT = 4;
    const pump = () => {
      if (!this.alive || this.loadGeneration !== gen) return;
      while (active < MAX_CONCURRENT && cursor < order.length) {
        const slot = this.slots[order[cursor++]];
        if (!slot) continue;
        active += 1;
        slot.startLoad(() => {
          active -= 1;
          pump();
        });
      }
    };
    pump();

    this.activeIndex = -1;
    this.layout = null;
    this.resnap = true;
    this.focus.target = 0;
    this.focus.t = 0;
    this.focus.v = 0;
    this.focus.pending = -1;
    this.introState.readyAt = performance.now();
    this.dirty = true;
    this.start();
  }

  metrics(s) {
    const cardH = Math.max(24, s.cardHeight * this.height);
    const fixed = FIT_ASPECT[s.fit];
    const widths = this.slots.map(slot => (fixed || slot.aspect) * cardH);
    const centers = [];
    let cursor = 0;
    for (let i = 0; i < widths.length; i++) {
      centers.push(cursor + widths[i] / 2);
      cursor += widths[i] + s.gap;
    }
    return { cardH, widths, centers, gap: s.gap, loop: Math.max(cursor, 1) };
  }

  nearest(m, at) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < m.centers.length; i++) {
      const dist = Math.abs(wrap(m.centers[i] - at, m.loop));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  }

  snapPoint(m, at) {
    const i = this.nearest(m, at);
    return at + wrap(m.centers[i] - at, m.loop);
  }

  remap(from, to, at) {
    const i = this.nearest(from, at);
    const offset = wrap(at - from.centers[i], from.loop);
    const cycles = Math.round((at - offset - from.centers[i]) / from.loop);
    return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
  }

  step(m, delta) {
    let at = this.snapPoint(m, this.goal);
    let index = this.nearest(m, at);
    const n = m.centers.length;
    for (let k = 0; k < Math.abs(delta); k++) {
      const next = (index + (delta > 0 ? 1 : n - 1)) % n;
      const distance =
        delta > 0
          ? m.widths[index] / 2 + m.gap + m.widths[next] / 2
          : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
      at += distance;
      index = next;
    }
    this.goal = at;
    this.mode = 'spring';
    this.dirty = true;
    this.start();
  }

  prev() {
    if (!this.slots.length) return;
    this.skipIntro();
    this.interactedAt = performance.now();
    this.step(this.metrics(this.settings), -1);
  }

  next() {
    if (!this.slots.length) return;
    this.skipIntro();
    this.interactedAt = performance.now();
    this.step(this.metrics(this.settings), 1);
  }

  goTo(m, index) {
    const i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
    this.goal = this.goal + wrap(m.centers[i] - this.goal, m.loop);
    this.mode = 'spring';
    this.dirty = true;
    this.start();
  }

  openFocus(index) {
    this.focus.index = index;
    this.focus.pending = -1;
    this.focus.target = 1;
    this.dirty = true;
    this.start();
  }

  closeFocus() {
    this.focus.pending = -1;
    if (this.focus.target === 0) return false;
    this.focus.target = 0;
    this.dirty = true;
    this.start();
    return true;
  }

  skipIntro() {
    if (this.introState.running) this.introState.t = 1;
  }

  introEffects() {
    const t = this.introState.running ? this.introState.t : this.introState.done ? 1 : 0;
    const e = { sceneAlpha: 1, strength: 1, card: null };
    if (!this.introState.done && !this.introState.running) {
      e.sceneAlpha = 0;
      e.strength = 0;
      return e;
    }
    if (t >= 1) return e;
    const kind = this.introState.kind;
    const width = this.width;
    const height = this.height;
    if (kind === 'rise') {
      e.strength = easeInOut((t - 0.3) / 0.65);
      e.card = rel => {
        const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34;
        const local = clamp01((t - delay) / 0.6);
        return {
          alpha: clamp01(local * 4),
          x: 0,
          y: (1 - easeOutQuint(local)) * height * 0.62,
          scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82)
        };
      };
    } else if (kind === 'bloom') {
      e.strength = easeInOut((t - 0.2) / 0.8);
      e.card = rel => {
        const delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.25;
        const local = easeOut((t - delay) / 0.55);
        return { alpha: local, x: 0, y: 0, scale: 0.92 + 0.08 * local };
      };
    } else if (kind === 'spin') {
      e.sceneAlpha = easeOut(t / 0.25);
      e.strength = easeOut((t - 0.55) / 0.45);
    } else if (kind === 'deal') {
      e.strength = easeOut((t - 0.45) / 0.5);
      e.card = rel => {
        const spread = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.3;
        const local = easeOut((t - 0.12 - spread) / 0.5);
        return { alpha: easeOut((t - spread) / 0.12), x: -rel * (1 - local), y: 0, scale: 1 };
      };
    } else {
      e.sceneAlpha = easeOut(t);
      e.strength = easeOut(t);
    }
    return e;
  }

  beginIntro(s, m) {
    const kind = this.reducedMotion && s.intro !== 'none' ? 'fade' : s.intro;
    this.introState.kind = INTRO_DURATION[kind] ? kind : 'none';
    this.introState.running = this.introState.kind !== 'none';
    this.introState.done = !this.introState.running;
    this.introState.t = 0;
    if (this.introState.kind === 'spin') {
      const distance = m.loop * 1.6 + this.width;
      this.pos = this.goal + distance;
      this.vel = -distance * 3;
      this.mode = 'spring';
    }
  }

  resize() {
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    this.renderer.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr || 1.5, Math.sqrt(PIXEL_BUDGET / (this.width * this.height)));
    this.renderer.setSize(this.width, this.height);
    this.target.setSize(Math.max(2, Math.round(this.width * this.renderer.dpr)), Math.max(2, Math.round(this.height * this.renderer.dpr)));
    this.lensUniforms.tScene.value = this.target.texture;
    this.dirty = true;
    this.start();
  }

  frame = now => {
    this.raf = 0;
    if (!this.alive) return;
    const s = this.settings;
    const rawMs = now - this.last;
    const dt = Math.min(0.05, Math.max(0.001, rawMs / 1000));
    this.last = now;
    if (this.maxDpr > 1 && rawMs > 28 && rawMs < 200) {
      this.slowFrames += 1;
      if (this.slowFrames >= 5) {
        this.maxDpr = 1;
        this.slowFrames = 0;
        this.resize();
      }
    } else if (rawMs <= 24) {
      this.slowFrames = 0;
    }
    if (!s || !this.slots.length) {
      if (this.visible) this.raf = requestAnimationFrame(this.frame);
      return;
    }

    let animating = false;
    if (this.uploadQueue.length) {
      this.flushOneUpload();
      if (this.uploadQueue.length) animating = true;
    }

    const m = this.metrics(s);
    const n = this.slots.length;

    if (this.resnap) {
      this.goal = this.snapPoint(m, this.goal);
      this.pos = this.goal;
      this.vel = 0;
      this.resnap = false;
    } else if (this.layout && this.layout.loop !== m.loop) {
      this.pos = this.remap(this.layout, m, this.pos);
      this.goal = this.remap(this.layout, m, this.goal);
      this.pointer.startPos = this.pos + (this.pointer.x - this.pointer.startX);
      animating = true;
    }
    this.layout = m;

    if (!this.introState.running && !this.introState.done) {
      const firstReady = this.slots.slice(0, 3).every(slot => slot.loaded || slot.failed);
      const allSettled = this.slots.every(slot => slot.loaded || slot.failed);
      if (allSettled || firstReady || now - this.introState.readyAt > 600) {
        this.goal = this.snapPoint(m, this.goal);
        this.pos = this.goal;
        this.beginIntro(s, m);
      }
    }
    if (this.introState.running) {
      this.introState.t = Math.min(1, this.introState.t + dt / (INTRO_DURATION[this.introState.kind] || 1));
      if (this.introState.t >= 1) {
        this.introState.running = false;
        this.introState.done = true;
      }
      animating = true;
    }

    if (this.mode === 'wheel' && now - this.wheelAt > 150) {
      this.goal = this.snapPoint(m, this.goal);
      this.mode = 'spring';
    }
    if (!this.pointer.dragging) {
      const spinning = this.introState.running && this.introState.kind === 'spin';
      const stiffness = spinning ? 9 : this.mode === 'wheel' ? 80 : 55;
      const damping = 2 * Math.sqrt(stiffness);
      const steps = Math.ceil(dt / (1 / 240));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const acc = stiffness * (this.goal - this.pos) - damping * this.vel;
        this.vel += acc * h;
        this.pos += this.vel * h;
      }
      if (Math.abs(this.goal - this.pos) < 0.05 && Math.abs(this.vel) < 0.5) {
        this.pos = this.goal;
        this.vel = 0;
      } else {
        animating = true;
      }
    } else {
      animating = true;
    }

    if (Math.abs(this.pos) > m.loop * 8) {
      const shift = Math.round(this.pos / m.loop) * m.loop;
      this.pos -= shift;
      this.goal -= shift;
      this.pointer.startPos -= shift;
    }

    const current = this.nearest(m, this.pos);
    if (current !== this.activeIndex) {
      this.activeIndex = current;
      this.updateCaption(current);
      if (this.onChange) this.onChange(current, this.items[current]);
    }

    if (this.focus.pending >= 0 && this.mode === 'spring' && Math.abs(this.goal - this.pos) < 1.5 && Math.abs(this.vel) < 30) {
      if (current === this.focus.pending) this.openFocus(current);
      else this.focus.pending = -1;
    }

    if (
      s.autoplay &&
      !this.reducedMotion &&
      this.introState.done &&
      this.focus.target === 0 &&
      this.focus.t < 0.01 &&
      !this.pointer.over &&
      !this.pointer.down &&
      !this.hasFocus &&
      this.mode === 'spring' &&
      Math.abs(this.goal - this.pos) < 1 &&
      now - this.interactedAt > 3000 &&
      now - this.autoplayAt > s.interval * 1000
    ) {
      this.autoplayAt = now;
      this.step(m, 1);
    }
    if (s.autoplay && !this.reducedMotion) animating = true;

    const travel = Math.abs(this.pos - this.lastPos) / dt;
    this.lastPos = this.pos;
    const energyTarget = this.reducedMotion ? 0 : Math.min(travel / 2600, 1);
    this.energy += (energyTarget - this.energy) * (1 - Math.exp(-dt / (energyTarget > this.energy ? 0.07 : 0.35)));
    if (this.energy > 0.001) animating = true;
    const liquidAmount = this.reducedMotion ? 0 : s.liquid;
    const push = Math.max(-1, Math.min(1, this.vel / 2200));
    const deformStiffness = 120;
    const deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
    this.deformVel += (deformStiffness * (push - this.deform) - deformDamping * this.deformVel) * dt;
    this.deform += this.deformVel * dt;
    if (Math.abs(this.deform) > 0.0005 || Math.abs(this.deformVel) > 0.005) animating = true;

    const focusStiffness = 64;
    this.focus.v += (focusStiffness * (this.focus.target - this.focus.t) - 2 * Math.sqrt(focusStiffness) * this.focus.v) * dt;
    this.focus.t += this.focus.v * dt;
    if (Math.abs(this.focus.target - this.focus.t) < 0.0005 && Math.abs(this.focus.v) < 0.001) {
      this.focus.t = this.focus.target;
      this.focus.v = 0;
    } else {
      animating = true;
    }
    const focusAmount = clamp01(this.focus.t);
    const focusEase = easeInOut(focusAmount);
    const focusW = this.focus.index >= 0 && this.focus.index < n ? m.widths[this.focus.index] : m.cardH;
    const focusScale = Math.max(1, Math.min(1.3, (this.height * 0.84) / m.cardH, (this.width * 0.92) / focusW));
    const nextLift = 1 + (focusScale - 1) * focusEase;
    if (Math.abs(nextLift - this.lift) > 0.0005) {
      this.lift = nextLift;
      this.container.style.setProperty('--flex-carousel-lift', this.lift.toFixed(4));
    }

    const effects = this.introEffects();

    const homeX = this.width / 2;
    const homeY = this.height / 2;
    const follow = s.followCursor && this.pointer.over && !this.pointer.dragging && !this.pointer.touch && this.focus.target === 0;
    const aimX = follow ? this.pointer.x : homeX;
    const aimY = follow ? this.pointer.y : homeY;
    if (!this.lens.ready) {
      this.lens.x = homeX;
      this.lens.y = homeY;
      this.lens.ready = true;
    }
    const lensK = 110;
    const lensC = 2 * Math.sqrt(lensK) * 0.8;
    this.lens.vx += (lensK * (aimX - this.lens.x) - lensC * this.lens.vx) * dt;
    this.lens.vy += (lensK * (aimY - this.lens.y) - lensC * this.lens.vy) * dt;
    this.lens.x += this.lens.vx * dt;
    this.lens.y += this.lens.vy * dt;
    if (Math.abs(aimX - this.lens.x) + Math.abs(aimY - this.lens.y) > 0.2 || Math.abs(this.lens.vx) + Math.abs(this.lens.vy) > 0.5)
      animating = true;

    const cardH = m.cardH;
    let halfW = (s.lensWidth * this.width) / 2;
    let halfH = (s.lensHeight * this.width) / 2;
    const squash = Math.abs(this.deform) * liquidAmount;
    halfW *= 1 + squash * 0.16;
    halfH *= 1 - squash * 0.08;
    const lensX = this.lens.x - this.deform * 14 * liquidAmount;

    for (let i = 0; i < n; i++) {
      const slot = this.slots[i];
      if (slot.loaded && slot.ready < 1) {
        slot.ready = Math.min(1, slot.ready + dt / 0.45);
        animating = true;
      }
    }

    const waiting = !this.introState.done;
    if (this.dirty || animating || this.pointer.dragging) {
      this.dirty = false;
      this.instances = [];
      const dpr = this.renderer.dpr;
      this.cardProgram.uniforms.uResolution.value = [this.width, this.height];
      this.cardProgram.uniforms.uDpr.value = dpr;
      this.cardProgram.uniforms.uRadius.value = s.radius;
      const shrink = 1 - clamp01(s.squeeze) * this.energy;
      const draws = [];
      for (let i = 0; i < n; i++) {
        const w = m.widths[i];
        const baseRel = wrap(m.centers[i] - this.pos, m.loop);
        for (let k = -3; k <= 3; k++) {
          const rel = baseRel + k * m.loop;
          if (Math.abs(rel) - w / 2 > this.width + 40) continue;
          const fx = effects.card ? effects.card(rel) : null;
          let x = homeX + rel + (fx ? fx.x : 0);
          let scale = shrink * (fx ? fx.scale : 1);
          let alpha = fx ? fx.alpha : 1;
          if (focusAmount > 0) {
            if (i === this.focus.index && Math.abs(rel) < w) {
              scale *= 1 + (focusScale - 1) * focusEase;
            } else {
              const order = Math.min(Math.abs(rel) / this.width, 1) * 0.25;
              const part = easeInOut(focusAmount * 1.25 - order);
              x += Math.sign(rel) * part * this.width * 0.7;
              alpha *= 1 - part;
            }
          }
          const cw = w * scale;
          if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > this.width + 40) continue;
          draws.push({ i, rel, x, y: homeY + (fx ? fx.y : 0), cw, ch: cardH * scale, alpha });
        }
      }
      draws.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
      let first = true;
      for (const draw of draws) {
        const slot = this.slots[draw.i];
        this.cardProgram.uniforms.tMap.value = slot.texture;
        this.cardProgram.uniforms.uRect.value = [draw.x, draw.y, draw.cw + 2, draw.ch + 2];
        this.cardProgram.uniforms.uSize.value = [draw.cw, draw.ch];
        this.cardProgram.uniforms.uImage.value = slot.image;
        this.cardProgram.uniforms.uAlpha.value = draw.alpha;
        this.cardProgram.uniforms.uReady.value = slot.ready;
        this.cardProgram.uniforms.uShift.value = this.reducedMotion ? 0 : Math.max(-1, Math.min(1, draw.rel / (this.width * 0.75)));
        this.cardProgram.uniforms.uPlaceholder.value = slot.color;
        this.renderer.render({ scene: this.cardMesh, target: this.target, clear: first });
        first = false;
        this.instances.push({
          index: draw.i,
          x0: draw.x - draw.cw / 2,
          x1: draw.x + draw.cw / 2,
          y0: draw.y - draw.ch / 2,
          y1: draw.y + draw.ch / 2
        });
      }
      if (first) {
        this.renderer.bindFramebuffer(this.target);
        this.gl.viewport(0, 0, this.target.width, this.target.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      }
      this.renderer.bindFramebuffer();
      this.target.texture.bind();
      this.gl.generateMipmap(this.gl.TEXTURE_2D);

      this.lensUniforms.uResolution.value = [this.width, this.height];
      this.lensUniforms.uDpr.value = dpr;
      this.lensUniforms.uCenter.value = [lensX, this.lens.y];
      this.lensUniforms.uHalf.value = [Math.max(halfW, 1), Math.max(halfH, 1)];
      this.lensUniforms.uAngle.value = (s.tilt * Math.PI) / 180;
      this.lensUniforms.uExponent.value = 2 + Math.pow(1 - clamp01(s.roundness), 1.5) * 10;
      const spanW = Math.max(halfW, 1);
      const spanH = Math.max(halfH, 1);
      const inner = Math.max(4, s.reach * (spanW + spanH) * 0.5);
      this.lensUniforms.uInner.value = inner;
      this.lensUniforms.uOuter.value = inner * 1.6;
      this.lensUniforms.uFlow.value = s.bend * (spanW + spanH) * 0.45;
      this.lensUniforms.uCurl.value = s.curl === 'rise' ? 1 : s.curl === 'fall' ? -1 : 0;
      this.lensUniforms.uDispersion.value = s.dispersion * 0.12 * (1 + Math.abs(this.deform) * liquidAmount * 1.2);
      this.lensUniforms.uStrength.value = effects.strength * (1 - focusEase);
      this.lensUniforms.uSceneAlpha.value = effects.sceneAlpha;
      this.renderer.render({ scene: this.lensMesh });
    }

    let nextHover = '';
    if (this.pointer.over && !this.pointer.dragging && this.introState.done && s.focusOnClick) {
      const hit = this.instances.find(
        inst => this.pointer.x >= inst.x0 && this.pointer.x <= inst.x1 && this.pointer.y >= inst.y0 && this.pointer.y <= inst.y1
      );
      if (this.focus.target > 0) nextHover = 'close';
      else if (hit) nextHover = 'open';
    }
    if (nextHover !== this.hover) {
      this.hover = nextHover;
      if (this.hover) this.container.setAttribute('data-hover', this.hover);
      else this.container.removeAttribute('data-hover');
    }

    if (this.visible && (animating || waiting || this.dirty || this.pointer.down)) {
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  start() {
    if (this.raf || !this.visible || !this.alive) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  localPoint(e) {
    const rect = this.container.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  initListeners() {
    const onPointerDown = e => {
      if (e.button !== undefined && e.button > 0) return;
      this.skipIntro();
      const [x, y] = this.localPoint(e);
      this.pointer.down = true;
      this.pointer.id = e.pointerId;
      this.pointer.touch = e.pointerType === 'touch';
      this.pointer.startX = x;
      this.pointer.startY = y;
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.startPos = this.pos;
      this.pointer.dragging = false;
      this.pointer.samples = [{ x, t: performance.now() }];
      this.interactedAt = performance.now();
      if (Math.abs(this.vel) > 40) {
        this.goal = this.pos;
        this.vel = 0;
      }
      this.dirty = true;
      this.start();
    };

    const onPointerMove = e => {
      const [x, y] = this.localPoint(e);
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.over = true;
      if (this.pointer.down && e.pointerId === this.pointer.id) {
        const dx = x - this.pointer.startX;
        const dy = y - this.pointer.startY;
        const slop = this.pointer.touch ? 10 : 5;
        if (!this.pointer.dragging) {
          if (this.pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
            this.pointer.down = false;
            return;
          }
          if (Math.abs(dx) > slop) {
            this.pointer.dragging = true;
            this.pointer.startX = x;
            this.pointer.startPos = this.pos;
            this.closeFocus();
            try {
              this.container.setPointerCapture(e.pointerId);
            } catch {
              this.pointer.dragging = true;
            }
            this.container.setAttribute('data-dragging', '');
          }
        }
        if (this.pointer.dragging) {
          this.pos = this.pointer.startPos - (x - this.pointer.startX);
          this.goal = this.pos;
          this.vel = 0;
          const now = performance.now();
          this.pointer.samples.push({ x, t: now });
          while (this.pointer.samples.length > 2 && now - this.pointer.samples[0].t > 100) this.pointer.samples.shift();
        }
      }
      this.dirty = true;
      this.start();
    };

    const onPointerUp = e => {
      if (!this.pointer.down || e.pointerId !== this.pointer.id) return;
      this.pointer.down = false;
      this.container.removeAttribute('data-dragging');
      const s = this.settings;
      if (!s) return;
      const m = this.metrics(s);
      this.interactedAt = performance.now();
      if (this.pointer.dragging) {
        this.pointer.dragging = false;
        const now = performance.now();
        const first = this.pointer.samples[0];
        const lastSample = this.pointer.samples[this.pointer.samples.length - 1];
        let velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) {
          velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        }
        this.vel = velocity;
        const landing = this.snapPoint(m, this.pos + velocity * 0.32);
        this.goal = landing;
        if (Math.abs(velocity) > 400 && Math.abs(landing - this.pos) < 1) this.step(m, velocity > 0 ? 1 : -1);
        this.mode = 'spring';
        this.start();
        return;
      }
      if (this.closeFocus()) return;
      const [x, y] = this.localPoint(e);
      const hit = this.instances.find(inst => x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1);
      if (!hit) return;
      if (hit.index === this.activeIndex && Math.abs(this.goal - this.pos) < 2) {
        if (this.onSelect) this.onSelect(hit.index, this.items[hit.index]);
        if (s.focusOnClick) this.openFocus(hit.index);
      } else {
        const rel = (hit.x0 + hit.x1) / 2 - this.width / 2;
        this.goal = this.snapPoint(m, this.pos + rel);
        this.mode = 'spring';
        if (s.focusOnClick) this.focus.pending = hit.index;
        this.start();
      }
    };

    const onPointerLeave = () => {
      this.pointer.over = false;
      this.dirty = true;
      this.start();
    };

    const onPointerCancel = () => {
      this.pointer.down = false;
      this.pointer.dragging = false;
      this.container.removeAttribute('data-dragging');
      const s = this.settings;
      if (!s) return;
      this.goal = this.snapPoint(this.metrics(s), this.pos);
      this.mode = 'spring';
      this.start();
    };

    const onWheel = e => {
      const s = this.settings;
      if (!s || e.ctrlKey) return;
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) {
        dx = dy;
        dy = 0;
      }
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? this.height : 1;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      if (!horizontal && !s.captureWheel) return;
      e.preventDefault();
      this.skipIntro();
      this.interactedAt = performance.now();
      if (this.closeFocus()) return;
      const delta = Math.max(-120, Math.min(120, (horizontal ? dx : dy) * unit));
      this.goal += delta * 1.25;
      this.mode = 'wheel';
      this.wheelAt = performance.now();
      this.start();
    };

    const onKeyDown = e => {
      const s = this.settings;
      if (!s) return;
      const m = this.metrics(s);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.skipIntro();
        this.closeFocus();
        this.interactedAt = performance.now();
        this.step(m, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.skipIntro();
        this.closeFocus();
        this.interactedAt = performance.now();
        this.step(m, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.closeFocus();
        this.goTo(m, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.closeFocus();
        this.goTo(m, this.slots.length - 1);
      } else if (e.key === 'Escape') {
        if (this.closeFocus()) e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.closeFocus() || this.activeIndex < 0) return;
        if (this.onSelect) this.onSelect(this.activeIndex, this.items[this.activeIndex]);
        if (s.focusOnClick) this.openFocus(this.activeIndex);
      }
    };

    this.container.addEventListener('pointerdown', onPointerDown);
    this.container.addEventListener('pointermove', onPointerMove);
    this.container.addEventListener('pointerup', onPointerUp);
    this.container.addEventListener('pointerleave', onPointerLeave);
    this.container.addEventListener('pointercancel', onPointerCancel);
    this.container.addEventListener('wheel', onWheel, { passive: false });
    this.container.addEventListener('keydown', onKeyDown);
    this.container.addEventListener('focus', () => { this.hasFocus = true; });
    this.container.addEventListener('blur', () => { this.hasFocus = false; });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.start();
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.start();
    });
    this.intersectionObserver.observe(this.container);
  }

  destroy() {
    this.alive = false;
    this.visible = false;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.slots.forEach(slot => slot.dispose());
    this.slots = [];
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  }
}
