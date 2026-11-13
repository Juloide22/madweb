import { VanillaFlexCarousel } from './flex-carousel.js';

// ============================================================
// MADVIZ — Galería Flex Carousel Controller (archive.html)
// ============================================================

const IMAGES_DATA = [
  // 01. CASA FLEXA
  { src: 'images/proyectos/01-casa-flexa/render-01.jpg', title: 'Casa Flexa', isInterior: false },
  { src: 'images/proyectos/01-casa-flexa/render-02.jpeg', title: 'Casa Flexa', isInterior: false },
  { src: 'images/proyectos/01-casa-flexa/render-03.jpeg', title: 'Casa Flexa', isInterior: false },
  { src: 'images/proyectos/01-casa-flexa/render-04.jpeg', title: 'Casa Flexa', isInterior: false },

  // 02. EDIFICIO AURA I
  { src: 'images/proyectos/02-edificio-aura-i/render-05.png', title: 'Edificio Aura I', isInterior: false },
  { src: 'images/proyectos/02-edificio-aura-i/render-06.png', title: 'Edificio Aura I', isInterior: false },
  { src: 'images/proyectos/02-edificio-aura-i/render-07.png', title: 'Edificio Aura I', isInterior: false },
  { src: 'images/proyectos/02-edificio-aura-i/render-08.png', title: 'Edificio Aura I', isInterior: true },

  // 03. EDIFICIO VERONA
  { src: 'images/proyectos/03-edificio-verona/render-09.jpeg', title: 'Edificio Verona', isInterior: false },
  { src: 'images/proyectos/03-edificio-verona/render-10.jpeg', title: 'Edificio Verona', isInterior: false },
  { src: 'images/proyectos/03-edificio-verona/render-11.jpg', title: 'Edificio Verona', isInterior: true },
  { src: 'images/proyectos/03-edificio-verona/render-12.jpeg', title: 'Edificio Verona', isInterior: true },

  // 04. VIVIENDAS CHIUSO
  { src: 'images/proyectos/04-viviendas-chiuso/render-13.jpeg', title: 'Viviendas Chiuso', isInterior: false },
  { src: 'images/proyectos/04-viviendas-chiuso/render-14.jpeg', title: 'Viviendas Chiuso', isInterior: true },
  { src: 'images/proyectos/04-viviendas-chiuso/render-15.jpeg', title: 'Viviendas Chiuso', isInterior: true },
  { src: 'images/proyectos/04-viviendas-chiuso/render-16.jpeg', title: 'Viviendas Chiuso', isInterior: true },

  // 05. EDIFICIO ANKARA II
  { src: 'images/proyectos/05-edificio-ankara%20ii/render-17.jpg', title: 'Edificio Ankara II', isInterior: false },
  { src: 'images/proyectos/05-edificio-ankara%20ii/render-18.jpg', title: 'Edificio Ankara II', isInterior: true },
  { src: 'images/proyectos/05-edificio-ankara%20ii/render-19.jpg', title: 'Edificio Ankara II', isInterior: true },
  { src: 'images/proyectos/05-edificio-ankara%20ii/render-20.jpg', title: 'Edificio Ankara II', isInterior: true },

  // 06. RESIDENCIA MODERNA
  { src: 'images/galeria/01.jpg', title: 'Residencia Moderna', isInterior: false },
  { src: 'images/galeria/02.jpg', title: 'Residencia Moderna', isInterior: false },
  { src: 'images/galeria/03.jpg', title: 'Residencia Moderna', isInterior: false },
  { src: 'images/galeria/04.jpg', title: 'Residencia Moderna', isInterior: false },
  { src: 'images/galeria/05.jpg', title: 'Residencia Moderna', isInterior: true },
  { src: 'images/galeria/06.jpg', title: 'Residencia Moderna', isInterior: true },
  { src: 'images/galeria/07.jpg', title: 'Residencia Moderna', isInterior: true },
  { src: 'images/galeria/08.jpg', title: 'Residencia Moderna', isInterior: true },
  { src: 'images/galeria/09.jpg', title: 'Residencia Moderna', isInterior: true },
  { src: 'images/galeria/10.jpg', title: 'Residencia Moderna', isInterior: true }
];

const TRANSLATIONS = {
  es: {
    status: 'Arrastrar o deslizar para explorar · Clic en una imagen para ampliar',
    gallery: 'GALERIA',
    exteriors: 'EXTERIORES',
    interiors: 'INTERIORES',
    exteriorLabel: 'Exterior · MADVIZ',
    interiorLabel: 'Interior · MADVIZ'
  },
  en: {
    status: 'Drag or scroll to explore · Click any render to expand',
    gallery: 'GALLERY',
    exteriors: 'EXTERIORS',
    interiors: 'INTERIORS',
    exteriorLabel: 'Exterior · MADVIZ',
    interiorLabel: 'Interior · MADVIZ'
  }
};

