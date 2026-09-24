/* ============================================
   MADVIZ — main.js
   Estilo monopo.vn
   - Parallax de mouse en el video de fondo
   - Selector de idioma ES / EN (persiste en localStorage)
   - Menú overlay
   - Ghost scroll reveal
   - Lightbox
   ============================================ */

'use strict';

// Asegurar que la página siempre comience arriba de todo (scroll 0) al recargar
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (window.location.hash) {
  window.history.replaceState(null, null, window.location.pathname);
}
window.scrollTo(0, 0);

// ============================================
// PARALLAX DE MOUSE — fondo dinámico
// Movimiento suave del video siguiendo el cursor
// ============================================
const parallaxBg = document.querySelector('.fixed-video-bg');

if (parallaxBg) {
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;

  // scale(1.08) da suficiente margen para moverse con fluidez sin bordes negros
  parallaxBg.style.willChange = 'transform';

  document.addEventListener('mousemove', (e) => {
    // Rango fluido: ~ -24px a +24px horizontal, -16px a +16px vertical
    targetX = (e.clientX / window.innerWidth  - 0.5) * 48;
    targetY = (e.clientY / window.innerHeight - 0.5) * 32;
  }, { passive: true });

  function animateParallax() {
    // Interpolación suave (lerp) — 0.055 para movimiento cinemático flotante
    currentX += (targetX - currentX) * 0.055;
    currentY += (targetY - currentY) * 0.055;

    parallaxBg.style.transform =
      `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.08)`;

    rafId = requestAnimationFrame(animateParallax);
  }

  animateParallax();
}


// ============================================
// CUSTOM CURSOR — Dot con pequeña estela fluida
// ============================================
const cursorDot = document.getElementById('cursor-dot');

if (cursorDot && window.matchMedia('(pointer: fine)').matches) {
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

  // Crear elementos de la estela dinámicamente
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

  function animateCursor() {
    // Velocidad instantánea del ratón para modular la visibilidad de la estela
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    const dist = Math.hypot(dx, dy);
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    motionSpeed += (dist - motionSpeed) * 0.18;
    const motionAlpha = Math.min(1, Math.max(0, (motionSpeed - 0.2) / 6));

    // El punto principal sigue al cursor de forma ágil y precisa (lerp 0.72)
    cursorX += (mouseX - cursorX) * 0.72;
    cursorY += (mouseY - cursorY) * 0.72;

    cursorDot.style.left = `${cursorX.toFixed(2)}px`;
    cursorDot.style.top = `${cursorY.toFixed(2)}px`;

    // Cada punto de la estela sigue en cadena decreciente
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
  }
  animateCursor();

  // Expansión al posar sobre links, botones e imágenes
  const interactiveSelector = 'a, button, .archive-item, input, textarea, select, [role="button"]';
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
}


