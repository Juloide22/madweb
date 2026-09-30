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
// Activo exclusivamente en desktop / dispositivos con puntero fino
// ============================================
const parallaxBg = document.querySelector('.fixed-video-bg');

if (parallaxBg && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
// BACKGROUND VIDEO — RESPONSIVE AUTOPLAY & MOBILE OPTIMIZATION
// Desktop: Verona para sitio web.mp4 (16:9)
// Mobile: Nativas para WEB.mp4 (9:16)
// ============================================
function checkIsMobile() {
  return window.innerWidth <= 900 ||
         (window.matchMedia && window.matchMedia('(max-width: 900px), (pointer: coarse), (hover: none)').matches) ||
         /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Sincronización exacta en píxeles para iPhone X (iOS WebKit), Android y Tablets
// Garantiza que las 4 imágenes (2x2) ocupen la pantalla con el título arriba sin desbordar jamás
function syncMobileProjectLayout() {
  const activeTag = document.activeElement ? document.activeElement.tagName : '';
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
    return;
  }

  const vh = (window.visualViewport && window.visualViewport.height)
    ? window.visualViewport.height
    : (window.innerHeight || document.documentElement.clientHeight);
  const vw = window.innerWidth || document.documentElement.clientWidth;

  if (vh && vh > 100) {
    document.documentElement.style.setProperty('--app-height', `${Math.round(vh)}px`);
  }

  const scrollyGallery = document.querySelector('.scrolly-gallery');
  if (!scrollyGallery) return;

  const stage = scrollyGallery.querySelector('.scrolly-stage');
  const rows = scrollyGallery.querySelectorAll('.project-row');
  const isCompactDevice = (vw <= 900) ||
    (window.matchMedia && window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches);

  if (isCompactDevice && vh > 100) {
    const roundedVh = Math.round(vh);
    scrollyGallery.style.setProperty('height', `${roundedVh}px`, 'important');
    scrollyGallery.style.setProperty('max-height', `${roundedVh}px`, 'important');
    if (stage) {
      stage.style.setProperty('height', `${roundedVh}px`, 'important');
      stage.style.setProperty('max-height', `${roundedVh}px`, 'important');
    }

    const siteHeader = document.querySelector('.site-header');
    let topOffset = 64;
    if (siteHeader) {
      const hRect = siteHeader.getBoundingClientRect();
      if (hRect.bottom > 30 && hRect.bottom < 130) {
        topOffset = Math.round(hRect.bottom + 4);
      }
    } else if (vw <= 480) {
      topOffset = 62;
    }

    const bottomMargin = vw <= 480 ? 14 : 18;
    const headerHeight = 30;
    const rowInternalGap = 6;
    const gridGap = vw <= 480 ? 5 : 6;

    const rowHeight = Math.max(240, Math.floor(roundedVh - topOffset - bottomMargin));
    const gridHeight = Math.max(190, rowHeight - headerHeight - rowInternalGap);
    const cardHeight = Math.max(90, Math.floor((gridHeight - gridGap) / 2));

    rows.forEach(row => {
      row.style.setProperty('top', `${topOffset}px`, 'important');
      row.style.setProperty('bottom', 'auto', 'important');
      row.style.setProperty('height', `${rowHeight}px`, 'important');
      row.style.setProperty('max-height', `${rowHeight}px`, 'important');
      row.style.setProperty('transform', 'none', 'important');
      row.style.setProperty('gap', `${rowInternalGap}px`, 'important');

      const header = row.querySelector('.project-header');
      if (header) {
        header.style.setProperty('height', `${headerHeight}px`, 'important');
        header.style.setProperty('min-height', `${headerHeight}px`, 'important');
        header.style.setProperty('max-height', `${headerHeight}px`, 'important');
        header.style.setProperty('flex', `0 0 ${headerHeight}px`, 'important');
      }

      const grid = row.querySelector('.project-grid');
      if (grid) {
        grid.style.setProperty('height', `${gridHeight}px`, 'important');
        grid.style.setProperty('max-height', `${gridHeight}px`, 'important');
        grid.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
        grid.style.setProperty('grid-template-rows', `${cardHeight}px ${cardHeight}px`, 'important');
        grid.style.setProperty('gap', `${gridGap}px`, 'important');
      }

      const items = row.querySelectorAll('.archive-item');
      items.forEach(item => {
        item.style.setProperty('height', `${cardHeight}px`, 'important');
        item.style.setProperty('max-height', `${cardHeight}px`, 'important');
        item.style.setProperty('min-height', '0px', 'important');
        item.style.setProperty('aspect-ratio', 'unset', 'important');
      });
    });
  } else {
    scrollyGallery.style.removeProperty('height');
    scrollyGallery.style.removeProperty('max-height');
    if (stage) {
      stage.style.removeProperty('height');
      stage.style.removeProperty('max-height');
    }
    rows.forEach(row => {
      row.style.removeProperty('top');
      row.style.removeProperty('bottom');
      row.style.removeProperty('height');
      row.style.removeProperty('max-height');
      row.style.removeProperty('transform');
      row.style.removeProperty('gap');

      const header = row.querySelector('.project-header');
      if (header) {
        header.style.removeProperty('height');
        header.style.removeProperty('min-height');
        header.style.removeProperty('max-height');
        header.style.removeProperty('flex');
      }

      const grid = row.querySelector('.project-grid');
      if (grid) {
        grid.style.removeProperty('height');
        grid.style.removeProperty('max-height');
        grid.style.removeProperty('grid-template-columns');
        grid.style.removeProperty('grid-template-rows');
        grid.style.removeProperty('gap');
      }

      const items = row.querySelectorAll('.archive-item');
      items.forEach(item => {
        item.style.removeProperty('height');
        item.style.removeProperty('max-height');
        item.style.removeProperty('min-height');
        item.style.removeProperty('aspect-ratio');
      });
    });
  }
}

function initBackgroundVideos() {
  const isMobile = checkIsMobile();
  document.documentElement.classList.toggle('is-mobile-view', isMobile);

  const desktopVids = document.querySelectorAll('.video-bg--desktop');
  const mobileVids = document.querySelectorAll('.video-bg--mobile');
  const legacyVids = document.querySelectorAll('.video-bg:not(.video-bg--desktop):not(.video-bg--mobile)');

  function setupAndPlay(v) {
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  }

  function pauseVid(v) {
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
    } catch (e) {}
  }

  if (isMobile) {
    desktopVids.forEach(v => {
      pauseVid(v);
      v.style.display = 'none';
      v.style.visibility = 'hidden';
    });
    mobileVids.forEach(v => {
      v.style.display = 'block';
      v.style.visibility = 'visible';
      setupAndPlay(v);
    });
  } else {
    mobileVids.forEach(v => {
      pauseVid(v);
      v.style.display = 'none';
      v.style.visibility = 'hidden';
    });
    desktopVids.forEach(v => {
      v.style.display = 'block';
      v.style.visibility = 'visible';
      setupAndPlay(v);
    });
  }
  legacyVids.forEach(setupAndPlay);
}

