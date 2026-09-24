/**
 * MAD VIZ — Infinite Spatial Canvas Engine
 * Experimental 2D unbounded spatial gallery inspired by early Are.na
 * Completely isolated from the rest of the website
 */

(function () {
  'use strict';

  // ============================================================
  // PLACEHOLDER GENERATOR (High-End Architectural Visuals via SVG)
  // Generates bespoke, crisp, architectural studies without external network requests
  // ============================================================
  function createArchSvg(type, title, w, h, seed) {
    const s = seed || 1;
    let content = '';

    if (type === 'monolith') {
      content = `
        <defs>
          <linearGradient id="g_${s}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2a2a2a"/>
            <stop offset="50%" stop-color="#181818"/>
            <stop offset="100%" stop-color="#0a0a0a"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#g_${s})"/>
        <!-- Brutalist Massing Volume -->
        <polygon points="${w * 0.15},${h * 0.85} ${w * 0.15},${h * 0.28} ${w * 0.58},${h * 0.15} ${w * 0.58},${h * 0.72}" fill="#2e2e2e" stroke="#444" stroke-width="0.8"/>
        <polygon points="${w * 0.58},${h * 0.15} ${w * 0.85},${h * 0.26} ${w * 0.85},${h * 0.83} ${w * 0.58},${h * 0.72}" fill="#161616" stroke="#444" stroke-width="0.8"/>
        <!-- Sombra proyectada -->
        <polygon points="${w * 0.15},${h * 0.85} ${w * 0.58},${h * 0.72} ${w * 0.85},${h * 0.83} ${w * 0.95},${h * 0.94} ${w * 0.3},${h * 0.96}" fill="#080808" opacity="0.8"/>
        <!-- Líneas guía de perspectiva y modulación -->
        <line x1="${w * 0.15}" y1="${h * 0.45}" x2="${w * 0.58}" y2="${h * 0.32}" stroke="#ffffff" stroke-opacity="0.18" stroke-dasharray="3 3"/>
        <line x1="${w * 0.15}" y1="${h * 0.62}" x2="${w * 0.58}" y2="${h * 0.49}" stroke="#ffffff" stroke-opacity="0.18" stroke-dasharray="3 3"/>
        <line x1="${w * 0.36}" y1="${h * 0.21}" x2="${w * 0.36}" y2="${h * 0.78}" stroke="#ffffff" stroke-opacity="0.2"/>
        <circle cx="${w * 0.58}" cy="${h * 0.15}" r="2.5" fill="#fff" opacity="0.6"/>
      `;
    } else if (type === 'light') {
      content = `
        <defs>
          <linearGradient id="sky_${s}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1f1b18"/>
            <stop offset="60%" stop-color="#141416"/>
            <stop offset="100%" stop-color="#0a0a0c"/>
          </linearGradient>
          <linearGradient id="beam_${s}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#d4b483" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#d4b483" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#sky_${s})"/>
        <!-- Haz de luz arquitectónico cenital -->
        <polygon points="${w * 0.35},0 ${w * 0.52},0 ${w * 0.92},${h} ${w * 0.2},${h}" fill="url(#beam_${s})"/>
        <!-- Muro de corte en silueta -->
        <rect x="0" y="${h * 0.35}" width="${w * 0.32}" height="${h * 0.65}" fill="#0d0d0f"/>
        <line x1="${w * 0.32}" y1="${h * 0.35}" x2="${w * 0.32}" y2="${h}" stroke="#ffffff" stroke-opacity="0.25"/>
        <circle cx="${w * 0.435}" cy="${h * 0.18}" r="1" fill="#fff" opacity="0.8"/>
      `;
    } else if (type === 'tectonic') {
      content = `
        <defs>
          <pattern id="pat_${s}" width="18" height="18" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="18" y2="18" stroke="#333" stroke-width="0.7"/>
            <line x1="18" y1="0" x2="0" y2="18" stroke="#222" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="${w}" height="${h}" fill="#111111"/>
        <rect width="${w}" height="${h}" fill="url(#pat_${s})" opacity="0.6"/>
        <!-- Costillas estructurales de hormigón -->
        ${Array.from({ length: 6 }, (_, i) => {
          const x = (w / 7) * (i + 1);
          return `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#2a2a2a" stroke-width="4"/><line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#ffffff" stroke-opacity="0.15" stroke-width="0.8"/>`;
        }).join('')}
        <rect x="${w * 0.15}" y="${h * 0.2}" width="${w * 0.7}" height="${h * 0.6}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="0.7"/>
      `;
    } else if (type === 'horizon') {
      content = `
        <defs>
          <linearGradient id="hz_${s}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#141414"/>
            <stop offset="48%" stop-color="#1c1c1c"/>
            <stop offset="50%" stop-color="#2c2c2c"/>
            <stop offset="100%" stop-color="#0c0c0c"/>
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#hz_${s})"/>
        <!-- Línea de horizonte infinita -->
        <line x1="0" y1="${h * 0.5}" x2="${w}" y2="${h * 0.5}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="0.8"/>
        <!-- Plataforma suspendida en perspectiva lejana -->
        <polygon points="${w * 0.22},${h * 0.5} ${w * 0.78},${h * 0.5} ${w * 0.85},${h * 0.58} ${w * 0.15},${h * 0.58}" fill="#242424" stroke="#444" stroke-width="0.6"/>
        <line x1="${w * 0.15}" y1="${h * 0.58}" x2="${w * 0.15}" y2="${h * 0.78}" stroke="#333" stroke-width="1.2"/>
        <line x1="${w * 0.85}" y1="${h * 0.58}" x2="${w * 0.85}" y2="${h * 0.78}" stroke="#333" stroke-width="1.2"/>
      `;
    } else { // experiment / wireframe
      content = `
        <rect width="${w}" height="${h}" fill="#0e0e0e"/>
        <!-- Proyección isométrica alambre -->
        <g stroke="#ffffff" stroke-opacity="0.22" stroke-width="0.9" fill="none">
          <ellipse cx="${w * 0.5}" cy="${h * 0.5}" rx="${w * 0.35}" ry="${h * 0.22}"/>
          <ellipse cx="${w * 0.5}" cy="${h * 0.38}" rx="${w * 0.35}" ry="${h * 0.22}"/>
          <line x1="${w * 0.15}" y1="${h * 0.5}" x2="${w * 0.15}" y2="${h * 0.38}"/>
          <line x1="${w * 0.85}" y1="${h * 0.5}" x2="${w * 0.85}" y2="${h * 0.38}"/>
          <line x1="${w * 0.5}" y1="${h * 0.16}" x2="${w * 0.5}" y2="${h * 0.84}" stroke-dasharray="2 2"/>
        </g>
        <circle cx="${w * 0.5}" cy="${h * 0.5}" r="3" fill="#ffffff" opacity="0.6"/>
      `;
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      ${content}
      <!-- Tipografía y sello de coordenada en esquina -->
      <text x="14" y="${h - 14}" fill="#ffffff" fill-opacity="0.3" font-family="monospace" font-size="9" letter-spacing="1.5">${title.toUpperCase()} // ${w}×${h}</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }

  // ============================================================
  // SPATIAL CLUSTERS & ITEMS DEFINITION
  // Freeform layout, organized chaos, large negative spaces, intentional overlaps
  // ============================================================
  const CLUSTERS_DATA = [
    {
      id: 'cluster-1',
      title: '01 · MONOLITH // MASSING & VOID',
      labelPos: { x: -320, y: -380 },
      items: [
        { id: 'm1', title: 'Tower Massing Study', type: 'monolith', x: -300, y: -280, w: 420, h: 580, z: 2 },
        { id: 'm2', title: 'Cantilevered Slab Study', type: 'monolith', x: 20, y: -160, w: 560, h: 360, z: 4 }, // Solapa a m1
        { id: 'm3', title: 'Deep Axial Corridor', type: 'light', x: 480, y: 60, w: 360, h: 480, z: 3 },
        { id: 'm4', title: 'Ground Podium Void', type: 'monolith', x: -400, y: 220, w: 480, h: 280, z: 1 },
        { id: 'm5', title: 'Central Compression Cube', type: 'tectonic', x: -90, y: 110, w: 320, h: 320, z: 5 }, // Solapa m2 y m4
        { id: 'm6', title: 'Slit Light Aperture', type: 'light', x: 260, y: -360, w: 280, h: 440, z: 1 },
        { id: 'm7', title: 'Sub-grade Plinth Plan', type: 'monolith', x: -140, y: 460, w: 680, h: 240, z: 2 }
      ]
    },
    {
      id: 'cluster-2',
      title: '02 · LIGHT & SHADOW // ATMOSPHERE',
      labelPos: { x: 1400, y: -1100 },
      items: [
        { id: 'l1', title: 'Zenithal Beam Study', type: 'light', x: 1420, y: -1000, w: 520, h: 380, z: 2 },
        { id: 'l2', title: 'Dusk Façade Reflection', type: 'light', x: 1840, y: -880, w: 400, h: 540, z: 3 }, // Solapa a l1
        { id: 'l3', title: 'Atrium High Light', type: 'monolith', x: 1300, y: -680, w: 360, h: 460, z: 1 },
        { id: 'l4', title: 'Threshold Chiaroscuro', type: 'light', x: 1580, y: -560, w: 580, h: 320, z: 4 },
        { id: 'l5', title: 'Specular Glaze Detail', type: 'tectonic', x: 2100, y: -640, w: 320, h: 320, z: 2 },
        { id: 'l6', title: 'Nocturne Massing', type: 'light', x: 1720, y: -300, w: 480, h: 340, z: 3 }
      ]
    },
    {
      id: 'cluster-3',
      title: '03 · TECTONICS // RAW MATERIALS',
      labelPos: { x: -2000, y: 800 },
      items: [
        { id: 't1', title: 'Board-formed Concrete', type: 'tectonic', x: -1980, y: 900, w: 380, h: 500, z: 2 },
        { id: 't2', title: 'Mullion Extrusion 1:1', type: 'tectonic', x: -1680, y: 820, w: 540, h: 340, z: 3 }, // Solapa a t1
        { id: 't3', title: 'Structural Ribs Section', type: 'tectonic', x: -2120, y: 1320, w: 460, h: 300, z: 1 },
        { id: 't4', title: 'Tension Cable Joint', type: 'experiment', x: -1760, y: 1100, w: 340, h: 420, z: 4 },
        { id: 't5', title: 'Rough Stone Relief', type: 'tectonic', x: -1480, y: 1040, w: 440, h: 560, z: 2 },
        { id: 't6', title: 'Acoustic Slat System', type: 'monolith', x: -1920, y: 1540, w: 620, h: 260, z: 3 }
      ]
    },
    {
      id: 'cluster-4',
      title: '04 · HORIZON // ARCHITECTURAL SCALE',
      labelPos: { x: 1900, y: 1100 },
      items: [
        { id: 'h1', title: 'Desert Plateau Pavilion', type: 'horizon', x: 1920, y: 1200, w: 820, h: 360, z: 2 },
        { id: 'h2', title: 'Coastal Escarpment Section', type: 'horizon', x: 2620, y: 1120, w: 420, h: 560, z: 3 }, // Solapa a h1
        { id: 'h3', title: 'Endless Linear Pier', type: 'horizon', x: 1780, y: 1480, w: 760, h: 320, z: 1 },
        { id: 'h4', title: 'Sunken Courtyard Horizon', type: 'monolith', x: 2420, y: 1560, w: 520, h: 380, z: 4 },
        { id: 'h5', title: 'Distant Monolith Profile', type: 'horizon', x: 2100, y: 1780, w: 680, h: 280, z: 2 }
      ]
    },
    {
      id: 'cluster-5',
      title: '05 · PROTOTYPES // UNTITLED EXPERIMENTS',
      labelPos: { x: -1900, y: -1500 },
      items: [
        { id: 'e1', title: 'Parametric Shell Mesh', type: 'experiment', x: -1880, y: -1400, w: 460, h: 420, z: 2, rot: -2 },
        { id: 'e2', title: 'Kinetic Facade Node', type: 'experiment', x: -1520, y: -1480, w: 380, h: 480, z: 3, rot: 1.5 },
        { id: 'e3', title: 'Shadow Diagram [08:00]', type: 'light', x: -1980, y: -1080, w: 560, h: 320, z: 1, rot: 0.8 },
        { id: 'e4', title: 'Folded Plate Geometry', type: 'experiment', x: -1500, y: -1120, w: 480, h: 380, z: 4, rot: -1.2 },
        { id: 'e5', title: 'Atmospheric Fog Chamber', type: 'light', x: -1720, y: -820, w: 520, h: 340, z: 2, rot: 0 }
      ]
    }
  ];

  // ============================================================
  // CAMERA ENGINE (Math, Inertia, Pan, Zoom, Touch)
  // ============================================================
  class SpatialCanvas {
    constructor() {
      this.viewport = document.getElementById('canvas-viewport');
      this.world = document.getElementById('canvas-world');
      this.coordsDisplay = document.getElementById('hud-coords');
      this.zoomDisplay = document.getElementById('hud-zoom');
      this.minimapCanvas = document.getElementById('minimap-canvas');

      // Camera State
      this.targetX = window.innerWidth / 2;
      this.targetY = window.innerHeight / 2;
      this.targetScale = 0.9;

      this.currentX = this.targetX;
      this.currentY = this.targetY;
      this.currentScale = this.targetScale;

      this.minScale = 0.16;
      this.maxScale = 2.4;
      this.lerpFactor = 0.14; // Suavidad de inercia

      // Drag State
      this.isDragging = false;
      this.isSpaceDown = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.cameraStartX = 0;
      this.cameraStartY = 0;
      this.lastPointerX = 0;
      this.lastPointerY = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.friction = 0.91;

      // Touch State (Pinch-to-zoom)
      this.touchDistance = 0;
      this.touchMidX = 0;
      this.touchMidY = 0;

      this.initWorld();
      this.initEvents();
      this.initMinimap();
      this.startLoop();
    }

    // Inicializar elementos en el mundo virtual
    initWorld() {
      let seedCounter = 1;

      CLUSTERS_DATA.forEach(cluster => {
        // Título del cluster
        const label = document.createElement('div');
        label.className = 'cluster-label';
        label.textContent = cluster.title;
        label.style.left = `${cluster.labelPos.x}px`;
        label.style.top = `${cluster.labelPos.y}px`;
        this.world.appendChild(label);

        // Ítems del cluster
        cluster.items.forEach(item => {
          const el = document.createElement('div');
          el.className = 'canvas-item';
          el.id = item.id;
          el.style.left = `${item.x}px`;
          el.style.top = `${item.y}px`;
          el.style.width = `${item.w}px`;
          el.style.height = `${item.h}px`;
          el.style.zIndex = item.z || 1;

          if (item.rot) {
            el.style.transform = `rotate(${item.rot}deg)`;
          }

          const wrap = document.createElement('div');
          wrap.className = 'canvas-item__image-wrap';

          const img = document.createElement('img');
          img.className = 'canvas-item__img';
          img.alt = item.title;
          img.loading = 'lazy';
          img.src = createArchSvg(item.type, item.title, item.w, item.h, seedCounter++);

          wrap.appendChild(img);
          el.appendChild(wrap);

          // Metadatos inferiores
          const meta = document.createElement('div');
          meta.className = 'canvas-item__meta';

          const titleSpan = document.createElement('span');
          titleSpan.className = 'canvas-item__meta-title';
          titleSpan.textContent = item.title;

          const dimsSpan = document.createElement('span');
          dimsSpan.className = 'canvas-item__meta-dims';
          dimsSpan.textContent = `[${item.w} × ${item.h}]`;

          meta.appendChild(titleSpan);
          meta.appendChild(dimsSpan);
          el.appendChild(meta);

          // Al hacer clic en un elemento, centrar suavemente en él con zoom óptimo
          el.addEventListener('click', (e) => {
            // Si hubo arrastre significativo, no considerar clic
            if (Math.hypot(this.currentX - this.targetX, this.currentY - this.targetY) > 15) return;
            this.focusItem(item);
          });

          this.world.appendChild(el);
        });
      });
    }

    // Centrar la vista en un ítem específico
    focusItem(item) {
      const centerX = item.x + item.w / 2;
      const centerY = item.y + item.h / 2;
      const desiredScale = Math.min(1.2, Math.max(0.7, (window.innerWidth * 0.45) / item.w));

      this.targetScale = desiredScale;
      this.targetX = window.innerWidth / 2 - centerX * desiredScale;
      this.targetY = window.innerHeight / 2 - centerY * desiredScale;
    }

    // Zoom focal centrado exactamente en el cursor (focal zoom)
    zoomAt(clientX, clientY, factor) {
      const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.targetScale * factor));
      if (newScale === this.targetScale) return;

      // Coordenadas mundiales actuales bajo el puntero
      const worldX = (clientX - this.targetX) / this.targetScale;
      const worldY = (clientY - this.targetY) / this.targetScale;

      this.targetScale = newScale;
      this.targetX = clientX - worldX * newScale;
      this.targetY = clientY - worldY * newScale;
    }

    // Zoom centrado en el centro de la pantalla (para botones HUD)
    zoomCenter(factor) {
      this.zoomAt(window.innerWidth / 2, window.innerHeight / 2, factor);
    }

    // Recentrar al origen (Cluster 1)
    recenter() {
      this.targetScale = 0.95;
      this.targetX = window.innerWidth / 2;
      this.targetY = window.innerHeight / 2;
      this.velocityX = 0;
      this.velocityY = 0;
    }

    // Eventos de entrada
    initEvents() {
      // 1. Mouse Wheel Zoom (Focal)
      window.addEventListener('wheel', (e) => {
        e.preventDefault();
        // Zoom suave continuo con rueda o trackpad
        const factor = e.deltaY < 0 ? 1.14 : 0.88;
        this.zoomAt(e.clientX, e.clientY, factor);
      }, { passive: false });

      // 2. Mouse Drag Pan
      window.addEventListener('mousedown', (e) => {
        // Ignorar clics dentro del HUD
        if (e.target.closest('.hud__controls') || e.target.closest('.hud__back-btn') || e.target.closest('.hud__minimap')) {
          return;
        }

        this.isDragging = true;
        this.viewport.classList.add('is-dragging');
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.cameraStartX = this.targetX;
        this.cameraStartY = this.targetY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.velocityX = 0;
        this.velocityY = 0;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;

        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        this.targetX = this.cameraStartX + dx;
        this.targetY = this.cameraStartY + dy;

        // Calcular velocidad instantánea para inercia al soltar
        this.velocityX = e.clientX - this.lastPointerX;
        this.velocityY = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
      });

      window.addEventListener('mouseup', () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.viewport.classList.remove('is-dragging');
      });

      // 3. Touch support (1 finger drag, 2 fingers pinch-to-zoom)
      window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hud')) return;

        if (e.touches.length === 1) {
          this.isDragging = true;
          this.dragStartX = e.touches[0].clientX;
          this.dragStartY = e.touches[0].clientY;
          this.cameraStartX = this.targetX;
          this.cameraStartY = this.targetY;
          this.lastPointerX = e.touches[0].clientX;
          this.lastPointerY = e.touches[0].clientY;
          this.velocityX = 0;
          this.velocityY = 0;
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.touchDistance = Math.hypot(dx, dy);
          this.touchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          this.touchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          const dx = e.touches[0].clientX - this.dragStartX;
          const dy = e.touches[0].clientY - this.dragStartY;

          this.targetX = this.cameraStartX + dx;
          this.targetY = this.cameraStartY + dy;

          this.velocityX = e.touches[0].clientX - this.lastPointerX;
          this.velocityY = e.touches[0].clientY - this.lastPointerY;
          this.lastPointerX = e.touches[0].clientX;
          this.lastPointerY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDist = Math.hypot(dx, dy);

          if (this.touchDistance > 0) {
            const factor = currentDist / this.touchDistance;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this.zoomAt(midX, midY, factor);
          }
          this.touchDistance = currentDist;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
        this.touchDistance = 0;
      });

      // 4. Keyboard Navigation (WASD, Arrows, Space, +, -, 0)
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          this.isSpaceDown = true;
          this.viewport.style.cursor = 'grab';
        } else if (e.key === '+' || e.key === '=') {
          this.zoomCenter(1.2);
        } else if (e.key === '-' || e.key === '_') {
          this.zoomCenter(0.83);
        } else if (e.key === '0') {
          this.recenter();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          this.targetX -= 120;
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          this.targetX += 120;
        } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          this.targetY += 120;
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          this.targetY -= 120;
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          this.isSpaceDown = false;
          this.viewport.style.cursor = '';
        }
      });

      // 5. HUD Controls
      const btnZoomIn = document.getElementById('btn-zoom-in');
      const btnZoomOut = document.getElementById('btn-zoom-out');
      const btnRecenter = document.getElementById('btn-recenter');

      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.zoomCenter(1.25));
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.zoomCenter(0.8));
      if (btnRecenter) btnRecenter.addEventListener('click', () => this.recenter());

      // 6. Resize handling
      window.addEventListener('resize', () => {
        if (this.minimapCanvas) this.initMinimap();
      });
    }

    // Inicializar Canvas del Minimapa
    initMinimap() {
      if (!this.minimapCanvas) return;
      this.minimapCtx = this.minimapCanvas.getContext('2d');
      this.minimapCanvas.width = 120 * window.devicePixelRatio;
      this.minimapCanvas.height = 90 * window.devicePixelRatio;
    }

    // Dibujar Minimapa en tiempo real
    drawMinimap() {
      if (!this.minimapCtx) return;
      const ctx = this.minimapCtx;
      const dpr = window.devicePixelRatio || 1;
      const w = this.minimapCanvas.width;
      const h = this.minimapCanvas.height;

      ctx.clearRect(0, 0, w, h);

      // Espacio virtual visible en minimapa: [-2800, +2800] x [-2100, +2100]
      const rangeX = 5600;
      const rangeY = 4200;
      const mapX = (x) => ((x + 2800) / rangeX) * w;
      const mapY = (y) => ((y + 2100) / rangeY) * h;

      // Dibujar bloques de clusters
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      CLUSTERS_DATA.forEach(c => {
        c.items.forEach(it => {
          const ix = mapX(it.x);
          const iy = mapY(it.y);
          const iw = Math.max(1.5, (it.w / rangeX) * w);
          const ih = Math.max(1.5, (it.h / rangeY) * h);
          ctx.fillRect(ix, iy, iw, ih);
        });
      });

      // Dibujar rectángulo del viewport de la cámara
      const vpLeft = (-this.currentX) / this.currentScale;
      const vpTop = (-this.currentY) / this.currentScale;
      const vpWidth = window.innerWidth / this.currentScale;
      const vpHeight = window.innerHeight / this.currentScale;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1 * dpr;
      ctx.strokeRect(mapX(vpLeft), mapY(vpTop), (vpWidth / rangeX) * w, (vpHeight / rangeY) * h);
    }

    // Loop de renderizado continuo (Physics Lerp & Transform)
    startLoop() {
      const tick = () => {
        // Inercia al soltar el drag
        if (!this.isDragging && (Math.abs(this.velocityX) > 0.05 || Math.abs(this.velocityY) > 0.05)) {
          this.targetX += this.velocityX;
          this.targetY += this.velocityY;
          this.velocityX *= this.friction;
          this.velocityY *= this.friction;
        }

        // Amortiguación continua (Lerp damping)
        this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
        this.currentY += (this.targetY - this.currentY) * this.lerpFactor;
        this.currentScale += (this.targetScale - this.currentScale) * this.lerpFactor;

        // Aplicar transformación con aceleración por hardware (translate3d + scale)
        this.world.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0) scale(${this.currentScale.toFixed(4)})`;

        // Actualizar HUD
        if (this.zoomDisplay) {
          this.zoomDisplay.textContent = `${Math.round(this.currentScale * 100)}%`;
        }
        if (this.coordsDisplay) {
          const worldCenterX = Math.round((-this.currentX + window.innerWidth / 2) / this.currentScale);
          const worldCenterY = Math.round((-this.currentY + window.innerHeight / 2) / this.currentScale);
          this.coordsDisplay.textContent = `X: ${worldCenterX} · Y: ${worldCenterY}`;
        }

        // Actualizar Minimapa
        this.drawMinimap();

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SpatialCanvas());
  } else {
    new SpatialCanvas();
  }
})();
