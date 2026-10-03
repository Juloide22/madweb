/**
 * MAD VIZ — 3D Dome Gallery (React Bits Port to Vanilla JS)
 * Spherical 3D dome visualization with momentum inertia, fluid tile zoom,
 * WebGL Silk shader background, HUD mode matrix and multilingual support.
 *
 * User configuration:
 *   fit: 0.7, minRadius: 450, segments: 30, dragDampening: 0.8, grayscale: false
 */

(function () {
  'use strict';

  // ============================================================
  // CATÁLOGO DE IMÁGENES Y PROYECTOS (20 Renders Reales MADVIZ)
  // ============================================================
  const IMAGES_DATA = [
    // 01. CASA FLEXA (0..3)
    { id: 'img-0', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', folder: '01-casa-flexa', file: 'render-01.jpg', isInterior: false },
    { id: 'img-1', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', folder: '01-casa-flexa', file: 'render-02.jpeg', isInterior: false },
    { id: 'img-2', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', folder: '01-casa-flexa', file: 'render-03.jpeg', isInterior: false },
    { id: 'img-3', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', folder: '01-casa-flexa', file: 'render-04.jpeg', isInterior: false },

    // 02. EDIFICIO AURA I (4..7)
    { id: 'img-4', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', folder: '02-edificio-aura-i', file: 'render-05.png', isInterior: false },
    { id: 'img-5', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', folder: '02-edificio-aura-i', file: 'render-06.png', isInterior: false },
    { id: 'img-6', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', folder: '02-edificio-aura-i', file: 'render-07.png', isInterior: false },
    { id: 'img-7', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', folder: '02-edificio-aura-i', file: 'render-08.png', isInterior: true },

    // 03. EDIFICIO VERONA (8..11)
    { id: 'img-8', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', folder: '03-edificio-verona', file: 'render-09.jpeg', isInterior: false },
    { id: 'img-9', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', folder: '03-edificio-verona', file: 'render-10.jpeg', isInterior: false },
    { id: 'img-10', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', folder: '03-edificio-verona', file: 'render-11.jpg', isInterior: true },
    { id: 'img-11', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', folder: '03-edificio-verona', file: 'render-12.jpeg', isInterior: true },

    // 04. VIVIENDAS CHIUSO (12..15)
    { id: 'img-12', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', folder: '04-viviendas-chiuso', file: 'render-13.jpeg', isInterior: false },
    { id: 'img-13', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', folder: '04-viviendas-chiuso', file: 'render-14.jpeg', isInterior: true },
    { id: 'img-14', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', folder: '04-viviendas-chiuso', file: 'render-15.jpeg', isInterior: true },
    { id: 'img-15', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', folder: '04-viviendas-chiuso', file: 'render-16.jpeg', isInterior: true },

    // 05. EDIFICIO ANKARA II (16..19)
    { id: 'img-16', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', folder: '05-edificio-ankara%20ii', file: 'render-17.jpg', isInterior: false },
    { id: 'img-17', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', folder: '05-edificio-ankara%20ii', file: 'render-18.jpg', isInterior: true },
    { id: 'img-18', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', folder: '05-edificio-ankara%20ii', file: 'render-19.jpg', isInterior: true },
    { id: 'img-19', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', folder: '05-edificio-ankara%20ii', file: 'render-20.jpg', isInterior: true }
  ];

  // Helper para construir items normalizados
  const buildNormalizedImagePool = (dataList) => {
    return dataList.map(d => ({
      src: `images/proyectos/${d.folder}/${d.file}`,
      alt: d.projTitle,
      data: d
    }));
  };

  // Pools por categoría
  const IMAGE_POOLS = {
    gallery: buildNormalizedImagePool(IMAGES_DATA),
    projects: buildNormalizedImagePool(IMAGES_DATA), // ordenado por proyectos
    exteriors: buildNormalizedImagePool(IMAGES_DATA.filter(d => !d.isInterior)),
    interiors: buildNormalizedImagePool(IMAGES_DATA.filter(d => d.isInterior))
  };

  // Textos bilingües de la interfaz
  const TRANSLATIONS = {
    es: {
      status: 'Arrastrar para explorar · Clic en una imagen para ampliar',
      recenter: 'VISTA GENERAL',
      gallery: 'GALERIA',
      projects: 'PROYECTOS',
      exteriors: 'EXTERIORES',
      interiors: 'INTERIORES'
    },
    en: {
      status: 'Drag to explore · Click any render to expand',
      recenter: 'OVERVIEW',
      gallery: 'GALLERY',
      projects: 'PROJECTS',
      exteriors: 'EXTERIORS',
      interiors: 'INTERIORS'
    }
  };

  // ============================================================
  // SILK BACKGROUND SHADER (WebGL Nativo — React Bits Port)
  // Parámetros: color="#363e80", speed=5, scale=1, noiseIntensity=1.5, rotation=0
  // ============================================================
  class SilkBackground {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      if (!this.canvas) return;
      this.gl = this.canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power', alpha: false });
      if (!this.gl) {
        console.warn('WebGL no disponible para Silk Background');
        return;
      }

      this.speed = options.speed ?? 5;
      this.scale = options.scale ?? 1;
      this.noiseIntensity = options.noiseIntensity ?? 1.5;
      this.rotation = options.rotation ?? 0;
      this.lightMode = options.lightMode ? 1.0 : 0.0;
      this.color = this.hexToRGB(options.color || '#363e80');
      this.isRunning = true;

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
        uniform float uLightMode;
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

          if (uLightMode > 0.5) {
            float fold = smoothstep(0.28, 0.9, pattern);
            float specular = smoothstep(0.72, 0.98, pattern);
            vec3 shadowColor = uColor * 0.72;
            vec3 bodyColor = min(uColor * 1.18, vec3(1.0));
            vec3 lightBase = mix(shadowColor, bodyColor, fold);
            lightBase = mix(lightBase, vec3(1.0), specular * 0.92);
            float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
            float grainSignal = (rnd + fineNoise - 1.0);
            float grainStrength = clamp(uNoiseIntensity * 0.038, 0.0, 0.16);
            result = lightBase + grainSignal * grainStrength;
          }

          gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
        }
      `;

      function compileShader(type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error('Shader error:', gl.getShaderInfoLog(s));
          gl.deleteShader(s);
          return null;
        }
        return s;
      }

      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(prog));
        return;
      }

      this.program = prog;

      const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(prog, 'aPosition');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      this.uTimeLoc = gl.getUniformLocation(prog, 'uTime');
      this.uColorLoc = gl.getUniformLocation(prog, 'uColor');
      this.uSpeedLoc = gl.getUniformLocation(prog, 'uSpeed');
      this.uScaleLoc = gl.getUniformLocation(prog, 'uScale');
      this.uRotationLoc = gl.getUniformLocation(prog, 'uRotation');
      this.uNoiseIntensityLoc = gl.getUniformLocation(prog, 'uNoiseIntensity');
      this.uLightModeLoc = gl.getUniformLocation(prog, 'uLightMode');
      this.uResolutionLoc = gl.getUniformLocation(prog, 'uResolution');

      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isRunning = false;
        } else {
          this.isRunning = true;
          this.lastTime = performance.now();
          requestAnimationFrame(this.render);
        }
      });

      this.startTime = performance.now();
      this.lastTime = this.startTime;
      this.totalTime = 0;

      this.render = this.render.bind(this);
      requestAnimationFrame(this.render);
    }

    resize() {
      if (!this.canvas || !this.gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
      }
    }

    render(now) {
      if (!this.isRunning || !this.gl || !this.program) return;

      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.totalTime += 0.1 * dt;

      const gl = this.gl;
      gl.useProgram(this.program);
      gl.uniform1f(this.uTimeLoc, this.totalTime);
      gl.uniform3f(this.uColorLoc, this.color[0], this.color[1], this.color[2]);
      gl.uniform1f(this.uSpeedLoc, this.speed);
      gl.uniform1f(this.uScaleLoc, this.scale);
      gl.uniform1f(this.uRotationLoc, this.rotation);
      gl.uniform1f(this.uNoiseIntensityLoc, this.noiseIntensity);
      gl.uniform1f(this.uLightModeLoc, this.lightMode);
      gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(this.render);
    }
  }

  // ============================================================
  // CLASE PRINCIPAL: VANILLA DOME GALLERY
  // ============================================================
  class VanillaDomeGallery {
    constructor(options = {}) {
      this.root = document.getElementById('dome-root');
      this.main = document.getElementById('sphere-main');
      this.sphere = document.getElementById('sphere');
      this.viewer = document.getElementById('viewer');
      this.scrim = document.getElementById('scrim');
      this.frame = document.getElementById('frame');

      // Opciones configuradas
      this.fit = options.fit ?? 0.7;
      this.initialFit = this.fit;
      this.minRadius = options.minRadius ?? 450;
      this.maxRadius = options.maxRadius ?? Infinity;
      this.segments = options.segments ?? 30;
      this.dragDampening = options.dragDampening ?? 0.8;
      this.grayscale = options.grayscale ?? false;
      this.maxVerticalRotationDeg = options.maxVerticalRotationDeg ?? 5;
      this.dragSensitivity = options.dragSensitivity ?? 20;
      this.enlargeTransitionMs = options.enlargeTransitionMs ?? 320;
      this.overlayBlurColor = options.overlayBlurColor ?? '#070707';
      this.imageBorderRadius = options.imageBorderRadius ?? '16px';
      this.openedImageBorderRadius = options.openedImageBorderRadius ?? '20px';

      // Estado interno
      this.currentMode = 'gallery';
      this.currentPool = [...IMAGE_POOLS.gallery];
      this.rotation = { x: 0, y: 0 };
      this.startRot = { x: 0, y: 0 };
      this.startPos = null;
      this.isDragging = false;
      this.hasMoved = false;
      this.inertiaRAF = null;
      this.isOpening = false;
      this.openStartedAt = 0;
      this.lastDragEndAt = 0;
      this.focusedEl = null;
      this.originalTilePos = null;
      this.recentPoints = [];
      this.recenterRAF = null;

      // Idioma activo
      this.currentLang = localStorage.getItem('mad_lang') || 'es';

      // Helpers matemáticos
      this.clamp = (v, min, max) => Math.min(Math.max(v, min), max);
      this.normalizeAngle = d => ((d % 360) + 360) % 360;
      this.wrapAngleSigned = deg => {
        const a = (((deg + 180) % 360) + 360) % 360;
        return a - 180;
      };

      this.init();
    }

    // Rotación angular de cada slot en la esfera 3D
    computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
      const unit = 360 / segments / 2;
      const rotateY = unit * (offsetX + (sizeX - 1) / 2);
      const rotateX = unit * (offsetY - (sizeY - 1) / 2);
      return { rotateX, rotateY };
    }

    // Generador de los 150 slots de la cúpula geodésica / esférica
    buildItems(pool, seg) {
      const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
      const evenYs = [-4, -2, 0, 2, 4];
      const oddYs = [-3, -1, 1, 3, 5];

      const coords = xCols.flatMap((x, c) => {
        const ys = c % 2 === 0 ? evenYs : oddYs;
        return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
      });

      const totalSlots = coords.length;
      if (!pool || pool.length === 0) {
        return coords.map(c => ({ ...c, src: '', alt: '', data: {} }));
      }

      const usedImages = Array.from({ length: totalSlots }, (_, i) => pool[i % pool.length]);

      // Evitar imágenes idénticas inmediatamente adyacentes
      for (let i = 1; i < usedImages.length; i++) {
        if (usedImages[i].src === usedImages[i - 1].src) {
          for (let j = i + 1; j < usedImages.length; j++) {
            if (usedImages[j].src !== usedImages[i].src) {
              const tmp = usedImages[i];
              usedImages[i] = usedImages[j];
              usedImages[j] = tmp;
              break;
            }
          }
        }
      }

      return coords.map((c, i) => ({
        ...c,
        src: usedImages[i].src,
        alt: usedImages[i].alt,
        data: usedImages[i].data
      }));
    }

    init() {
      // Configurar variables CSS en el root
      this.root.style.setProperty('--segments-x', this.segments);
      this.root.style.setProperty('--segments-y', this.segments);
      this.root.style.setProperty('--overlay-blur-color', this.overlayBlurColor);
      this.root.style.setProperty('--tile-radius', this.imageBorderRadius);
      this.root.style.setProperty('--enlarge-radius', this.openedImageBorderRadius);
      this.root.style.setProperty('--image-filter', this.grayscale ? 'grayscale(1)' : 'none');

      this.updateLayout();
      window.addEventListener('resize', () => this.updateLayout(), { passive: true });

      // Render inicial de slots
      this.items = this.buildItems(this.currentPool, this.segments);
      this.renderSphereItems();

      // Eventos de arrastre, gestos y UI
      this.initEvents();
      this.initUIControls();
      this.initLanguage();

      // Aplicar posición inicial
      this.applyTransform(this.rotation.x, this.rotation.y);
      this.updateZoomLabel();
    }

    renderSphereItems() {
      this.sphere.innerHTML = '';
      const fragment = document.createDocumentFragment();

      this.items.forEach((it) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item';
        itemEl.dataset.src = it.src;
        itemEl.dataset.offsetX = it.x;
        itemEl.dataset.offsetY = it.y;
        itemEl.dataset.sizeX = it.sizeX;
        itemEl.dataset.sizeY = it.sizeY;
        itemEl.dataset.projTitle = it.data?.projTitle || '';

        itemEl.style.setProperty('--offset-x', it.x);
        itemEl.style.setProperty('--offset-y', it.y);
        itemEl.style.setProperty('--item-size-x', it.sizeX);
        itemEl.style.setProperty('--item-size-y', it.sizeY);

        const imgDiv = document.createElement('div');
        imgDiv.className = 'item__image';
        imgDiv.setAttribute('role', 'button');
        imgDiv.setAttribute('tabindex', '0');
        imgDiv.setAttribute('aria-label', it.alt || 'Render arquitectónico');

        const img = document.createElement('img');
        img.src = it.src;
        img.alt = it.alt;
        img.draggable = false;
        img.loading = 'lazy';

        imgDiv.appendChild(img);
        itemEl.appendChild(imgDiv);

        imgDiv.addEventListener('click', () => {
          if (this.isDragging || this.hasMoved) return;
          if (performance.now() - this.lastDragEndAt < 100) return;
          if (this.isOpening) return;
          this.openItem(imgDiv);
        });

        fragment.appendChild(itemEl);
      });

      this.sphere.appendChild(fragment);
    }

    updateLayout() {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      const basis = aspect >= 1.3 ? w : minDim;

      let radius = basis * this.fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = this.clamp(radius, this.minRadius, this.maxRadius);
      this.radius = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * 0.22));
      this.root.style.setProperty('--radius', `${this.radius}px`);
      this.root.style.setProperty('--viewer-pad', `${viewerPad}px`);

      this.applyTransform(this.rotation.x, this.rotation.y);
    }

    applyTransform(xDeg, yDeg) {
      if (this.sphere) {
        this.sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
      }
    }

    stopInertia() {
      if (this.inertiaRAF) {
        cancelAnimationFrame(this.inertiaRAF);
        this.inertiaRAF = null;
      }
    }

    startInertia(vx, vy) {
      const MAX_V = 1.6;
      let vX = this.clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = this.clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = this.clamp(this.dragDampening ?? 0.8, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);

      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          this.inertiaRAF = null;
          return;
        }
        if (++frames > maxFrames) {
          this.inertiaRAF = null;
          return;
        }
        const nextX = this.clamp(this.rotation.x - vY / 200, -this.maxVerticalRotationDeg, this.maxVerticalRotationDeg);
        const nextY = this.wrapAngleSigned(this.rotation.y + vX / 200);
        this.rotation = { x: nextX, y: nextY };
        this.applyTransform(nextX, nextY);
        this.inertiaRAF = requestAnimationFrame(step);
      };

      this.stopInertia();
      this.inertiaRAF = requestAnimationFrame(step);
    }

    initEvents() {
      // Arrastre con puntero (Pointer Events)
      const onPointerDown = (e) => {
        if (this.focusedEl) return;
        this.stopInertia();
        if (this.recenterRAF) cancelAnimationFrame(this.recenterRAF);

        this.isDragging = true;
        this.hasMoved = false;
        this.startRot = { ...this.rotation };
        this.startPos = { x: e.clientX, y: e.clientY };
        this.recentPoints = [{ t: performance.now(), x: e.clientX, y: e.clientY }];

        // Cursor drag effect
        const cursor = document.getElementById('cursor-dot');
        if (cursor) cursor.classList.add('is-dragging');
      };

      const onPointerMove = (e) => {
        if (this.focusedEl || !this.isDragging || !this.startPos) return;
        const dxTotal = e.clientX - this.startPos.x;
        const dyTotal = e.clientY - this.startPos.y;

        if (!this.hasMoved) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) this.hasMoved = true;
        }

        const nextX = this.clamp(
          this.startRot.x - dyTotal / this.dragSensitivity,
          -this.maxVerticalRotationDeg,
          this.maxVerticalRotationDeg
        );
        const nextY = this.wrapAngleSigned(this.startRot.y + dxTotal / this.dragSensitivity);

        if (this.rotation.x !== nextX || this.rotation.y !== nextY) {
          this.rotation = { x: nextX, y: nextY };
          this.applyTransform(nextX, nextY);
        }

        const now = performance.now();
        this.recentPoints.push({ t: now, x: e.clientX, y: e.clientY });
        if (this.recentPoints.length > 5) this.recentPoints.shift();
      };

      const onPointerUp = () => {
        if (!this.isDragging) return;
        this.isDragging = false;

        const cursor = document.getElementById('cursor-dot');
        if (cursor) cursor.classList.remove('is-dragging');

        let vx = 0, vy = 0;
        if (this.recentPoints.length >= 2) {
          const last = this.recentPoints[this.recentPoints.length - 1];
          const first = this.recentPoints[0];
          const dt = Math.max(1, last.t - first.t);
          vx = ((last.x - first.x) / dt) * 16;
          vy = ((last.y - first.y) / dt) * 16;
        }

        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
          this.startInertia(vx / 20, vy / 20);
        }

        if (this.hasMoved) this.lastDragEndAt = performance.now();
        this.hasMoved = false;
      };

      this.main.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerUp, { passive: true });

      // Cierre con scrim o escape
      this.scrim.addEventListener('click', () => this.closeItem());
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeItem();
      });
    }

    // Ampliación 3D fluida al centro con FLIP animation
    openItem(el) {
      if (this.isOpening) return;
      this.isOpening = true;
      this.openStartedAt = performance.now();

      const parent = el.parentElement;
      this.focusedEl = el;
      el.setAttribute('data-focused', 'true');

      const offsetX = parseFloat(parent.dataset.offsetX) || 0;
      const offsetY = parseFloat(parent.dataset.offsetY) || 0;
      const sizeX = parseFloat(parent.dataset.sizeX) || 2;
      const sizeY = parseFloat(parent.dataset.sizeY) || 2;

      // Calcular orientación exacta para que el tile mire perpendicular a la cámara
      const parentRot = this.computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, this.segments);
      const parentY = this.normalizeAngle(parentRot.rotateY);
      const globalY = this.normalizeAngle(this.rotation.y);

      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - this.rotation.x;

      parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
      parent.style.setProperty('--rot-x-delta', `${rotX}deg`);

      // Div de referencia invisible para calcular geometría exacta en pantalla
      const refDiv = document.createElement('div');
      refDiv.className = 'item__image item__image--reference';
      refDiv.style.opacity = '0';
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);

      void refDiv.offsetHeight;

      const tileR = refDiv.getBoundingClientRect();
      const mainR = this.main.getBoundingClientRect();
      const frameR = this.frame.getBoundingClientRect();

      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
        this.isOpening = false;
        this.focusedEl = null;
        parent.removeChild(refDiv);
        return;
      }

      this.originalTilePos = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      el.style.visibility = 'hidden';
      el.style.zIndex = '0';

      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      overlay.style.position = 'absolute';
      overlay.style.left = (frameR.left - mainR.left) + 'px';
      overlay.style.top = (frameR.top - mainR.top) + 'px';
      overlay.style.width = frameR.width + 'px';
      overlay.style.height = frameR.height + 'px';
      overlay.style.opacity = '0';
      overlay.style.zIndex = '30';
      overlay.style.willChange = 'transform, opacity, left, top, width, height';
      overlay.style.transformOrigin = 'top left';
      overlay.style.transition = `transform ${this.enlargeTransitionMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${this.enlargeTransitionMs}ms ease`;

      const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
      const img = document.createElement('img');
      img.src = rawSrc;
      img.alt = parent.dataset.projTitle || 'MADVIZ';
      overlay.appendChild(img);

      // Botón de cierre visible
      const closeBtn = document.createElement('button');
      closeBtn.className = 'enlarge-close-btn';
      closeBtn.setAttribute('aria-label', 'Cerrar');
      closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeItem();
      });
      overlay.appendChild(closeBtn);

      // REGLA ESTRICTA: Solo nombre de proyecto, sin descripciones de espacio
      const projTitle = parent.dataset.projTitle || '';
      if (projTitle) {
        const cap = document.createElement('div');
        cap.className = 'enlarge-caption';
        cap.innerHTML = `<span>${projTitle}</span><span class="enlarge-caption__brand">MADVIZ</span>`;
        overlay.appendChild(cap);
      }

      this.viewer.appendChild(overlay);

      const tx0 = tileR.left - frameR.left;
      const ty0 = tileR.top - frameR.top;
      const sx0 = tileR.width / frameR.width;
      const sy0 = tileR.height / frameR.height;
      const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
      const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

      requestAnimationFrame(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
        this.root.setAttribute('data-enlarging', 'true');
        document.body.classList.add('dg-scroll-lock');
      });
    }

    closeItem() {
      if (performance.now() - this.openStartedAt < 200) return;
      const el = this.focusedEl;
      if (!el) return;

      const parent = el.parentElement;
      const overlay = this.viewer.querySelector('.enlarge');
      if (!overlay) return;

      const refDiv = parent.querySelector('.item__image--reference');
      const originalPos = this.originalTilePos;

      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        el.style.visibility = '';
        el.style.zIndex = '0';
        this.focusedEl = null;
        this.root.removeAttribute('data-enlarging');
        document.body.classList.remove('dg-scroll-lock');
        this.isOpening = false;
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = this.root.getBoundingClientRect();
      const originalPosRel = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height
      };
      const overlayRel = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };

      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `position:absolute;left:${overlayRel.left}px;top:${overlayRel.top}px;width:${overlayRel.width}px;height:${overlayRel.height}px;z-index:9999;border-radius:var(--enlarge-radius, 20px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.5);transition:all ${this.enlargeTransitionMs}ms cubic-bezier(0.16, 1, 0.3, 1);pointer-events:none;margin:0;transform:none;`;

      const originalImg = overlay.querySelector('img');
      if (originalImg) {
        const img = originalImg.cloneNode();
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      this.root.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRel.left + 'px';
        animatingOverlay.style.top = originalPosRel.top + 'px';
        animatingOverlay.style.width = originalPosRel.width + 'px';
        animatingOverlay.style.height = originalPosRel.height + 'px';
        animatingOverlay.style.opacity = '0';
      });

      const cleanup = () => {
        animatingOverlay.remove();
        this.originalTilePos = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');

        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = '0';
          this.focusedEl = null;
          this.root.removeAttribute('data-enlarging');
          document.body.classList.remove('dg-scroll-lock');

          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                this.isOpening = false;
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
    }

    // Selector de modo (GALERIA · PROYECTOS · EXTERIORES · INTERIORES)
    setMode(modeName) {
      if (this.currentMode === modeName) return;
      this.currentMode = modeName;

      // Actualizar clase activa en botones
      const modeBtns = document.querySelectorAll('.hud__mode-btn');
      modeBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.mode === modeName);
      });

      const targetPool = IMAGE_POOLS[modeName] || IMAGE_POOLS.gallery;
      this.currentPool = [...targetPool];

      // Transición de refresco en la cúpula
      const allItems = this.sphere.querySelectorAll('.item');
      allItems.forEach(item => item.classList.add('is-faded'));

      setTimeout(() => {
        this.items = this.buildItems(this.currentPool, this.segments);
        this.renderSphereItems();
      }, 180);
    }

    // Aleatorizador con rotación dinámica e impulso
    shuffle() {
      const shuffleBtn = document.getElementById('btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.classList.add('is-spinning');
        setTimeout(() => shuffleBtn.classList.remove('is-spinning'), 650);
      }

      // Mezclar array del pool actual con Fisher-Yates
      const pool = [...this.currentPool];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      this.currentPool = pool;

      // Reconstruir slots
      this.items = this.buildItems(this.currentPool, this.segments);
      this.renderSphereItems();

      // Disparar impulso de giro
      const spinDirection = Math.random() > 0.5 ? 1 : -1;
      this.startInertia(spinDirection * 1.1, (Math.random() - 0.5) * 0.2);
    }

    // Controles de zoom
    zoomIn() {
      this.fit = Math.min(1.25, Math.round((this.fit + 0.08) * 100) / 100);
      this.updateLayout();
      this.updateZoomLabel();
    }

    zoomOut() {
      this.fit = Math.max(0.42, Math.round((this.fit - 0.08) * 100) / 100);
      this.updateLayout();
      this.updateZoomLabel();
    }

    recenter() {
      this.stopInertia();
      if (this.recenterRAF) cancelAnimationFrame(this.recenterRAF);

      const startX = this.rotation.x;
      const startY = this.rotation.y;
      const startFit = this.fit;
      const targetFit = this.initialFit;
      const startTime = performance.now();
      const duration = 650;

      const easeOutCubic = t => (--t) * t * t + 1;

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = easeOutCubic(progress);

        this.rotation.x = startX * (1 - ease);
        this.rotation.y = startY * (1 - ease);
        this.fit = startFit + (targetFit - startFit) * ease;

        this.updateLayout();
        this.applyTransform(this.rotation.x, this.rotation.y);
        this.updateZoomLabel();

        if (progress < 1) {
          this.recenterRAF = requestAnimationFrame(animate);
        } else {
          this.recenterRAF = null;
        }
      };

      this.recenterRAF = requestAnimationFrame(animate);
    }

    updateZoomLabel() {
      const label = document.getElementById('hud-zoom');
      if (label) {
        const pct = Math.round((this.fit / this.initialFit) * 100);
        label.textContent = `${pct}%`;
      }
    }

    // Inicializar controles de UI (HUD, Botones, Menú)
    initUIControls() {
      // Modos
      const modeBtns = document.querySelectorAll('.hud__mode-btn');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const mode = btn.dataset.mode;
          if (mode) this.setMode(mode);
        });
      });

      // Botón Shuffle
      const shuffleBtn = document.getElementById('btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.shuffle();
        });
      }

      // Zoom
      const zoomInBtn = document.getElementById('btn-zoom-in');
      const zoomOutBtn = document.getElementById('btn-zoom-out');
      const recenterBtn = document.getElementById('btn-recenter');

      if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
      if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
      if (recenterBtn) recenterBtn.addEventListener('click', () => this.recenter());

      // Menú overlay mobile
      const menuToggle = document.getElementById('menu-toggle');
      const menuOverlay = document.getElementById('menu-overlay');
      const menuClose = menuOverlay?.querySelector('.menu-overlay__close');

      if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
          menuOverlay.classList.add('is-open');
        });
      }
      if (menuClose && menuOverlay) {
        menuClose.addEventListener('click', () => {
          menuOverlay.classList.remove('is-open');
        });
      }

      // Puntero personalizado (Monopo style)
      this.initCustomCursor();
    }

    // Idioma
    initLanguage() {
      const langBtns = document.querySelectorAll('.lang-btn');
      langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = btn.dataset.lang;
          if (lang) this.setLanguage(lang);
        });
      });

      this.setLanguage(this.currentLang);
    }

    setLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem('mad_lang', lang);

      // Actualizar botones de idioma
      const langBtns = document.querySelectorAll('.lang-btn');
      langBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.lang === lang);
      });

      const t = TRANSLATIONS[lang] || TRANSLATIONS.es;

      // Status text
      const statusText = document.getElementById('hud-status-text');
      if (statusText) statusText.textContent = t.status;

      // Recenter button
      const recenterBtn = document.getElementById('btn-recenter');
      if (recenterBtn) recenterBtn.textContent = t.recenter;

      // Botones de modo
      const modeBtns = document.querySelectorAll('.hud__mode-btn');
      modeBtns.forEach(btn => {
        const mode = btn.dataset.mode;
        if (mode && t[mode]) btn.textContent = t[mode];
      });

      // Menú overlay y navegación
      const translatableNav = document.querySelectorAll('[data-es][data-en]');
      translatableNav.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) el.textContent = text;
      });
    }

    // Puntero personalizado Dot
    initCustomCursor() {
      const cursor = document.getElementById('cursor-dot');
      if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

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

      window.addEventListener('mouseout', () => {
        cursor.classList.remove('is-active');
      });

      const loop = () => {
        currX += (mouseX - currX) * 0.45;
        currY += (mouseY - currY) * 0.45;
        cursor.style.left = `${currX}px`;
        cursor.style.top = `${currY}px`;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      // Hover sobre elementos clickeables
      const updateHoverState = (e) => {
        const target = e.target;
        if (!target) return;
        const isClickable = target.closest('a, button, .item__image, [role="button"]');
        cursor.classList.toggle('is-hovering', !!isClickable);
      };

      window.addEventListener('mouseover', updateHoverState, { passive: true });
    }
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  function startGalleryApp() {
    // 1. Iniciar Silk Background Shader
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

    // 2. Iniciar DomeGallery con props exactas de usuario
    window.galleryInstance = new VanillaDomeGallery({
      fit: 0.7,
      minRadius: 450,
      segments: 30,
      dragDampening: 0.8,
      grayscale: false,
      maxVerticalRotationDeg: 5,
      dragSensitivity: 20,
      enlargeTransitionMs: 320
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGalleryApp);
  } else {
    startGalleryApp();
  }
})();