// Inicializar layout mobile y videos inmediatamente
syncMobileProjectLayout();
initBackgroundVideos();

// Reanudar inmediatamente en primera interacción del usuario en dispositivos móviles
const resumeVideosOnGesture = () => {
  initBackgroundVideos();
  window.removeEventListener('touchstart', resumeVideosOnGesture);
  window.removeEventListener('touchend', resumeVideosOnGesture);
  window.removeEventListener('scroll', resumeVideosOnGesture);
  window.removeEventListener('click', resumeVideosOnGesture);
};
window.addEventListener('touchstart', resumeVideosOnGesture, { passive: true });
window.addEventListener('touchend', resumeVideosOnGesture, { passive: true });
window.addEventListener('scroll', resumeVideosOnGesture, { passive: true });
window.addEventListener('click', resumeVideosOnGesture, { passive: true });

// Sincronizar en cambios de tamaño, barras de navegador iOS o giro de pantalla
const onViewportChange = () => {
  syncMobileProjectLayout();
  initBackgroundVideos();
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
};
window.addEventListener('resize', onViewportChange, { passive: true });
window.addEventListener('orientationchange', () => {
  setTimeout(onViewportChange, 120);
}, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncMobileProjectLayout, { passive: true });
}

// Reanudar cuando la pestaña vuelve a primer plano
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    initBackgroundVideos();
  }
});


