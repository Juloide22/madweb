import { VanillaFlexCarousel } from './flex-carousel.js';
import { VanillaRippleDistortion } from './ripple-distortion.js';

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
// APP PRINCIPAL
// ============================================================
function initArchiveFlexGallery() {
  // 1. Iniciar RippleDistortion Background
  const rippleMount = document.getElementById('ripple-bg');
  if (rippleMount) {
    window.rippleBg = new VanillaRippleDistortion(rippleMount, {
      src: 'images/galeria-bg-ripple.jpg',
      brushSize: 80,
      strength: 0.23,
      swirl: 2.35,
      rings: 2.25,
      grayscale: false,
      spread: 7.25,
      fade: 3.8,
      spacing: 20,
      dispersion: 0.5,
      glint: 0.05,
      tint: '#0e024a',
      tintAmount: 0.56,
      highlightColor: '#200995',
      trigger: 'both',
      quality: 'medium'
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
    followCursor: false,
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
