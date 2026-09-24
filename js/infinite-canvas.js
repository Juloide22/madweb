/**
 * MAD VIZ — Screen-Fitted Spatial Canvas Engine
 * 3 Organization Modes: Por Proyecto, Aleatorio, Interiores / Exteriores
 * Screen-Fitted (PC & Mobile) · No text under images · Clean expand icon · Titles on zoom
 * 100% isolated from the rest of the website
 */

(function () {
  'use strict';

  // ============================================================
  // CATÁLOGO DE IMÁGENES Y PROYECTOS (20 Renders Reales)
  // ============================================================
  const IMAGES_DATA = [
    // 01. CASA FLEXA (0..3)
    { id: 'img-0', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', tag: 'Arquitectura Residencial', folder: '01-casa-flexa', file: 'render-01.jpg', title: 'Perspectiva Hero', isInterior: false },
    { id: 'img-1', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', tag: 'Arquitectura Residencial', folder: '01-casa-flexa', file: 'render-02.jpeg', title: 'Fachada y Acceso', isInterior: false },
    { id: 'img-2', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', tag: 'Arquitectura Residencial', folder: '01-casa-flexa', file: 'render-03.jpeg', title: 'Detalle Vegetación', isInterior: false },
    { id: 'img-3', projId: 'casa-flexa', projNum: '01', projTitle: 'Casa Flexa', tag: 'Arquitectura Residencial', folder: '01-casa-flexa', file: 'render-04.jpeg', title: 'Expansión Piscina', isInterior: false },

    // 02. EDIFICIO AURA I (4..7)
    { id: 'img-4', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', tag: 'Vivienda Colectiva', folder: '02-edificio-aura-i', file: 'render-05.png', title: 'Contra-picado', isInterior: false },
    { id: 'img-5', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', tag: 'Vivienda Colectiva', folder: '02-edificio-aura-i', file: 'render-06.png', title: 'Remate y Cielo', isInterior: false },
    { id: 'img-6', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', tag: 'Vivienda Colectiva', folder: '02-edificio-aura-i', file: 'render-07.png', title: 'Textura Hormigón', isInterior: false },
    { id: 'img-7', projId: 'edificio-aura-i', projNum: '02', projTitle: 'Edificio Aura I', tag: 'Vivienda Colectiva', folder: '02-edificio-aura-i', file: 'render-08.png', title: 'Living y Cocina', isInterior: true },

    // 03. EDIFICIO VERONA (8..11)
    { id: 'img-8', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', tag: 'Desarrollo Urbano', folder: '03-edificio-verona', file: 'render-09.jpeg', title: 'Exterior Atardecer', isInterior: false },
    { id: 'img-9', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', tag: 'Desarrollo Urbano', folder: '03-edificio-verona', file: 'render-10.jpeg', title: 'Contexto y Esquina', isInterior: false },
    { id: 'img-10', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', tag: 'Desarrollo Urbano', folder: '03-edificio-verona', file: 'render-11.jpg', title: 'Comedor y Jardín', isInterior: true },
    { id: 'img-11', projId: 'edificio-verona', projNum: '03', projTitle: 'Edificio Verona', tag: 'Desarrollo Urbano', folder: '03-edificio-verona', file: 'render-12.jpeg', title: 'Dormitorio Principal', isInterior: true },

    // 04. VIVIENDAS CHIUSO (12..15)
    { id: 'img-12', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', tag: 'Complejo Residencial', folder: '04-viviendas-chiuso', file: 'render-13.jpeg', title: 'Acceso y Cochera', isInterior: false },
    { id: 'img-13', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', tag: 'Complejo Residencial', folder: '04-viviendas-chiuso', file: 'render-14.jpeg', title: 'Cocina y Barra', isInterior: true },
    { id: 'img-14', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', tag: 'Complejo Residencial', folder: '04-viviendas-chiuso', file: 'render-15.jpeg', title: 'Living y Comedor', isInterior: true },
    { id: 'img-15', projId: 'viviendas-chiuso', projNum: '04', projTitle: 'Viviendas Chiuso', tag: 'Complejo Residencial', folder: '04-viviendas-chiuso', file: 'render-16.jpeg', title: 'Dormitorio Suite', isInterior: true },

    // 05. EDIFICIO ANKARA II (16..19)
    { id: 'img-16', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', tag: 'Arquitectura en Altura', folder: '05-edificio-ankara%20ii', file: 'render-17.jpg', title: 'Volumen Principal', isInterior: false },
    { id: 'img-17', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', tag: 'Arquitectura en Altura', folder: '05-edificio-ankara%20ii', file: 'render-18.jpg', title: 'Living Vista Mar', isInterior: true },
    { id: 'img-18', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', tag: 'Arquitectura en Altura', folder: '05-edificio-ankara%20ii', file: 'render-19.jpg', title: 'Comedor Vista Mar', isInterior: true },
    { id: 'img-19', projId: 'edificio-ankara-ii', projNum: '05', projTitle: 'Edificio Ankara II', tag: 'Arquitectura en Altura', folder: '05-edificio-ankara%20ii', file: 'render-20.jpg', title: 'Comedor y Madera', isInterior: true }
  ];

  // ============================================================
  // COORDENADAS PARA CADA UNO DE LOS 3 MODOS
  // ============================================================
  const LAYOUTS = {
    // MODO 1: GALERIA (Distribución continua y orgánica de los 20 renders - DEFAULT)
    gallery: {
      bounds: { minX: 0, maxX: 1140, minY: 0, maxY: 700 },
      markers: [],
      coords: [
        { x: 25,  y: 20,  w: 220, h: 160, z: 2 },
        { x: 65,  y: 170, w: 175, h: 230, z: 5 },
        { x: 15,  y: 380, w: 195, h: 160, z: 3 },
        { x: 145, y: 500, w: 235, h: 160, z: 2 },
        { x: 865, y: 235, w: 185, h: 225, z: 4 },
        { x: 380, y: 20,  w: 175, h: 215, z: 3 },
        { x: 470, y: 300, w: 185, h: 205, z: 3 },
        { x: 390, y: 205, w: 185, h: 160, z: 4 },
        { x: 210, y: 10,  w: 195, h: 150, z: 4 },
        { x: 690, y: 155, w: 205, h: 160, z: 2 },
        { x: 910, y: 20,  w: 140, h: 230, z: 3 },
        { x: 620, y: 300, w: 215, h: 150, z: 4 },
        { x: 705, y: 15,  w: 225, h: 165, z: 4 },
        { x: 540, y: 140, w: 185, h: 180, z: 5 },
        { x: 315, y: 345, w: 185, h: 195, z: 5 },
        { x: 510, y: 480, w: 230, h: 160, z: 3 },
        { x: 520, y: 0,   w: 210, h: 160, z: 2 },
        { x: 210, y: 135, w: 215, h: 160, z: 3 },
        { x: 180, y: 275, w: 175, h: 215, z: 4 },
        { x: 810, y: 430, w: 205, h: 200, z: 5 }
      ]
    },

    // MODO 2: PROYECTOS (Agrupados en clusters compactos por proyecto)
    projects: {
      bounds: { minX: 0, maxX: 1160, minY: 0, maxY: 710 },
      markers: [
        { id: 'm-casa-flexa', text: '01 · Casa Flexa', tag: 'Arquitectura Residencial', x: 20, y: 0, projId: 'casa-flexa' },
        { id: 'm-edificio-aura', text: '02 · Edificio Aura I', tag: 'Vivienda Colectiva', x: 410, y: 0, projId: 'edificio-aura-i' },
        { id: 'm-edificio-verona', text: '03 · Edificio Verona', tag: 'Desarrollo Urbano', x: 790, y: 10, projId: 'edificio-verona' },
        { id: 'm-viviendas-chiuso', text: '04 · Viviendas Chiuso', tag: 'Complejo Residencial', x: 130, y: 350, projId: 'viviendas-chiuso' },
        { id: 'm-edificio-ankara', text: '05 · Edificio Ankara II', tag: 'Arquitectura en Altura', x: 610, y: 350, projId: 'edificio-ankara-ii' }
      ],
      coords: [
        // Casa Flexa (0..3)
        { x: 0,   y: 25,  w: 210, h: 155, z: 2 },
        { x: 160, y: 0,   w: 150, h: 210, z: 4 },
        { x: 260, y: 100, w: 140, h: 170, z: 3 },
        { x: 65,  y: 155, w: 230, h: 145, z: 5 },
        // Edificio Aura I (4..7)
        { x: 550, y: 10,  w: 165, h: 210, z: 3 },
        { x: 400, y: 15,  w: 175, h: 160, z: 2 },
        { x: 490, y: 115, w: 160, h: 175, z: 5 },
        { x: 620, y: 125, w: 160, h: 160, z: 4 },
        // Edificio Verona (8..11)
        { x: 790,  y: 15,  w: 205, h: 160, z: 2 },
        { x: 950,  y: 30,  w: 160, h: 175, z: 4 },
        { x: 1060, y: 15,  w: 120, h: 210, z: 3 },
        { x: 860,  y: 150, w: 215, h: 150, z: 5 },
        // Viviendas Chiuso (12..15)
        { x: 290, y: 375, w: 205, h: 150, z: 3 },
        { x: 130, y: 375, w: 175, h: 165, z: 2 },
        { x: 220, y: 475, w: 150, h: 175, z: 5 },
        { x: 335, y: 500, w: 180, h: 145, z: 4 },
        // Edificio Ankara II (16..19)
        { x: 605, y: 375, w: 165, h: 210, z: 3 },
        { x: 745, y: 375, w: 175, h: 145, z: 2 },
        { x: 835, y: 465, w: 145, h: 185, z: 4 },
        { x: 665, y: 515, w: 215, h: 145, z: 5 }
      ]
    },

    // MODO 3: EXTERIORES (11 Renders de arquitectura exterior, fachadas y terrazas)
    exteriors: {
      bounds: { minX: 0, maxX: 1160, minY: 0, maxY: 720 },
      markers: [
        { id: 'cat-ext', text: 'Exteriores // Fachadas, Terrazas & Entorno (11 Renders)', tag: '11 Renders', x: 20, y: 0, isCategory: true, modeId: 'exteriors' }
      ],
      coords: [
        // 0..3 Casa Flexa (4 exteriores)
        { x: 20,  y: 40,  w: 230, h: 165, z: 2 },
        { x: 200, y: 25,  w: 180, h: 235, z: 4 },
        { x: 335, y: 130, w: 165, h: 185, z: 3 },
        { x: 80,  y: 185, w: 250, h: 160, z: 5 },
        // 4..6 Aura I (3 exteriores)
        { x: 670, y: 25,  w: 185, h: 235, z: 3 },
        { x: 500, y: 30,  w: 200, h: 180, z: 2 },
        { x: 600, y: 135, w: 180, h: 195, z: 5 },
        // 7 Aura I (Interior -> Oculto)
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        // 8..9 Verona (2 exteriores)
        { x: 910, y: 35,  w: 235, h: 175, z: 2 },
        { x: 810, y: 180, w: 220, h: 185, z: 4 },
        // 10..11 Verona (Interiores -> Ocultos)
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        // 12 Chiuso (1 exterior)
        { x: 190, y: 365, w: 250, h: 215, z: 4 },
        // 13..15 Chiuso (Interiores -> Ocultos)
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        // 16 Ankara II (1 exterior)
        { x: 530, y: 350, w: 225, h: 250, z: 4 },
        // 17..19 Ankara II (Interiores -> Ocultos)
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 360, w: 0, h: 0, z: 0, hidden: true }
      ]
    },

    // MODO 4: INTERIORES (9 Renders destacados en cuadrícula 3x3)
    interiors: {
      bounds: { minX: 0, maxX: 1140, minY: 0, maxY: 690 },
      markers: [
        { id: 'cat-int', text: 'Interiores // Living, Cocina & Dormitorios (9 Renders)', tag: '9 Renders', x: 20, y: 0, isCategory: true, modeId: 'interiors' }
      ],
      coords: [
        // 0..6 (Exteriores -> Ocultos)
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        // 7 Aura I (Living y Cocina)
        { x: 40,  y: 40,  w: 325, h: 195, z: 2 },
        // 8..9 Verona (Exteriores -> Ocultos)
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        // 10 Verona (Comedor y Jardín)
        { x: 410, y: 40,  w: 325, h: 195, z: 3 },
        // 11 Verona (Dormitorio Principal)
        { x: 775, y: 40,  w: 325, h: 195, z: 2 },
        // 12 Chiuso (Exterior -> Oculto)
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        // 13 Chiuso (Cocina y Barra)
        { x: 40,  y: 255, w: 325, h: 195, z: 3 },
        // 14 Chiuso (Living y Comedor)
        { x: 410, y: 255, w: 325, h: 195, z: 4 },
        // 15 Chiuso (Dormitorio Suite)
        { x: 775, y: 255, w: 325, h: 195, z: 3 },
        // 16 Ankara II (Exterior -> Oculto)
        { x: 580, y: 340, w: 0, h: 0, z: 0, hidden: true },
        // 17 Ankara II (Living Vista Mar)
        { x: 40,  y: 470, w: 325, h: 195, z: 2 },
        // 18 Ankara II (Comedor Vista Mar)
        { x: 410, y: 470, w: 325, h: 195, z: 3 },
        // 19 Ankara II (Comedor y Madera)
        { x: 775, y: 470, w: 325, h: 195, z: 2 }
      ]
    }
  };

  // ============================================================
  // MOTOR DEL LIENZO ESPACIAL AJUSTADO A LA PANTALLA
  // ============================================================
  class ScreenFittedCanvas {
    constructor() {
      this.viewport = document.getElementById('canvas-viewport');
      this.world = document.getElementById('canvas-world');
      this.zoomLabel = document.getElementById('hud-zoom');
      this.statusText = document.getElementById('hud-status-text');

      // Lightbox
      this.lightbox = document.getElementById('spatial-lightbox');
      this.lightboxImg = document.getElementById('spatial-lightbox-img');
      this.lightboxTitle = document.getElementById('spatial-lightbox-title');
      this.lightboxCounter = document.getElementById('spatial-lightbox-counter');
      this.lightboxClose = document.getElementById('spatial-lightbox-close');
      this.lightboxPrev = document.getElementById('spatial-lightbox-prev');
      this.lightboxNext = document.getElementById('spatial-lightbox-next');

      this.currentMode = 'gallery'; // 'gallery' (Galería libre) por defecto al abrir la web
      this.isShuffling = false;
      this.itemElements = [];
      this.markerElements = [];
      this.focusedItem = null;
      this.activeProjectMarker = null;
      this.currentLightboxIndex = 0;

      // Estado de Cámara
      this.targetX = 0;
      this.targetY = 0;
      this.targetScale = 1;
      this.currentX = 0;
      this.currentY = 0;
      this.currentScale = 1;
      this.lerpFactor = 0.14;

      // Arrastre
      this.isDragging = false;
      this.dragStartX = 0;
      this.dragStartY = 0;
      this.cameraStartX = 0;
      this.cameraStartY = 0;
      this.lastPointerX = 0;
      this.lastPointerY = 0;
      this.velocityX = 0;
      this.velocityY = 0;
      this.friction = 0.90;

      this.initWorld();
      this.initEvents();
      this.initCustomCursor();
      this.fitToScreen(true);
      this.startLoop();
    }

    // Inicializar elementos en el canvas
    initWorld() {
      if (!this.world) return;
      this.world.innerHTML = '';
      this.itemElements = [];
      this.markerElements = [];

      // 1. Crear marcadores de sección / proyecto
      this.createMarkers();

      // 2. Crear los 20 ítems de imagen (sin descripciones bajo las imágenes)
      IMAGES_DATA.forEach((data, index) => {
        const item = document.createElement('div');
        item.className = 'spatial-item';
        item.dataset.index = index;
        item.dataset.projId = data.projId;

        const card = document.createElement('div');
        card.className = 'spatial-item__card';

        const img = document.createElement('img');
        img.className = 'spatial-item__img';
        img.src = `images/proyectos/${data.folder}/${data.file}`;
        img.alt = `${data.projTitle} — ${data.title}`;
        img.loading = 'eager';

        const shine = document.createElement('div');
        shine.className = 'spatial-item__shine';

        // LOGO DE FLECHITAS LIMPIO (Sin recuadro ni texto)
        const expandIcon = document.createElement('div');
        expandIcon.className = 'spatial-item__expand-icon';
        expandIcon.title = 'Ampliar a pantalla completa';
        expandIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        `;

        // TÍTULO DEL PROYECTO SOBRE LA IMAGEN (Superior Izquierda)
        const projectTag = document.createElement('div');
        projectTag.className = 'spatial-item__project-tag';
        projectTag.textContent = `${data.projNum} · ${data.projTitle.toUpperCase()}`;

        card.appendChild(img);
        card.appendChild(shine);
        card.appendChild(projectTag);
        card.appendChild(expandIcon);
        item.appendChild(card);

        // --- ANIMACIÓN DE HOVER ESTILO ONDA / OLA CON MOVIMIENTO SMOOTH ---
        item.addEventListener('mousemove', (e) => {
          if (this.focusedItem) return; // Si hay una imagen seleccionada, ninguna se inclina
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const tiltX = (x - centerX) / centerX;
          const tiltY = (y - centerY) / centerY;
          const dist = Math.hypot(tiltX, tiltY);

          // Dinámica de ola: inclinación más pronunciada, torsión de cresta y elevación
          const rotX = (-tiltY * 16).toFixed(2);
          const rotY = (tiltX * 16).toFixed(2);
          const rotZ = ((tiltX * -tiltY) * 5.2).toFixed(2);
          const waveLift = (36 + Math.max(0, 1 - dist) * 14).toFixed(1);

          item.style.transform = `perspective(850px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateZ(${waveLift}px) scale3d(1.075, 1.075, 1.075)`;
          img.style.transform = `scale(1.09) translate3d(${(-tiltX * 9).toFixed(1)}px, ${(-tiltY * 9).toFixed(1)}px, 0)`;
          card.style.boxShadow = `${(-tiltX * 22).toFixed(1)}px ${(-tiltY * 22 + 30).toFixed(1)}px 70px rgba(0, 0, 0, 0.94), 0 0 0 1.5px rgba(255, 255, 255, 0.48)`;
          shine.style.background = `radial-gradient(ellipse at ${x}px ${y}px, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 72%)`;
          shine.style.opacity = '1';
        });

        item.addEventListener('mouseleave', () => {
          if (this.focusedItem) return;
          item.style.transform = '';
          img.style.transform = '';
          card.style.boxShadow = '';
          shine.style.opacity = '0';
        });

        // --- INTERACCIÓN DE CLIC ---
        item.addEventListener('click', (e) => {
          e.stopPropagation();

          // Si ya estaba enfocado este ítem exacto -> CLICK 2: Abrir a pantalla completa
          if (this.focusedItem === item) {
            this.openLightbox(index);
            return;
          }

          // CLICK 1: Enfocar imagen y acercar al proyecto revelando su nombre
          this.focusImageAndProject(index, item, data);
        });

        this.world.appendChild(item);
        this.itemElements.push(item);
      });

      this.applyLayout(this.currentMode);
    }

    createMarkers() {
      // Marcadores de proyectos (Modo 'projects')
      LAYOUTS.projects.markers.forEach(m => {
        const el = document.createElement('div');
        el.className = 'project-header-marker';
        el.id = m.id;
        el.innerHTML = `
          <span class="project-header-marker__num">${m.text.split('·')[0].trim()}</span>
          <h2 class="project-header-marker__title">${m.text.split('·')[1].trim()}</h2>
        `;
        el.style.left = `${m.x}px`;
        el.style.top = `${m.y}px`;
        this.world.appendChild(el);
        this.markerElements.push({ el, type: 'project', projId: m.projId });
      });

      // Marcadores de categorías (Modos 'exteriors' e 'interiors')
      const catMarkers = [
        { id: 'cat-ext', text: 'Exteriores // Fachadas, Terrazas & Entorno (11 Renders)', tag: '11 Renders', x: 20, y: 0, isCategory: true, modeId: 'exteriors' },
        { id: 'cat-int', text: 'Interiores // Living, Cocina & Dormitorios (9 Renders)', tag: '9 Renders', x: 20, y: 0, isCategory: true, modeId: 'interiors' }
      ];
      catMarkers.forEach(m => {
        const el = document.createElement('div');
        el.className = 'section-marker';
        el.id = m.id;
        el.textContent = m.text;
        el.style.left = `${m.x}px`;
        el.style.top = `${m.y}px`;
        el.style.opacity = '0';
        this.world.appendChild(el);
        this.markerElements.push({ el, type: 'category', modeId: m.modeId });
      });
    }

    // Aplicar coordenadas del modo seleccionado
    applyLayout(modeName) {
      this.currentMode = modeName;

      // Si es un modo libre/moodboard (galería, exteriores o interiores), generar distribución orgánica fresca y mezclada
      if (modeName !== 'projects') {
        this.generateOrganicScatter(modeName);
      }

      const layout = LAYOUTS[modeName];
      if (!layout) return;

      // Desactivar selecciones anteriores
      if (this.focusedItem) {
        this.focusedItem.classList.remove('is-focused');
        this.focusedItem = null;
      }
      this.world.classList.remove('has-focused-item');
      this.hideAllProjectTitles();

      // Posicionar los 20 ítems con transición fluida
      layout.coords.forEach((c, idx) => {
        const item = this.itemElements[idx];
        if (item) {
          if (c.hidden) {
            item.classList.add('is-hidden');
          } else {
            item.classList.remove('is-hidden');
            item.style.left = `${c.x}px`;
            item.style.top = `${c.y}px`;
            item.style.width = `${c.w}px`;
            item.style.height = `${c.h}px`;
            item.style.zIndex = c.z || 1;
          }
        }
      });

      // Actualizar visibilidad y posición de marcadores de categorías (exteriors / interiors)
      this.markerElements.forEach(m => {
        if (m.type === 'category') {
          const isActive = m.modeId === modeName;
          m.el.style.opacity = isActive ? '1' : '0';
          if (isActive && layout.bounds) {
            m.el.style.left = `${Math.max(20, layout.bounds.minX)}px`;
            m.el.style.top = `${layout.bounds.minY}px`;
          }
        }
      });

      // Ajustar cámara para que todo quepa exactamente en la pantalla
      setTimeout(() => this.fitToScreen(false), 80);
    }

    // Ajustar el canvas al tamaño exacto de la pantalla (PC o Móvil)
    fitToScreen(instant = false) {
      const layout = LAYOUTS[this.currentMode];
      if (!layout) return;

      const bounds = layout.bounds;
      const contentW = bounds.maxX - bounds.minX;
      const contentH = bounds.maxY - bounds.minY;

      const isMobile = window.innerWidth <= 768;
      const paddingX = isMobile ? 30 : 70;
      const paddingY = isMobile ? 120 : 130;

      const availW = window.innerWidth - paddingX;
      const availH = window.innerHeight - paddingY;

      // Escala óptima exacta para que quepa en pantalla
      const scaleX = availW / contentW;
      const scaleY = availH / contentH;
      const fitScale = Math.min(scaleX, scaleY);

      this.targetScale = fitScale;
      this.targetX = (window.innerWidth - contentW * fitScale) / 2 - bounds.minX * fitScale;
      this.targetY = (window.innerHeight - contentH * fitScale) / 2 - bounds.minY * fitScale + (isMobile ? 20 : 10);
      this.velocityX = 0;
      this.velocityY = 0;

      if (instant) {
        this.currentScale = this.targetScale;
        this.currentX = this.targetX;
        this.currentY = this.targetY;
      }

      if (this.focusedItem) {
        this.focusedItem.classList.remove('is-focused');
        this.focusedItem = null;
      }
      this.world.classList.remove('has-focused-item');
      this.hideAllProjectTitles();
      if (this.statusText) {
        this.statusText.textContent = 'Arrastrar para explorar · Clic en una imagen para acercar';
      }
    }

    // Limitar el desplazamiento de la cámara para que el canvas no se mueva demasiado hacia los costados
    clampCamera() {
      // Si hay una imagen enfocada, NO restringir la cámara: debe centrar libremente la imagen en pantalla
      if (this.focusedItem) return;

      const layout = LAYOUTS[this.currentMode];
      if (!layout) return;
      const bounds = layout.bounds;
      const contentW = (bounds.maxX - bounds.minX) * this.targetScale;
      const contentH = (bounds.maxY - bounds.minY) * this.targetScale;

      // Holgura elástica mínima para evitar que el canvas vuele hacia los lados
      const slackX = 35;
      const slackY = 45;

      let minX, maxX;
      if (contentW <= window.innerWidth) {
        // En vista general, el contenido cabe en pantalla: centrado con margen mínimo
        const centerX = (window.innerWidth - contentW) / 2 - bounds.minX * this.targetScale;
        minX = centerX - slackX;
        maxX = centerX + slackX;
      } else {
        // Con zoom: permitir paneo delimitado por los extremos del lienzo
        minX = window.innerWidth - bounds.maxX * this.targetScale - slackX;
        maxX = -bounds.minX * this.targetScale + slackX;
      }

      let minY, maxY;
      if (contentH <= window.innerHeight) {
        const centerY = (window.innerHeight - contentH) / 2 - bounds.minY * this.targetScale;
        minY = centerY - slackY;
        maxY = centerY + slackY;
      } else {
        minY = window.innerHeight - bounds.maxY * this.targetScale - slackY;
        maxY = -bounds.minY * this.targetScale + slackY;
      }

      this.targetX = Math.max(minX, Math.min(maxX, this.targetX));
      this.targetY = Math.max(minY, Math.min(maxY, this.targetY));
    }

    // CLICK 1: Centrar la imagen seleccionada en pantalla y dejarla plana/normal sin inclinaciones
    focusImageAndProject(index, item, data) {
      if (this.focusedItem) {
        this.focusedItem.classList.remove('is-focused');
        this.focusedItem.style.removeProperty('transform');
      }
      this.focusedItem = item;
      item.classList.add('is-focused');
      this.world.classList.add('has-focused-item');

      // Limpiar inmediatamente cualquier transformación de inclinación de la animación de hover
      item.style.removeProperty('transform');
      const img = item.querySelector('.spatial-item__img');
      const card = item.querySelector('.spatial-item__card');
      const shine = item.querySelector('.spatial-item__shine');
      if (img) img.style.removeProperty('transform');
      if (card) card.style.removeProperty('box-shadow');
      if (shine) shine.style.opacity = '0';

      // Ocultar marcadores flotantes antiguos (el nombre ahora aparece siempre en la parte superior izquierda de la tarjeta)
      this.hideAllProjectTitles();

      // Obtener posición del ítem en el mundo
      const layout = LAYOUTS[this.currentMode];
      const coord = layout && layout.coords[index] ? layout.coords[index] : { x: 0, y: 0, w: 200, h: 160 };
      const itemLeft = parseFloat(item.style.left) || coord.x;
      const itemTop = parseFloat(item.style.top) || coord.y;
      const itemW = parseFloat(item.style.width) || coord.w;
      const itemH = parseFloat(item.style.height) || coord.h;
      const itemCenterX = itemLeft + itemW / 2;
      const itemCenterY = itemTop + itemH / 2;

      // Escala óptima para centrar y destacar la imagen en el centro exacto de la pantalla
      const isMobile = window.innerWidth <= 768;
      const zoomScale = isMobile 
        ? Math.min(1.6, (window.innerWidth * 0.85) / itemW)
        : Math.min(1.85, Math.max(1.3, (window.innerWidth * 0.40) / itemW));

      this.targetScale = zoomScale;
      this.targetX = window.innerWidth / 2 - itemCenterX * zoomScale;
      this.targetY = window.innerHeight / 2 - itemCenterY * zoomScale;
      this.velocityX = 0;
      this.velocityY = 0;

      if (this.statusText) {
        this.statusText.textContent = `${data.projTitle} · Clic en la flecha o imagen para pantalla completa`;
      }
    }

    hideAllProjectTitles() {
      this.markerElements.forEach(m => {
        if (m.type === 'project') {
          m.el.classList.remove('is-visible');
        }
      });
      this.activeProjectMarker = null;
    }

    zoomAt(clientX, clientY, factor) {
      const newScale = Math.min(2.4, Math.max(0.2, this.targetScale * factor));
      if (newScale === this.targetScale) return;

      const worldX = (clientX - this.targetX) / this.targetScale;
      const worldY = (clientY - this.targetY) / this.targetScale;

      this.targetScale = newScale;
      this.targetX = clientX - worldX * newScale;
      this.targetY = clientY - worldY * newScale;
      this.clampCamera();
    }

    zoomCenter(factor) {
      this.zoomAt(window.innerWidth / 2, window.innerHeight / 2, factor);
    }

    initEvents() {
      // 1. Selector de Modos en el HUD
      const modeBtns = document.querySelectorAll('.hud__mode-btn');
      modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          modeBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.applyLayout(btn.dataset.mode);
        });
      });

      // 1b. Botón Shuffle / Aleatorizar tablero
      const shuffleBtn = document.getElementById('btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.shuffleGallery();
        });
      }

      // 2. Zoom con Rueda
      window.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.14 : 0.88;
        this.zoomAt(e.clientX, e.clientY, factor);
      }, { passive: false });

      // 3. Arrastre del Canvas (Pan)
      window.addEventListener('mousedown', (e) => {
        if (e.target.closest('.hud') || e.target.closest('.spatial-lightbox')) return;

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
        this.clampCamera();

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

      // 4. Clic en fondo vacío -> deseleccionar y volver a vista general
      this.viewport.addEventListener('click', (e) => {
        if (!e.target.closest('.spatial-item')) {
          if (this.focusedItem) {
            this.focusedItem.classList.remove('is-focused');
            this.focusedItem.style.removeProperty('transform');
            this.focusedItem = null;
            this.world.classList.remove('has-focused-item');
            this.hideAllProjectTitles();
            if (this.statusText) {
              this.statusText.textContent = 'Arrastrar para explorar · Clic en una imagen para acercar';
            }
            this.fitToScreen(false);
          }
        }
      });

      // 5. Touch Support
      let touchDistance = 0;
      window.addEventListener('touchstart', (e) => {
        if (e.target.closest('.hud') || e.target.closest('.spatial-lightbox')) return;
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
          touchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && this.isDragging) {
          const dx = e.touches[0].clientX - this.dragStartX;
          const dy = e.touches[0].clientY - this.dragStartY;
          this.targetX = this.cameraStartX + dx;
          this.targetY = this.cameraStartY + dy;
          this.clampCamera();
          this.velocityX = e.touches[0].clientX - this.lastPointerX;
          this.velocityY = e.touches[0].clientY - this.lastPointerY;
          this.lastPointerX = e.touches[0].clientX;
          this.lastPointerY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
          const curDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (touchDistance > 0) {
            const factor = curDist / touchDistance;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this.zoomAt(midX, midY, factor);
          }
          touchDistance = curDist;
        }
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
        touchDistance = 0;
      });

      // 6. Botones HUD
      const btnZoomIn = document.getElementById('btn-zoom-in');
      const btnZoomOut = document.getElementById('btn-zoom-out');
      const btnRecenter = document.getElementById('btn-recenter');

      if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.zoomCenter(1.25));
      if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.zoomCenter(0.8));
      if (btnRecenter) btnRecenter.addEventListener('click', () => this.fitToScreen(false));

      // 7. Resize -> recalcular ajuste a pantalla
      window.addEventListener('resize', () => {
        this.fitToScreen(false);
      });

      // 8. Atajos de teclado
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const menuOverlay = document.getElementById('menu-overlay');
          if (menuOverlay && menuOverlay.classList.contains('is-open')) {
            menuOverlay.classList.remove('is-open');
            return;
          }
          if (this.lightbox && this.lightbox.classList.contains('is-open')) {
            this.closeLightbox();
            return;
          }
        }
        if (this.lightbox && this.lightbox.classList.contains('is-open')) {
          if (e.key === 'ArrowRight') this.nextLightbox();
          if (e.key === 'ArrowLeft') this.prevLightbox();
          return;
        }
        if (e.key === '+' || e.key === '=') this.zoomCenter(1.2);
        if (e.key === '-' || e.key === '_') this.zoomCenter(0.83);
        if (e.key === '0') this.fitToScreen(false);
      });

      // 9. Lightbox Events
      if (this.lightboxClose) this.lightboxClose.addEventListener('click', () => this.closeLightbox());
      if (this.lightboxPrev) this.lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); this.prevLightbox(); });
      if (this.lightboxNext) this.lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); this.nextLightbox(); });
      if (this.lightbox) {
        this.lightbox.addEventListener('click', (e) => {
          if (e.target === this.lightbox) this.closeLightbox();
        });
      }

      // 10. Menu Overlay Mobile / Global
      const menuOverlay = document.getElementById('menu-overlay');
      const menuToggle = document.getElementById('menu-toggle');
      const menuClose = document.querySelector('.menu-overlay__close');

      const openMenu = () => {
        if (!menuOverlay) return;
        menuOverlay.classList.add('is-open');
      };

      const closeMenu = () => {
        if (!menuOverlay) return;
        menuOverlay.classList.remove('is-open');
      };

      if (menuToggle) menuToggle.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); });
      if (menuClose) menuClose.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });
      if (menuOverlay) {
        menuOverlay.addEventListener('click', (e) => {
          if (e.target === menuOverlay) closeMenu();
        });
      }

      // 11. Selector de Idioma (ES / EN)
      const langBtns = document.querySelectorAll('.lang-btn');
      let currentLang = localStorage.getItem('madviz-lang') || 'es';

      const applyLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('madviz-lang', lang);
        document.documentElement.lang = lang === 'en' ? 'en' : 'es';
        langBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.lang === lang));
        document.querySelectorAll('[data-es], [data-en]').forEach(el => {
          const text = el.dataset[lang];
          if (text !== undefined) el.textContent = text;
        });
      };

      langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          applyLanguage(btn.dataset.lang);
        });
      });

      if (currentLang !== 'es') {
        applyLanguage(currentLang);
      }
    }

    // PUNTERO CUSTOM: Punto blanco minimalista con estela fluida (Idéntico a toda la web)
    initCustomCursor() {
      const cursorDot = document.getElementById('cursor-dot');
      if (!cursorDot || !window.matchMedia('(pointer: fine)').matches) return;

      const TRAIL_COUNT = 6;
      const trailDots = [];
      const trailConfig = [
        { scale: 0.78, baseOpacity: 0.58, speed: 0.48 },
        { scale: 0.64, baseOpacity: 0.44, speed: 0.40 },
        { scale: 0.52, baseOpacity: 0.32, speed: 0.32 },
        { scale: 0.40, baseOpacity: 0.22, speed: 0.25 },
        { scale: 0.30, baseOpacity: 0.13, speed: 0.19 },
        { scale: 0.20, baseOpacity: 0.06, speed: 0.14 }
      ];

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail-dot';
        document.body.appendChild(dot);
        trailDots.push({
          el: dot,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          scale: trailConfig[i].scale,
          baseOpacity: trailConfig[i].baseOpacity,
          speed: trailConfig[i].speed
        });
      }

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let prevMouseX = mouseX;
      let prevMouseY = mouseY;
      let cursorX = mouseX;
      let cursorY = mouseY;
      let isCursorVisible = false;
      let isHovering = false;
      let motionSpeed = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isCursorVisible) {
          isCursorVisible = true;
          cursorDot.classList.add('is-active');
        }
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        cursorDot.classList.add('is-hidden');
        trailDots.forEach(t => { t.el.style.opacity = '0'; });
      });

      document.addEventListener('mouseenter', () => {
        cursorDot.classList.remove('is-hidden');
      });

      const animateCursor = () => {
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const dist = Math.hypot(dx, dy);
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        motionSpeed += (dist - motionSpeed) * 0.18;
        const motionAlpha = Math.min(1, Math.max(0, (motionSpeed - 0.2) / 6));

        cursorX += (mouseX - cursorX) * 0.72;
        cursorY += (mouseY - cursorY) * 0.72;

        cursorDot.style.left = `${cursorX.toFixed(2)}px`;
        cursorDot.style.top = `${cursorY.toFixed(2)}px`;

        let leadX = cursorX;
        let leadY = cursorY;

        for (let i = 0; i < TRAIL_COUNT; i++) {
          const t = trailDots[i];
          t.x += (leadX - t.x) * t.speed;
          t.y += (leadY - t.y) * t.speed;
          leadX = t.x;
          leadY = t.y;

          const effectiveOpacity = (isCursorVisible && !isHovering) ? (t.baseOpacity * motionAlpha) : 0;
          t.el.style.left = `${t.x.toFixed(2)}px`;
          t.el.style.top = `${t.y.toFixed(2)}px`;
          t.el.style.transform = `translate(-50%, -50%) scale(${t.scale})`;
          t.el.style.opacity = effectiveOpacity.toFixed(3);
        }

        requestAnimationFrame(animateCursor);
      };
      animateCursor();

      const interactiveSelector = 'a, button, .spatial-item, .hud__brand, .hud__mode-btn, .hud__shuffle-btn, .hud-zoom-ctrl__btn, .hud-zoom-ctrl__recenter, input, textarea, select, [role="button"]';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
          isHovering = true;
          cursorDot.classList.add('is-hovering');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
          isHovering = false;
          cursorDot.classList.remove('is-hovering');
        }
      });

      window.addEventListener('mousedown', () => {
        cursorDot.classList.add('is-dragging');
      });
      window.addEventListener('mouseup', () => {
        cursorDot.classList.remove('is-dragging');
      });
    }

    // Lightbox Modal (Click 2)
    openLightbox(globalIndex) {
      if (!this.lightbox || !IMAGES_DATA[globalIndex]) return;
      this.currentLightboxIndex = globalIndex;
      this.updateLightboxContent();
      this.lightbox.classList.add('is-open');
    }

    closeLightbox() {
      if (!this.lightbox) return;
      this.lightbox.classList.remove('is-open');
    }

    updateLightboxContent() {
      const data = IMAGES_DATA[this.currentLightboxIndex];
      if (!data) return;

      if (this.lightboxImg) {
        this.lightboxImg.style.opacity = '0';
        setTimeout(() => {
          this.lightboxImg.src = `images/proyectos/${data.folder}/${data.file}`;
          this.lightboxImg.alt = `${data.projTitle} — ${data.title}`;
          this.lightboxImg.onload = () => { this.lightboxImg.style.opacity = '1'; };
          if (this.lightboxImg.complete) this.lightboxImg.style.opacity = '1';
        }, 120);
      }

      if (this.lightboxTitle) {
        this.lightboxTitle.textContent = `${data.projTitle} · ${data.title}`;
      }

      if (this.lightboxCounter) {
        const pad = (n) => String(n).padStart(2, '0');
        this.lightboxCounter.textContent = `${pad(this.currentLightboxIndex + 1)} / ${pad(IMAGES_DATA.length)}`;
      }

      const nextIdx = (this.currentLightboxIndex + 1) % IMAGES_DATA.length;
      const prevIdx = (this.currentLightboxIndex - 1 + IMAGES_DATA.length) % IMAGES_DATA.length;
      new Image().src = `images/proyectos/${IMAGES_DATA[nextIdx].folder}/${IMAGES_DATA[nextIdx].file}`;
      new Image().src = `images/proyectos/${IMAGES_DATA[prevIdx].folder}/${IMAGES_DATA[prevIdx].file}`;
    }

    nextLightbox() {
      this.currentLightboxIndex = (this.currentLightboxIndex + 1) % IMAGES_DATA.length;
      this.updateLightboxContent();
    }

    prevLightbox() {
      this.currentLightboxIndex = (this.currentLightboxIndex - 1 + IMAGES_DATA.length) % IMAGES_DATA.length;
      this.updateLightboxContent();
    }

    // Generador de disposición espacial orgánica / moodboard (sin cuadrícula rígida)
    generateOrganicScatter(modeName = 'gallery') {
      const MODE_INDICES = {
        gallery: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        exteriors: [0, 1, 2, 3, 4, 5, 6, 8, 9, 12, 16], // 11 renders exteriores
        interiors: [7, 10, 11, 13, 14, 15, 17, 18, 19]  // 9 renders interiores
      };

      const activeIndices = MODE_INDICES[modeName] || MODE_INDICES.gallery;
      const count = activeIndices.length;

      let streamPatterns, areaW, areaH;
      if (count === 20) {
        // Galería completa (20 renders): 5 columnas/flujos irregulares con silueta asimétrica
        streamPatterns = [
          [3, 5, 4, 5, 3],
          [4, 4, 4, 4, 4],
          [3, 4, 6, 4, 3],
          [4, 5, 3, 5, 3]
        ];
        areaW = 1140;
        areaH = 680;
      } else if (count === 11) {
        // Exteriores (11 renders): 4 flujos compactos muy juntos y mezclados en el centro
        streamPatterns = [
          [2, 4, 3, 2],
          [3, 3, 3, 2],
          [2, 3, 4, 2]
        ];
        areaW = 960;
        areaH = 620;
      } else {
        // Interiores (9 renders): 3 flujos compactos muy juntos y mezclados en el centro
        streamPatterns = [
          [3, 3, 3],
          [2, 4, 3],
          [3, 4, 2]
        ];
        areaW = 880;
        areaH = 580;
      }

      const streamCounts = streamPatterns[Math.floor(Math.random() * streamPatterns.length)];
      const numStreams = streamCounts.length;

      // Mezclar aleatoriamente el orden de las imágenes activas (Fisher-Yates)
      const shuffled = [...activeIndices];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const colSpacing = (areaW - 220) / Math.max(1, numStreams - 1);
      const coords = new Array(20).fill(null);

      // Inactivas: marcadas como hidden
      for (let i = 0; i < 20; i++) {
        coords[i] = { x: Math.round(areaW / 2), y: Math.round(areaH / 2), w: 0, h: 0, z: 0, hidden: true };
      }

      let itemIdx = 0;
      let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;

      for (let s = 0; s < numStreams; s++) {
        const n = streamCounts[s];
        const baseX = s * colSpacing + (Math.random() - 0.5) * 35 + 20;
        const startY = n <= 3 ? (45 + Math.random() * 45) : (15 + Math.random() * 20);
        const availH = areaH - startY - 20;
        const stepY = availH / Math.max(1, n);

        for (let k = 0; k < n; k++) {
          if (itemIdx >= shuffled.length) break;
          const targetIdx = shuffled[itemIdx++];

          // Variedad de tamaños y proporciones para romper cualquier recuadro
          const typeRnd = Math.random();
          let w, h;
          if (typeRnd < 0.45) {
            // Horizontal / apaisado
            w = Math.round(215 + Math.random() * 45);
            h = Math.round(150 + Math.random() * 30);
          } else if (typeRnd < 0.85) {
            // Vertical / retrato
            w = Math.round(165 + Math.random() * 35);
            h = Math.round(215 + Math.random() * 45);
          } else {
            // Cuadrado / medio
            w = Math.round(190 + Math.random() * 30);
            h = Math.round(185 + Math.random() * 30);
          }

          // Desplazamiento orgánico con solapamiento
          const x = Math.max(10, Math.round(baseX + (Math.random() - 0.5) * 35));
          const y = Math.max(15, Math.round(startY + k * stepY + (Math.random() - 0.5) * 30));
          const z = Math.floor(Math.random() * 7) + 1;

          coords[targetIdx] = { x, y, w, h, z, hidden: false };
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x + w);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y + h);
        }
      }

      const titleOffsetY = (modeName === 'exteriors' || modeName === 'interiors') ? 35 : 0;
      const effectiveMinY = minY - titleOffsetY;

      const layoutData = {
        coords,
        bounds: { minX, maxX, minY: effectiveMinY, maxY }
      };

      if (LAYOUTS[modeName]) {
        LAYOUTS[modeName].coords = coords;
        LAYOUTS[modeName].bounds = { minX, maxX, minY: effectiveMinY, maxY };
      }

      return layoutData;
    }

    // MEZCLAR TABLERO: Transición suave de deslizamiento y mezcla (sin explosión hacia afuera)
    shuffleGallery() {
      if (this.isShuffling) return;
      this.isShuffling = true;

      // Desactivar selecciones previas
      if (this.focusedItem) {
        this.focusedItem.classList.remove('is-focused');
        this.focusedItem.style.removeProperty('transform');
        this.focusedItem = null;
      }
      this.world.classList.remove('has-focused-item');
      this.hideAllProjectTitles();

      // Determinar modo a mezclar: si estaba en 'projects', pasa a 'gallery'
      if (this.currentMode === 'projects') {
        this.currentMode = 'gallery';
        const modeBtns = document.querySelectorAll('.hud__mode-btn');
        modeBtns.forEach(b => b.classList.toggle('is-active', b.dataset.mode === 'gallery'));
      }

      // Animación de giro para el botón de shuffle en el HUD
      const shuffleBtn = document.getElementById('btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.classList.add('is-spinning');
        setTimeout(() => shuffleBtn.classList.remove('is-spinning'), 650);
      }

      // Generar nuevo desorden orgánico completamente distinto
      const layoutData = this.generateOrganicScatter(this.currentMode);
      const newCoords = layoutData.coords;

      // Actualizar posición de encabezados de categoría si corresponde
      this.markerElements.forEach(m => {
        if (m.type === 'category') {
          const isActive = m.modeId === this.currentMode;
          m.el.style.opacity = isActive ? '1' : '0';
          if (isActive && layoutData.bounds) {
            m.el.style.left = `${Math.max(20, layoutData.bounds.minX)}px`;
            m.el.style.top = `${layoutData.bounds.minY}px`;
          }
        }
      });

      // Desplazamiento suave directo hacia las nuevas posiciones (solo mezcla, sin disparo hacia afuera)
      newCoords.forEach((c, idx) => {
        const item = this.itemElements[idx];
        if (item) {
          if (c.hidden) {
            item.classList.add('is-hidden');
          } else {
            item.classList.remove('is-hidden');
            item.style.transition = 'left 0.75s cubic-bezier(0.16, 1, 0.3, 1), top 0.75s cubic-bezier(0.16, 1, 0.3, 1), width 0.75s cubic-bezier(0.16, 1, 0.3, 1), height 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.left = `${c.x}px`;
            item.style.top = `${c.y}px`;
            item.style.width = `${c.w}px`;
            item.style.height = `${c.h}px`;
            item.style.zIndex = c.z;
            item.style.removeProperty('transform');
          }
        }
      });

      // Limpiar transiciones temporales y reajustar cámara a pantalla
      setTimeout(() => {
        this.itemElements.forEach(item => {
          item.style.transition = '';
          item.style.removeProperty('transform');
          const img = item.querySelector('.spatial-item__img');
          const card = item.querySelector('.spatial-item__card');
          const shine = item.querySelector('.spatial-item__shine');
          if (img) img.style.removeProperty('transform');
          if (card) card.style.removeProperty('box-shadow');
          if (shine) shine.style.opacity = '0';
        });
        this.isShuffling = false;
        this.fitToScreen(false);
      }, 760);
    }

    // Render loop con amortiguación continua
    startLoop() {
      const tick = () => {
        if (!this.isDragging && (Math.abs(this.velocityX) > 0.05 || Math.abs(this.velocityY) > 0.05)) {
          this.targetX += this.velocityX;
          this.targetY += this.velocityY;
          this.velocityX *= this.friction;
          this.velocityY *= this.friction;
        }

        this.clampCamera();

        this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
        this.currentY += (this.targetY - this.currentY) * this.lerpFactor;
        this.currentScale += (this.targetScale - this.currentScale) * this.lerpFactor;

        this.world.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0) scale(${this.currentScale.toFixed(4)})`;

        if (this.zoomLabel) {
          this.zoomLabel.textContent = `${Math.round(this.currentScale * 100)}%`;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ScreenFittedCanvas());
  } else {
    new ScreenFittedCanvas();
  }
})();