// ============================================
// SELECTOR DE IDIOMA — ES / EN
// Persiste en localStorage entre páginas
// ============================================
const langBtns = document.querySelectorAll('.lang-btn');
let currentLang = localStorage.getItem('madviz-lang') || 'es';

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('madviz-lang', lang);

  // Actualizar atributo lang del <html>
  document.documentElement.lang = lang === 'en' ? 'en' : 'es';

  // Actualizar clase activa en los botones
  langBtns.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
  });

  // Actualizar todos los elementos con data-es / data-en
  document.querySelectorAll('[data-es], [data-en]').forEach(el => {
    const text = el.dataset[lang];
    if (text !== undefined) el.textContent = text;
  });

  // Actualizar rotador al instante con el nuevo idioma
  updateRotatorLanguage();

  // Mostrar/ocultar bloques .lang-es / .lang-en (para textos largos)
  document.querySelectorAll('.lang-es').forEach(el => {
    el.style.display = lang === 'es' ? 'block' : 'none';
  });
  document.querySelectorAll('.lang-en').forEach(el => {
    el.style.display = lang === 'en' ? 'block' : 'none';
  });

  // Actualizar inputs con data-val-es / data-val-en
  document.querySelectorAll('[data-val-es][data-val-en]').forEach(el => {
    const prevDefault = lang === 'en' ? el.dataset.valEs : el.dataset.valEn;
    if (!el.value || el.value === prevDefault) {
      el.value = el.dataset[`val${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
    }
  });

  // Actualizar placeholders con data-placeholder-es / data-placeholder-en
  document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach(el => {
    const ph = el.dataset[`placeholder${lang.charAt(0).toUpperCase() + lang.slice(1)}`];
    if (ph) el.setAttribute('placeholder', ph);
  });
}


// ============================================
// GMAIL QUICK COMPOSE
// Abre compose de Gmail con destinatario, asunto y cuerpo
// ============================================
window.sendViaGmail = function(e) {
  if (e) e.preventDefault();
  const subjectEl = document.getElementById('gmail-subject');
  const messageEl = document.getElementById('gmail-message');
  const subject = subjectEl ? subjectEl.value.trim() : 'Quiero cotizar mi proyecto';
  const body = messageEl ? messageEl.value.trim() : '';
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=studiomad.3d@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  return false;
};


// ============================================
// HERO ROTATING SERVICES (ES / EN) — GSAP Editorial Wave
// ============================================
const heroRotatorContainer = document.getElementById('hero-rotator');

const servicesData = {
  es: [
    'VISUALIZACIÓN ARQUITECTÓNICA',
    'MODELADO 3D',
    '360º TOURS',
    'VIDEO ANIMACIONES',
    'RENDERIZADO',
    'IA STORYTELLING'
  ],
  en: [
    'ARCHVIZ',
    '3D MODELING',
    '360º TOURS',
    'VIDEO ANIMATIONS',
    'RENDERING',
    'AI STORYTELLING'
  ]
};

let currentServiceIndex = 0;
let serviceTimeline = null;

// Divide el texto en palabras y caracteres preservando espacios
function buildSplitChars(container, text) {
  container.innerHTML = '';
  const upperText = text.toUpperCase();
  const words = upperText.split(' ');
  words.forEach((word, wIdx) => {
    const wordWrap = document.createElement('span');
    wordWrap.className = 'char-word';
    for (let char of word) {
      const charSpan = document.createElement('span');
      charSpan.className = 'char-item';
      charSpan.textContent = char;
      wordWrap.appendChild(charSpan);
    }
    container.appendChild(wordWrap);
    if (wIdx < words.length - 1) {
      const space = document.createElement('span');
      space.innerHTML = '&nbsp;';
      space.className = 'char-space';
      container.appendChild(space);
    }
  });
  return container.querySelectorAll('.char-item');
}

function playServiceAnimation(index) {
  if (!heroRotatorContainer) return;

  const list = servicesData[currentLang] || servicesData.es;
  currentServiceIndex = index % list.length;
  const text = list[currentServiceIndex];

  let rotatorItem = heroRotatorContainer.querySelector('.hero__rotator-item');
  if (!rotatorItem) {
    rotatorItem = document.createElement('span');
    rotatorItem.className = 'hero__rotator-item';
    heroRotatorContainer.appendChild(rotatorItem);
  }

  const chars = buildSplitChars(rotatorItem, text);

  if (serviceTimeline) {
    serviceTimeline.kill();
  }

  if (typeof gsap !== 'undefined') {
    serviceTimeline = gsap.timeline({
      onComplete: () => {
        playServiceAnimation(currentServiceIndex + 1);
      }
    });

    // 1. Entrada estilo characters: volteo vertical 3D nítido y rápido letra por letra
    serviceTimeline.fromTo(chars,
      {
        yPercent: 115,
        rotateX: -65,
        opacity: 0,
        transformOrigin: '50% 100%'
      },
      {
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.015,
        ease: 'power3.out'
      }
    );

    // 2. Tiempo entre palabras más ágil (1.25s en lugar de 2.2s)
    serviceTimeline.to({}, { duration: 1.25 });

    // 3. Salida veloz letra por letra
    serviceTimeline.to(chars, {
      yPercent: -105,
      rotateX: 55,
      opacity: 0,
      duration: 0.42,
      stagger: 0.01,
      ease: 'power2.in'
    });
  } else {
    // Fallback si no está disponible GSAP
    setTimeout(() => {
      playServiceAnimation(currentServiceIndex + 1);
    }, 2200);
  }
}

function updateRotatorLanguage() {
  if (!heroRotatorContainer) return;
  playServiceAnimation(currentServiceIndex);
}

// Aplicar idioma guardado al cargar la página
applyLanguage(currentLang);

// Escuchar clicks en los botones de idioma
langBtns.forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});


// ============================================
// MENU OVERLAY
// ============================================
const menuOverlay  = document.getElementById('menu-overlay');
const menuToggle   = document.getElementById('menu-toggle');   // botón mobile
const menuClose    = document.querySelector('.menu-overlay__close');

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

if (menuToggle) menuToggle.addEventListener('click', openMenu);
if (menuClose)  menuClose.addEventListener('click', closeMenu);

if (menuOverlay) {
  menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) closeMenu();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (menuOverlay && menuOverlay.classList.contains('is-open')) closeMenu();
    if (lightbox && lightbox.classList.contains('is-open')) closeLightbox();
  }
});


// ============================================
// BACKGROUND VIDEO — AUTOPLAY
// ============================================
const bgVideos = document.querySelectorAll('.video-bg');
bgVideos.forEach(vid => {
  vid.muted = true;
  vid.play().catch(() => {});
});


// ============================================
// SCROLLYTELLING GALLERY — GSAP ScrollTrigger
// Hero inicial + 5 Proyectos Cinemáticos
// Entrada individual pausada desde el borde derecho en gris
// Transición a color normal al quedar centrado en pantalla
// Salida simultánea hacia la derecha mientras el siguiente proyecto aparece por debajo
// ============================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  if (ScrollTrigger.clearScrollMemory) {
    ScrollTrigger.clearScrollMemory('manual');
  }

  const scrollyGallery = document.querySelector('.scrolly-gallery');
  if (scrollyGallery) {
    const heroLayer = scrollyGallery.querySelector('#hero-stage-layer');
    const projectRows = Array.from(scrollyGallery.querySelectorAll('.project-row'));
    const numProjects = projectRows.length; // 5 proyectos

    // Distancia exacta desde la posición natural del card hasta quedar completamente fuera por la derecha
    function getCardEntranceX(card) {
      const currentX = gsap.getProperty(card, 'x') || 0;
      const restingLeft = card.getBoundingClientRect().left - currentX;
      return window.innerWidth - restingLeft + 60;
    }

    // Distancia exacta para salir completamente hacia la izquierda fuera de la pantalla
    function getCardExitLeftX(card) {
      const currentX = gsap.getProperty(card, 'x') || 0;
      const restingLeft = card.getBoundingClientRect().left - currentX;
      const cardWidth = card.getBoundingClientRect().width || (window.innerWidth * 0.22);
      return -(restingLeft + cardWidth + 80);
    }

    // Inicializar estado del Hero (visible al inicio)
    if (heroLayer) {
      gsap.set(heroLayer, { autoAlpha: 1, y: 0, zIndex: 40, pointerEvents: 'auto' });
    }

    // Inicializar estado de las filas y tarjetas
    projectRows.forEach((row, rIdx) => {
      // zIndex decreciente: row k queda por encima de row k+1 ("apareciendo por debajo")
      gsap.set(row, {
        autoAlpha: 0,
        pointerEvents: 'none',
        zIndex: 30 - rIdx
      });
      const cards = row.querySelectorAll('.archive-item');
      const imgs = row.querySelectorAll('.archive-item img');
      const header = row.querySelector('.project-header');
      if (header) gsap.set(header, { opacity: 0, y: -10 });
      gsap.set(cards, {
        x: (i, target) => getCardEntranceX(target),
        opacity: 0
      });
      gsap.set(imgs, {
        filter: 'grayscale(100%) brightness(0.5)'
      });
    });

    // Timeline principal con ScrollTrigger fijado (pin: true)
    // Distancia de scroll extendida para que el movimiento sea pausado, cinematográfico y elegante
    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollyGallery,
        pin: true,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * 12.5),
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // FASE 0: El Hero inicial se desplaza hacia arriba como en un scroll natural
    if (heroLayer) {
      mainTl.addLabel('hero_exit');
      mainTl.fromTo(heroLayer,
        {
          y: 0,
          autoAlpha: 1
        },
        {
          y: () => -window.innerHeight * 1.08,
          autoAlpha: 0,
          duration: 1.8,
          ease: 'power1.inOut'
        },
        'hero_exit'
      );
    }

    // Procesar cada uno de los 5 proyectos secuencialmente
    projectRows.forEach((row, k) => {
      const cards = Array.from(row.querySelectorAll('.archive-item'));
      const imgs = Array.from(row.querySelectorAll('.archive-item img'));
      const header = row.querySelector('.project-header');

      // Determinar punto de inicio en el timeline
      // Proyecto 0 empieza a entrar mientras el hero va subiendo hacia arriba
      // Proyecto k empieza a entrar mientras el proyecto k-1 se oculta hacia la izquierda
      const entranceLabel = k === 0 ? 'hero_exit+=0.7' : `proj_${k - 1}_exit+=0.25`;

      // 1. Activar visibilidad de la fila k
      mainTl.set(row, { autoAlpha: 1, pointerEvents: 'auto' }, entranceLabel);

      // 2. Cabecera (nombre del proyecto) entra suavemente
      if (header) {
        mainTl.to(header, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, entranceLabel);
      }

      // 3. Entrada de a una imagen desde el extremo derecho de la pantalla en escala de grises
      // Movimiento pausado, suave y deliberado (duración 1.3, escalonado con overlap -0.9)
      cards.forEach((card, cIndex) => {
        mainTl.fromTo(card,
          {
            x: () => getCardEntranceX(card),
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1.3,
            ease: 'power2.out'
          },
          cIndex === 0 ? entranceLabel : '-=0.9'
        );
      });

      // 4. MOMENTO EN QUE TODAS LAS IMÁGENES ESTÁN EN SU LUGAR Y CENTRADAS:
      // Las imágenes de este proyecto pasan a COLOR NORMAL
      mainTl.to(imgs, {
        filter: 'grayscale(0%) brightness(1)',
        duration: 0.8,
        ease: 'power2.out'
      });

      // 5. Pausa / reposo con el proyecto 100% visible en color en el centro exacto de la pantalla
      mainTl.to({}, { duration: 1.1 });

      // 6. Transición / salida del proyecto hacia la IZQUIERDA (para todos los proyectos):
      const exitLabel = `proj_${k}_exit`;
      mainTl.addLabel(exitLabel);

      // Los proyectos continúan su recorrido hacia la IZQUIERDA y se ocultan de a uno
      mainTl.to(cards, {
        x: (i, target) => getCardExitLeftX(target),
        opacity: 0,
        duration: 1.3,
        stagger: 0.12, // Se van de a una hacia la izquierda consecutivamente
        ease: 'power2.in'
      }, exitLabel);

      if (header) {
        mainTl.to(header, { opacity: 0, x: -30, duration: 0.5 }, exitLabel);
      }

      mainTl.to(imgs, {
        filter: 'grayscale(100%) brightness(0.5)',
        duration: 0.5
      }, exitLabel);

      mainTl.set(row, { autoAlpha: 0, pointerEvents: 'none' }, `${exitLabel}+=1.75`);
    });

    // ============================================
    // CAPA FINAL: CONTACTO SCROLLYTELLING
    // Aparece inmediatamente mientras el último proyecto va desapareciendo
    // Elementos animados consecutivamente desde abajo
    // ============================================
    const contactLayer = scrollyGallery.querySelector('#contact');
    if (contactLayer) {
      const contactEyebrowEl = contactLayer.querySelector('.contact-eyebrow');
      const contactTitleEl   = contactLayer.querySelector('.contact-title');
      const contactEmailEl   = contactLayer.querySelector('.contact-email-wrap');
      const contactSubjectEl = contactLayer.querySelector('#contact-field-subject');
      const contactMessageEl = contactLayer.querySelector('#contact-field-message');
      const contactBtnEl     = contactLayer.querySelector('#contact-field-btn');
      const contactSocialEl  = contactLayer.querySelector('#contact-field-social');
      const contactFooterEl  = contactLayer.querySelector('.contact-stage-footer');
      const headerCenterEl   = document.querySelector('.header-center');

      // Estado inicial: capa oculta y elementos desplazados 40px hacia abajo con opacidad 0
      gsap.set(contactLayer, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set([
        contactEyebrowEl,
        contactTitleEl,
        contactEmailEl,
        contactSubjectEl,
        contactMessageEl,
        contactBtnEl,
        contactSocialEl,
        contactFooterEl
      ], {
        y: 40,
        opacity: 0
      });

      // El usuario especificó:
      // "Apenas termina el ultimo proyecto mientras sigo scrolleando y va desapareciendo el proyecto
      // debe ir apareciendo de manera animada la informacion de contacto. Debe ir apareciendo estilo scrollytelling
      // pero proveniente desde abajo. Primero el texto contacto, luego el correo, luego el asunto y asi sucesivamente"

      // Punto de entrada: mientras el proyecto 4 (último) está saliendo hacia la izquierda
      const lastProjExitLabel = `proj_${numProjects - 1}_exit`;
      const contactStart = `${lastProjExitLabel}+=0.2`;

      // 1. Activar visibilidad de la capa e intensificar el fondo negro completo
      mainTl.set(contactLayer, { autoAlpha: 1, pointerEvents: 'auto' }, contactStart);
      mainTl.fromTo(contactLayer,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, ease: 'power1.out' },
        contactStart
      );

      // Ocultar sutilmente el botón "INICIAR PROYECTO" de la cabecera
      if (headerCenterEl) {
        mainTl.to(headerCenterEl, {
          opacity: 0,
          y: -8,
          duration: 0.45,
          ease: 'power2.in'
        }, contactStart);
      }

      // 2. Primero: Texto Contacto (Epígrafe "Trabajemos juntos" + Título "CONTACTO")
      mainTl.to([contactEyebrowEl, contactTitleEl], {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power2.out'
      }, `${contactStart}+=0.35`);

      // 3. Luego: El Correo (studiomad.3d@gmail.com)
      mainTl.to(contactEmailEl, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.35');

      // 4. Luego: El Asunto (#contact-field-subject)
      mainTl.to(contactSubjectEl, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.35');

      // 5. Luego: El Mensaje (#contact-field-message)
      mainTl.to(contactMessageEl, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.35');

      // 6. Luego: El Botón ENVIAR VÍA GMAIL (#contact-field-btn)
      mainTl.to(contactBtnEl, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out'
      }, '-=0.35');

      // 7. Y finalmente: Redes sociales (Instagram · Behance) y pie de página
      mainTl.to([contactSocialEl, contactFooterEl], {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.35');

      // 8. Pausa / reposo final con la pantalla de contacto 100% interactiva
      mainTl.to({}, { duration: 1.5 });
    }

    // Clic en el enlace del Hero o en el botón "Proyectos destacados" para scrollear directamente al primer proyecto
    const heroScrollTriggers = scrollyGallery.querySelectorAll('.hero__link, #hero-scroll-projects');
    heroScrollTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: window.innerHeight * 1.8,
          behavior: 'smooth'
        });
      });
    });

    // Navegación suave hacia la sección de contacto en la página de inicio
    document.querySelectorAll('a[href="#contact"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const maxScroll = ScrollTrigger.maxScroll(window);
        window.scrollTo({
          top: maxScroll,
          behavior: 'smooth'
        });
      });
    });
  }
} else {
  // Para páginas sin scrollytelling o catálogo
  const standaloneCards = document.querySelectorAll('.archive-grid .archive-item');
  standaloneCards.forEach(c => {
    c.style.transform = 'none';
    c.style.opacity = '1';
  });
}


// ============================================
// GENERAL SCROLL FADE-IN
// Para .fade-in (about, contact, etc.)
// ============================================
const fadeEls = document.querySelectorAll('.fade-in:not(.archive-item)');

if (fadeEls.length > 0) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
    fadeObserver.observe(el);
  });
}


// ============================================
// LIGHTBOX — Visor de imágenes
// ============================================
const lightbox            = document.getElementById('lightbox');
const lightboxImg         = document.getElementById('lightbox-img');
const lightboxCounter     = document.getElementById('lightbox-counter');
const lightboxProjectName = document.getElementById('lightbox-project-name');
const lightboxProjectLink = document.getElementById('lightbox-project-link');
const lightboxClose       = document.querySelector('.lightbox__close');
const lightboxPrev        = document.querySelector('.lightbox__nav--prev');
const lightboxNext        = document.querySelector('.lightbox__nav--next');
// ============================================
// CARGA DINÁMICA DE LA GALERÍA GENERAL (archive.html)
// Si existe window.GALERIA_IMAGENES (definido en images/galeria/galeria-datos.js),
// se generan automáticamente los elementos de la galería
// ============================================
const generalGalleryGrid = document.getElementById('general-gallery-grid');
if (generalGalleryGrid && Array.isArray(window.GALERIA_IMAGENES) && window.GALERIA_IMAGENES.length > 0) {
  generalGalleryGrid.innerHTML = '';
  window.GALERIA_IMAGENES.forEach((itemDef, index) => {
    const fileName = typeof itemDef === 'string' ? itemDef : (itemDef.file || itemDef.src || '');
    const projName = typeof itemDef === 'object' && itemDef.name ? itemDef.name : '';
    const projUrl  = typeof itemDef === 'object' && itemDef.url ? itemDef.url : '';

    if (!fileName) return;

    const item = document.createElement('a');
    item.href = `images/galeria/${fileName}`;
    item.className = 'archive-item';
    item.dataset.index = index;
    if (projName) item.dataset.projectName = projName;
    if (projUrl)  item.dataset.projectUrl  = projUrl;
    item.setAttribute('aria-label', projName || `MADVIZ — Render ${String(index + 1).padStart(2, '0')}`);

    const img = document.createElement('img');
    img.src = `images/galeria/${fileName}`;
    img.alt = projName || `MADVIZ — Render ${String(index + 1).padStart(2, '0')}`;
    img.loading = 'lazy';

    item.appendChild(img);
    generalGalleryGrid.appendChild(item);
  });
}

const archiveItems = document.querySelectorAll('.archive-item');

if (lightbox && archiveItems.length > 0) {
  const images   = [];
  const itemData = [];

  archiveItems.forEach((item, index) => {
    const img  = item.querySelector('img');
    const src  = item.getAttribute('href') || (img ? img.src : '');
    const name = item.dataset.projectName || '';
    const url  = item.dataset.projectUrl || '';

    images.push(src);
    itemData.push({ src, name, url });

    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  let currentIndex = 0;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateLightbox(index) {
    currentIndex = index;
    const cur = itemData[currentIndex] || { src: images[currentIndex], name: '', url: '' };

    if (lightboxImg) {
      lightboxImg.classList.add('is-fading');
      setTimeout(() => {
        lightboxImg.src = images[currentIndex];
        lightboxImg.onload = () => lightboxImg.classList.remove('is-fading');
        if (lightboxImg.complete) lightboxImg.classList.remove('is-fading');
      }, 130);
    }

    if (lightboxProjectName) {
      if (cur.name) {
        lightboxProjectName.textContent = cur.name;
        lightboxProjectName.style.display = 'block';
      } else {
        lightboxProjectName.style.display = 'none';
      }
    }

    if (lightboxProjectLink) {
      if (cur.url) {
        lightboxProjectLink.href = cur.url;
        lightboxProjectLink.style.display = 'inline-flex';
      } else {
        lightboxProjectLink.style.display = 'none';
      }
    }

    if (lightboxCounter) {
      lightboxCounter.textContent = `${pad(currentIndex + 1)} / ${pad(images.length)}`;
    }
    new Image().src = images[(currentIndex + 1) % images.length];
    new Image().src = images[(currentIndex - 1 + images.length) % images.length];
  }

  function openLightbox(index) {
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateLightbox(index);
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function nextImage() { updateLightbox((currentIndex + 1) % images.length); }
  function prevImage() { updateLightbox((currentIndex - 1 + images.length) % images.length); }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext)  lightboxNext.addEventListener('click',  (e) => { e.stopPropagation(); nextImage(); });
  if (lightboxPrev)  lightboxPrev.addEventListener('click',  (e) => { e.stopPropagation(); prevImage(); });

  if (lightboxImg) {
    lightboxImg.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextImage(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prevImage(); }
  });

  // Swipe táctil
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 40) { diff < 0 ? nextImage() : prevImage(); }
  }, { passive: true });
}