// ============================================================
// SILK BACKGROUND SHADER (WebGL Nativo)
// ============================================================
class SilkBackground {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power', alpha: false });
    if (!this.gl) return;

    this.speed = options.speed ?? 5;
    this.scale = options.scale ?? 1;
    this.noiseIntensity = options.noiseIntensity ?? 1.5;
    this.rotation = options.rotation ?? 0;
    this.color = this.hexToRGB(options.color || '#363e80');
    this.init();
  }

  hexToRGB(hex) {
    const clean = hex.replace('#', '');
    return [
      parseInt(clean.slice(0, 2), 16) / 255,
      parseInt(clean.slice(2, 4), 16) / 255,
      parseInt(clean.slice(4, 6), 16) / 255
    ];
  }

  init() {
    const gl = this.gl;
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = (aPosition + 1.0) * 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3  uColor;
      uniform float uSpeed;
      uniform float uScale;
      uniform float uRotation;
      uniform float uNoiseIntensity;
      uniform vec2  uResolution;
      const float e = 2.71828182845904523536;
      float noise(vec2 texCoord) {
        float G = e;
        vec2  r = (G * sin(G * texCoord));
        return fract(r.x * r.y * (1.0 + texCoord.x));
      }
      vec2 rotateUvs(vec2 uv, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        mat2  rot = mat2(c, -s, s, c);
        return rot * uv;
      }
      void main() {
        float rnd = noise(gl_FragCoord.xy);
        vec2 aspectUv = vUv;
        if (uResolution.x > uResolution.y) {
          aspectUv.x = (aspectUv.x - 0.5) * (uResolution.x / uResolution.y) + 0.5;
        } else {
          aspectUv.y = (aspectUv.y - 0.5) * (uResolution.y / uResolution.x) + 0.5;
        }
        vec2  uv      = rotateUvs(aspectUv * uScale, uRotation);
        vec2  tex     = uv * uScale;
        float tOffset = uSpeed * uTime;
        tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
        float pattern = 0.6 +
                        0.4 * sin(5.0 * (tex.x + tex.y +
                                         cos(3.0 * tex.x + 5.0 * tex.y) +
                                         0.02 * tOffset) +
                                 sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));
        float grain = rnd / 15.0 * uNoiseIntensity;
        vec3 result = uColor * pattern - vec3(grain);
        gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
      }
    `;

    const compileShader = (type, source) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const verts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uColor = gl.getUniformLocation(prog, 'uColor');
    const uSpeed = gl.getUniformLocation(prog, 'uSpeed');
    const uScale = gl.getUniformLocation(prog, 'uScale');
    const uRotation = gl.getUniformLocation(prog, 'uRotation');
    const uNoise = gl.getUniformLocation(prog, 'uNoiseIntensity');
    const uRes = gl.getUniformLocation(prog, 'uResolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.canvas.width = Math.floor(window.innerWidth * dpr);
      this.canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const startTime = performance.now();
    const render = () => {
      const t = (performance.now() - startTime) * 0.001;
      gl.uniform1f(uTime, t);
      gl.uniform3fv(uColor, this.color);
      gl.uniform1f(uSpeed, this.speed * 0.25);
      gl.uniform1f(uScale, this.scale);
      gl.uniform1f(uRotation, this.rotation);
      gl.uniform1f(uNoise, this.noiseIntensity);
      gl.uniform2f(uRes, this.canvas.width, this.canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }
}

// ============================================================
// APP PRINCIPAL
// ============================================================
function initArchiveFlexGallery() {
  // 1. Iniciar Silk Background
  const silkCanvas = document.getElementById('silk-canvas');
  if (silkCanvas) {
    window.silkBg = new SilkBackground(silkCanvas, {
      speed: 5,
      scale: 1,
      color: '#363e80',
      noiseIntensity: 1.5,
      rotation: 0
    });
  }

  let currentLang = localStorage.getItem('mad_lang') || 'es';
  let currentMode = 'gallery';
  let currentItems = [];

  const getMappedItems = (mode) => {
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.es;
    let source = IMAGES_DATA;
    if (mode === 'exteriors') source = IMAGES_DATA.filter(d => !d.isInterior);
    else if (mode === 'interiors') source = IMAGES_DATA.filter(d => d.isInterior);

    return source.map(item => ({
      ...item,
      alt: item.title,
      subtitle: item.isInterior ? t.interiorLabel : t.exteriorLabel
    }));
  };

  currentItems = getMappedItems(currentMode);

  // 2. Iniciar Flex Carousel
  const mount = document.getElementById('flex-carousel-mount');
  const isMobile = window.innerWidth < 768;

  const carousel = new VanillaFlexCarousel(mount, {
    items: currentItems,
    preset: 'arch',
    intro: 'deal',
    cardHeight: isMobile ? 0.50 : 0.61,
    gap: isMobile ? 12 : 17,
    squeeze: 0.19,
    focusOnClick: false,
    captions: true,
    lensWidth: 0.84,
    lensHeight: 1.48,
    tilt: -34,
    roundness: 0.87,
    bend: 0.37,
    reach: 0.25,
    dispersion: 1,
    liquid: 0.35,
    followCursor: true,
    onSelect: (index, item) => {
      openLightbox(index);
    }
  });
  window.galleryCarousel = carousel;

  // 3. Lightbox Fullscreen
  const lightbox = document.getElementById('flex-lightbox');
  const lbImg = document.getElementById('flex-lightbox-img');
  const lbTitle = document.getElementById('flex-lightbox-title');
  const lbClose = document.getElementById('flex-lightbox-close');
  const lbPrev = document.getElementById('flex-lightbox-prev');
  const lbNext = document.getElementById('flex-lightbox-next');
  let lbIndex = 0;

  const updateLightboxContent = (idx) => {
    if (!currentItems.length) return;
    lbIndex = ((idx % currentItems.length) + currentItems.length) % currentItems.length;
    const item = currentItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.title;
    lbTitle.textContent = `${item.title} — ${item.subtitle}`;
  };

  const openLightbox = (idx) => {
    updateLightboxContent(idx);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateLightboxContent(lbIndex - 1);
  });
  lbNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    updateLightboxContent(lbIndex + 1);
  });
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') updateLightboxContent(lbIndex - 1);
    else if (e.key === 'ArrowRight') updateLightboxContent(lbIndex + 1);
  });

  // 4. Botones de Modo (Galería / Exteriores / Interiores) y Shuffle
  const modeBtns = document.querySelectorAll('.hud__mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      if (!mode || mode === currentMode) return;
      currentMode = mode;
      modeBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      currentItems = getMappedItems(currentMode);
      carousel.setItems(currentItems);
    });
  });

  const shuffleBtn = document.getElementById('btn-shuffle');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentItems = [...currentItems].sort(() => Math.random() - 0.5);
      carousel.setItems(currentItems);
    });
  }

  // Botones Anterior / Siguiente del HUD
  document.getElementById('btn-prev')?.addEventListener('click', () => carousel.prev());
  document.getElementById('btn-next')?.addEventListener('click', () => carousel.next());

  // 5. Idioma (ES / EN)
  const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('mad_lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    const t = TRANSLATIONS[lang] || TRANSLATIONS.es;
    const statusText = document.getElementById('hud-status-text');
    if (statusText) statusText.textContent = t.status;

    modeBtns.forEach(btn => {
      const m = btn.dataset.mode;
      if (m && t[m]) btn.textContent = t[m];
    });

    document.querySelectorAll('[data-es][data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) el.textContent = text;
    });

    // Actualizar subtítulos manteniendo el orden actual
    currentItems = currentItems.map(item => ({
      ...item,
      subtitle: item.isInterior ? t.interiorLabel : t.exteriorLabel
    }));
    carousel.items = currentItems;
    if (carousel.activeIndex >= 0) {
      carousel.updateCaption(carousel.activeIndex);
    }
  };

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.dataset.lang) setLanguage(btn.dataset.lang);
    });
  });
  setLanguage(currentLang);

  // 6. Menú Mobile Overlay
  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuClose = menuOverlay?.querySelector('.menu-overlay__close');

  menuToggle?.addEventListener('click', () => menuOverlay.classList.add('is-open'));
  menuClose?.addEventListener('click', () => menuOverlay.classList.remove('is-open'));

  // 7. Puntero Custom Dot
  const cursor = document.getElementById('cursor-dot');
  if (cursor && !window.matchMedia('(pointer: coarse)').matches) {
    let mouseX = -100, mouseY = -100;
    let currX = -100, currY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!cursor.classList.contains('is-active')) {
        cursor.classList.add('is-active');
        currX = mouseX;
        currY = mouseY;
      }
    }, { passive: true });

    window.addEventListener('mouseout', () => cursor.classList.remove('is-active'));

    const cursorLoop = () => {
      currX += (mouseX - currX) * 0.45;
      currY += (mouseY - currY) * 0.45;
      cursor.style.left = `${currX}px`;
      cursor.style.top = `${currY}px`;
      requestAnimationFrame(cursorLoop);
    };
    requestAnimationFrame(cursorLoop);

    window.addEventListener('mouseover', (e) => {
      const isClickable = e.target?.closest('a, button, [role="button"]');
      cursor.classList.toggle('is-hovering', !!isClickable);
    }, { passive: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initArchiveFlexGallery);
} else {
  initArchiveFlexGallery();
}