// ============================================
// SCROLLYTELLING GALLERY — GSAP ScrollTrigger + Sistema de "Tope" por Proyecto
// Hero inicial + 5 Proyectos Cinemáticos + Contacto
// Cada proyecto tiene un "tope" firme para evitar pasar de largo con un scroll largo
// ============================================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  if (ScrollTrigger.clearScrollMemory) {
    ScrollTrigger.clearScrollMemory('manual');
  }

  const scrollyGallery = document.querySelector('.scrolly-gallery');
  if (scrollyGallery) {
    // Desactivar scroll-behavior: smooth de CSS para que el tope y el scrub de GSAP sean instantáneos y exactos
    document.documentElement.style.scrollBehavior = 'auto';

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
    const mainTl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollyGallery,
        pin: true,
        start: 'top top',
        end: () => '+=' + (window.innerHeight * 9.5),
        scrub: 0.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          syncMobileProjectLayout();
        }
      }
    });

    mainTl.addLabel('hero_tope', 0);

    // FASE 0: El Hero inicial se desplaza hacia arriba como en un scroll natural
    if (heroLayer) {
      mainTl.addLabel('hero_exit', 0);
      mainTl.fromTo(heroLayer,
        {
          y: 0,
          autoAlpha: 1
        },
        {
          y: () => -window.innerHeight * 1.08,
          autoAlpha: 0,
          duration: 1.4,
          ease: 'power1.inOut'
        },
        0
      );
    }

    // Tiempos numéricos explícitos para cada proyecto (evita desfasajes de posiciones relativas)
    let prevExitStart = 0;

    projectRows.forEach((row, k) => {
      const cards = Array.from(row.querySelectorAll('.archive-item'));
      const imgs = Array.from(row.querySelectorAll('.archive-item img'));
      const header = row.querySelector('.project-header');

      const enterStart = (k === 0) ? 0.55 : (prevExitStart + 0.25);

      // 1. Activar visibilidad de la fila k
      mainTl.set(row, { autoAlpha: 1, pointerEvents: 'auto' }, enterStart);

      // 2. Cabecera (nombre del proyecto arriba) entra suavemente
      if (header) {
        mainTl.to(header, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        }, enterStart);
      }

      // 3. Entrada escalonada de cada una de las 4 imágenes desde la derecha en escala de grises
      const cardStagger = 0.28;
      const cardDur = 1.05;
      cards.forEach((card, cIndex) => {
        mainTl.fromTo(card,
          {
            x: () => getCardEntranceX(card),
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: cardDur,
            ease: 'power2.out'
          },
          enterStart + (cIndex * cardStagger)
        );
      });

      const cardsArrivalEnd = enterStart + ((cards.length - 1) * cardStagger) + cardDur; // enterStart + 1.89
      const colorStart = cardsArrivalEnd - 0.25; // enterStart + 1.64
      const colorDur = 0.55;
      const colorEnd = colorStart + colorDur; // enterStart + 2.19

      // 4. Paso a COLOR NORMAL al quedar en su lugar
      mainTl.to(imgs, {
        filter: 'grayscale(0%) brightness(1)',
        duration: colorDur,
        ease: 'power2.out'
      }, colorStart);

      // 5. Meseta de reposo en color + TOPE EXACTO del proyecto
      const topeTime = colorEnd + 0.35; // enterStart + 2.54 (100% en color y centrado)
      const exitStart = colorEnd + 0.85; // enterStart + 3.04

      mainTl.addLabel(`proj_${k}_tope`, topeTime);
      mainTl.addLabel(`proj_${k}_exit`, exitStart);

      // 6. Transición / salida del proyecto hacia la IZQUIERDA al volver a scrollear
      mainTl.to(cards, {
        x: (i, target) => getCardExitLeftX(target),
        opacity: 0,
        duration: 1.05,
        stagger: 0.09,
        ease: 'power2.in'
      }, exitStart);

      if (header) {
        mainTl.to(header, { opacity: 0, x: -30, duration: 0.45 }, exitStart);
      }

      mainTl.to(imgs, {
        filter: 'grayscale(100%) brightness(0.5)',
        duration: 0.45
      }, exitStart);

      mainTl.set(row, { autoAlpha: 0, pointerEvents: 'none' }, exitStart + 1.45);

      prevExitStart = exitStart;
    });

    // ============================================
    // CAPA FINAL: CONTACTO SCROLLYTELLING
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

      const contactStart = prevExitStart + 0.25;

      mainTl.set(contactLayer, { autoAlpha: 1, pointerEvents: 'auto' }, contactStart);
      mainTl.fromTo(contactLayer,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power1.out' },
        contactStart
      );

      if (headerCenterEl) {
        mainTl.to(headerCenterEl, {
          opacity: 0,
          y: -8,
          duration: 0.45,
          ease: 'power2.in'
        }, contactStart);
      }

      mainTl.to([contactEyebrowEl, contactTitleEl], {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out'
      }, contactStart + 0.3);

      mainTl.to(contactEmailEl, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, contactStart + 0.7);

      mainTl.to(contactSubjectEl, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, contactStart + 1.0);

      mainTl.to(contactMessageEl, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, contactStart + 1.3);

      mainTl.to(contactBtnEl, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      }, contactStart + 1.6);

      mainTl.to([contactSocialEl, contactFooterEl], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out'
      }, contactStart + 1.9);

      const contactEnd = contactStart + 2.7;
      mainTl.to({}, { duration: 0.25 }, contactEnd);
      mainTl.addLabel('contact_tope', contactEnd + 0.2);
    }

    // ============================================
    // CONTROLADOR DE "TOPE" POR PROYECTO
    // Garantiza que cada proyecto tenga un tope firme:
    // - Un scroll largo (rueda, trackpad o swipe táctil fuerte) se frena en el tope del proyecto actual.
    // - Para avanzar al siguiente proyecto se requiere volver a scrollear.
    // - Si el usuario suelta el scroll a mitad de camino, termina de asentarse suavemente en el tope.
    // ============================================
    const stopLabels = ['hero_tope'];
    for (let k = 0; k < numProjects; k++) {
      stopLabels.push(`proj_${k}_tope`);
    }
    if (contactLayer) {
      stopLabels.push('contact_tope');
    }

    function setScrollInstant(y) {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    }

    function getStopScrollPositions() {
      const st = mainTl.scrollTrigger;
      const totalDur = mainTl.duration() || 1;
      const startY = st ? st.start : 0;
      const endY = st ? st.end : (window.innerHeight * 9.5);
      const span = Math.max(1, endY - startY);

      return stopLabels.map(label => {
        const t = (mainTl.labels && mainTl.labels[label] !== undefined)
          ? mainTl.labels[label]
          : totalDur;
        const progress = Math.min(1, Math.max(0, t / totalDur));
        return Math.round(startY + progress * span);
      });
    }

    function findNearestStopIdx(y, stops) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < stops.length; i++) {
        const d = Math.abs(y - stops[i]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      return bestIdx;
    }

    let currentStopIdx = 0;
    let gestureOriginIdx = 0;
    let topeLocked = false;
    let lockedScrollY = 0;
    let topeLockedAt = 0;
    let isTouching = false;
    let isProgrammaticNav = false;
    let glideRafId = null;
    let settleTimer = null;
    let touchReleaseTimer = null;
    let lastWheelTime = 0;
    let lastWheelAbsDelta = 0;

    function cancelGlide() {
      if (glideRafId) {
        cancelAnimationFrame(glideRafId);
        glideRafId = null;
      }
    }

    function engageTopeAt(idx, stops) {
      cancelGlide();
      if (settleTimer) clearTimeout(settleTimer);
      const clampedIdx = Math.max(0, Math.min(stops.length - 1, idx));
      currentStopIdx = clampedIdx;
      gestureOriginIdx = clampedIdx;
      lockedScrollY = stops[clampedIdx];
      topeLocked = true;
      topeLockedAt = performance.now();
      setScrollInstant(lockedScrollY);
    }

    function glideToStop(targetIdx, durationMs = 240) {
      cancelGlide();
      if (settleTimer) clearTimeout(settleTimer);
      const stops = getStopScrollPositions();
      const clampedIdx = Math.max(0, Math.min(stops.length - 1, targetIdx));
      const targetY = stops[clampedIdx];
      const startY = window.scrollY;
      const dist = targetY - startY;

      currentStopIdx = clampedIdx;
      gestureOriginIdx = clampedIdx;
      lockedScrollY = targetY;

      if (Math.abs(dist) <= 2) {
        setScrollInstant(targetY);
        topeLocked = true;
        topeLockedAt = performance.now();
        return;
      }

      const startTime = performance.now();
      function step(now) {
        const p = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        const nextY = Math.round(startY + dist * eased);
        setScrollInstant(nextY);

        if (p < 1) {
          glideRafId = requestAnimationFrame(step);
        } else {
          glideRafId = null;
          setScrollInstant(targetY);
          topeLocked = true;
          topeLockedAt = performance.now();
        }
      }
      glideRafId = requestAnimationFrame(step);
    }

    function scheduleSettleCheck() {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        if (isTouching || isProgrammaticNav || glideRafId || topeLocked) return;
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

        const stops = getStopScrollPositions();
        const curY = window.scrollY;
        const originY = stops[gestureOriginIdx];
        const diff = curY - originY;

        if (Math.abs(diff) <= 3) {
          return;
        }

        if (diff > 0 && gestureOriginIdx < stops.length - 1) {
          const nextIdx = gestureOriginIdx + 1;
          const segDist = Math.max(1, stops[nextIdx] - originY);
          if (diff >= segDist * 0.11) {
            glideToStop(nextIdx, 240);
          } else {
            glideToStop(gestureOriginIdx, 180);
          }
        } else if (diff < 0 && gestureOriginIdx > 0) {
          const prevIdx = gestureOriginIdx - 1;
          const segDist = Math.max(1, originY - stops[prevIdx]);
          if (Math.abs(diff) >= segDist * 0.11) {
            glideToStop(prevIdx, 240);
          } else {
            glideToStop(gestureOriginIdx, 180);
          }
        }
      }, 130);
    }

    // 1. Listener de Rueda / Trackpad (Desktop)
    window.addEventListener('wheel', (e) => {
      if (isProgrammaticNav) return;
      if (menuOverlay && menuOverlay.classList.contains('is-open')) return;
      if (lightbox && lightbox.classList.contains('is-open')) return;

      const now = performance.now();
      const wheelGap = now - lastWheelTime;
      const absDelta = Math.abs(e.deltaY);
      const prevAbsDelta = lastWheelAbsDelta;
      lastWheelTime = now;
      lastWheelAbsDelta = absDelta;

      const stops = getStopScrollPositions();

      // Si estamos en el TOPE de un proyecto, frenar la inercia o el giro largo
      if (topeLocked) {
        const elapsed = now - topeLockedAt;
        const canUnlock =
          (elapsed > 210 && wheelGap > 135) ||
          (elapsed > 440 && absDelta > prevAbsDelta * 1.3 && absDelta >= 12) ||
          (elapsed > 640 && wheelGap > 55);

        if (canUnlock) {
          topeLocked = false;
          gestureOriginIdx = currentStopIdx;
        } else {
          e.preventDefault();
          setScrollInstant(lockedScrollY);
          return;
        }
      } else if (wheelGap > 240 && !glideRafId) {
        gestureOriginIdx = findNearestStopIdx(window.scrollY, stops);
        currentStopIdx = gestureOriginIdx;
      }

      if (glideRafId) {
        e.preventDefault();
        return;
      }

      const maxAllowedIdx = Math.min(stops.length - 1, gestureOriginIdx + 1);
      const minAllowedIdx = Math.max(0, gestureOriginIdx - 1);
      const maxAllowedY = stops[maxAllowedIdx];
      const minAllowedY = stops[minAllowedIdx];
      const projectedY = window.scrollY + e.deltaY;

      // Si este evento de rueda alcanzaría o cruzaría el TOPE del siguiente proyecto -> FRENAR EN EL TOPE
      if (e.deltaY > 0 && projectedY >= maxAllowedY) {
        e.preventDefault();
        engageTopeAt(maxAllowedIdx, stops);
        return;
      }
      if (e.deltaY < 0 && projectedY <= minAllowedY) {
        e.preventDefault();
        engageTopeAt(minAllowedIdx, stops);
        return;
      }

      scheduleSettleCheck();
    }, { passive: false });

    // 2. Listeners Táctiles (Mobile / iPhone X / Android / iPad)
    window.addEventListener('touchstart', (e) => {
      if (isProgrammaticNav) return;
      if (menuOverlay && menuOverlay.classList.contains('is-open')) return;
      if (lightbox && lightbox.classList.contains('is-open')) return;

      isTouching = true;
      if (settleTimer) clearTimeout(settleTimer);
      if (touchReleaseTimer) clearTimeout(touchReleaseTimer);

      const stops = getStopScrollPositions();
      const now = performance.now();

      // Al apoyar el dedo nuevamente tras haber llegado a un tope, habilitar el avance al siguiente proyecto
      if (topeLocked && (now - topeLockedAt > 110)) {
        topeLocked = false;
        gestureOriginIdx = currentStopIdx;
      } else if (!topeLocked && !glideRafId) {
        gestureOriginIdx = findNearestStopIdx(window.scrollY, stops);
        currentStopIdx = gestureOriginIdx;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isProgrammaticNav) return;
      if (menuOverlay && menuOverlay.classList.contains('is-open')) return;
      if (lightbox && lightbox.classList.contains('is-open')) return;

      if (topeLocked) {
        if (e.cancelable) e.preventDefault();
        setScrollInstant(lockedScrollY);
      }
    }, { passive: false });

    const onTouchEnd = () => {
      isTouching = false;
      if (isProgrammaticNav) return;
      if (!topeLocked) {
        scheduleSettleCheck();
      }
      if (touchReleaseTimer) clearTimeout(touchReleaseTimer);
      touchReleaseTimer = setTimeout(() => {
        if (!isTouching && topeLocked && (performance.now() - topeLockedAt > 240)) {
          topeLocked = false;
          gestureOriginIdx = currentStopIdx;
        }
      }, 260);
    };
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // 3. Listener de Scroll General (atrapa la inercia táctil en iOS / Android exactamente en el TOPE)
    window.addEventListener('scroll', () => {
      if (isProgrammaticNav || glideRafId) return;
      const stops = getStopScrollPositions();
      const curY = window.scrollY;

      if (topeLocked) {
        if (Math.abs(curY - lockedScrollY) > 1) {
          setScrollInstant(lockedScrollY);
        }
        return;
      }

      const maxAllowedIdx = Math.min(stops.length - 1, gestureOriginIdx + 1);
      const minAllowedIdx = Math.max(0, gestureOriginIdx - 1);
      const maxAllowedY = stops[maxAllowedIdx];
      const minAllowedY = stops[minAllowedIdx];

      if (gestureOriginIdx < stops.length - 1 && curY >= maxAllowedY - 2) {
        engageTopeAt(maxAllowedIdx, stops);
        return;
      }
      if (gestureOriginIdx > 0 && curY <= minAllowedY + 2) {
        engageTopeAt(minAllowedIdx, stops);
        return;
      }

      if (!isTouching) {
        scheduleSettleCheck();
      }
    }, { passive: true });

    // 4. Navegación por teclado (flechas / RePág / AvPág con tope en cada proyecto)
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
      if (menuOverlay && menuOverlay.classList.contains('is-open')) return;
      if (lightbox && lightbox.classList.contains('is-open')) return;

      const stops = getStopScrollPositions();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        const nextIdx = Math.min(stops.length - 1, currentStopIdx + 1);
        glideToStop(nextIdx, 300);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const prevIdx = Math.max(0, currentStopIdx - 1);
        glideToStop(prevIdx, 300);
      }
    });

    // Helper para navegación programática desde botones del Hero o Header
    function navigateToStopIndex(targetIdx) {
      const stops = getStopScrollPositions();
      const clampedIdx = Math.max(0, Math.min(stops.length - 1, targetIdx));
      cancelGlide();
      isProgrammaticNav = true;
      topeLocked = false;
      currentStopIdx = clampedIdx;
      gestureOriginIdx = clampedIdx;
      lockedScrollY = stops[clampedIdx];

      window.scrollTo({
        top: stops[clampedIdx],
        behavior: 'smooth'
      });

      setTimeout(() => {
        isProgrammaticNav = false;
        topeLocked = true;
        topeLockedAt = performance.now();
      }, 850);
    }

    // Clic en el enlace del Hero o en el botón "Proyectos destacados" -> va al Tope del Proyecto 1 (índice 1)
    const heroScrollTriggers = scrollyGallery.querySelectorAll('.hero__link, #hero-scroll-projects');
    heroScrollTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToStopIndex(1);
      });
    });

    // Navegación suave hacia la sección de contacto en la página de inicio -> va al Tope de Contacto (último índice)
    document.querySelectorAll('a[href="#contact"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const stops = getStopScrollPositions();
        navigateToStopIndex(stops.length - 1);
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
