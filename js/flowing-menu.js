/**
 * MAD VIZ — Flowing Menu Component (React Bits Port to Vanilla JS)
 * Interactive directional hover marquee menu with GSAP animations,
 * infinite horizontal scrolling tape, responsive typography and bilingual support.
 */

(function () {
  'use strict';

  // Catálogo oficial de servicios MADVIZ con sus renders correspondientes
  const SERVICES_DATA = [
    {
      id: 'render-exterior',
      es: 'Render Exterior',
      en: 'Exterior Render',
      link: 'contact.html?service=render-exterior',
      image: 'images/proyectos/01-casa-flexa/render-01.jpg'
    },
    {
      id: 'render-interior',
      es: 'Render Interior',
      en: 'Interior Render',
      link: 'contact.html?service=render-interior',
      image: 'images/proyectos/02-edificio-aura-i/render-08.png'
    },
    {
      id: 'visualizacion-hiperrealista',
      es: 'Visualización Hiperrealista',
      en: 'Hyper-realistic Visualization',
      link: 'contact.html?service=visualizacion-hiperrealista',
      image: 'images/proyectos/03-edificio-verona/render-09.jpeg'
    },
    {
      id: 'modelado-3d',
      es: 'Modelado 3D',
      en: '3D Modeling',
      link: 'contact.html?service=modelado-3d',
      image: 'images/proyectos/04-viviendas-chiuso/render-13.jpeg'
    },
    {
      id: 'archviz-ia',
      es: 'Archviz con IA',
      en: 'Archviz with AI',
      link: 'contact.html?service=archviz-ia',
      image: 'images/proyectos/05-edificio-ankara%20ii/render-17.jpg'
    },
    {
      id: 'animacion-arquitectonica',
      es: 'Animación Arquitectónica',
      en: 'Architectural Animation',
      link: 'contact.html?service=animacion-arquitectonica',
      image: 'images/proyectos/01-casa-flexa/render-04.jpeg'
    }
  ];

  class VanillaFlowingMenu {
    constructor(options = {}) {
      this.container = document.getElementById('menu-container');
      if (!this.container) return;

      this.items = options.items || SERVICES_DATA;
      this.speed = options.speed || 15;
      this.textColor = options.textColor || '#ffffff';
      this.bgColor = options.bgColor || 'transparent';
      this.marqueeBgColor = options.marqueeBgColor || '#ffffff';
      this.marqueeTextColor = options.marqueeTextColor || '#070707';
      this.borderColor = options.borderColor || 'rgba(255, 255, 255, 0.12)';
      this.animationDefaults = { duration: 0.6, ease: 'expo' };
      this.currentLang = localStorage.getItem('mad_lang') || 'es';

      this.init();
    }

    distMetric(x, y, x2, y2) {
      const xDiff = x - x2;
      const yDiff = y - y2;
      return xDiff * xDiff + yDiff * yDiff;
    }

    findClosestEdge(mouseX, mouseY, width, height) {
      const topEdgeDist = this.distMetric(mouseX, mouseY, width / 2, 0);
      const bottomEdgeDist = this.distMetric(mouseX, mouseY, width / 2, height);
      return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
    }

    init() {
      this.container.innerHTML = '';
      this.menuItems = [];

      this.items.forEach((itemData) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu__item';
        itemEl.style.borderColor = this.borderColor;

        const linkEl = document.createElement('a');
        linkEl.className = 'menu__item-link';
        linkEl.href = itemData.link || 'contact.html';
        linkEl.style.color = this.textColor;
        linkEl.textContent = itemData[this.currentLang] || itemData.es;

        const marquee = document.createElement('div');
        marquee.className = 'marquee';
        marquee.style.backgroundColor = this.marqueeBgColor;

        const innerWrap = document.createElement('div');
        innerWrap.className = 'marquee__inner-wrap';

        const inner = document.createElement('div');
        inner.className = 'marquee__inner';
        inner.setAttribute('aria-hidden', 'true');

        innerWrap.appendChild(inner);
        marquee.appendChild(innerWrap);
        itemEl.appendChild(linkEl);
        itemEl.appendChild(marquee);
        this.container.appendChild(itemEl);

        const itemObj = {
          itemEl,
          linkEl,
          marquee,
          inner,
          data: itemData,
          anim: null,
          isActive: false
        };

        this.menuItems.push(itemObj);
        this.setupItem(itemObj);
      });

      // Recalcular repeticiones y anchos en resize
      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.menuItems.forEach(item => this.updateRepetitions(item));
        }, 80);
      }, { passive: true });

      this.initLanguage();
      this.initCustomCursor();
    }

    setupItem(item) {
      const { itemEl, marquee, inner, data } = item;
      const text = data[this.currentLang] || data.es;

      // Generar 4 elementos iniciales para medición
      inner.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const part = document.createElement('div');
        part.className = 'marquee__part';
        part.style.color = this.marqueeTextColor;
        part.innerHTML = `<span>${text}</span><div class="marquee__img" style="background-image: url('${data.image}')"></div>`;
        inner.appendChild(part);
      }

      this.updateRepetitions(item);

      // Eventos Hover Mouse (Desktop)
      itemEl.addEventListener('mouseenter', (ev) => {
        if (typeof gsap === 'undefined') return;
        item.isActive = true;
        const rect = itemEl.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = this.findClosestEdge(x, y, rect.width, rect.height);

        gsap.timeline({ defaults: this.animationDefaults })
          .set(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
          .set(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0)
          .to([marquee, inner], { y: '0%' }, 0);
      });

      itemEl.addEventListener('mouseleave', (ev) => {
        if (typeof gsap === 'undefined') return;
        item.isActive = false;
        const rect = itemEl.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = this.findClosestEdge(x, y, rect.width, rect.height);

        gsap.timeline({ defaults: this.animationDefaults })
          .to(marquee, { y: edge === 'top' ? '-101%' : '101%' }, 0)
          .to(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0);
      });

      // Soporte Touch (Mobile)
      let touchActive = false;
      itemEl.addEventListener('touchstart', () => {
        if (typeof gsap === 'undefined') return;
        if (!item.isActive) {
          // Ocultar cualquier otro marquee abierto
          this.menuItems.forEach(other => {
            if (other !== item && other.isActive) {
              other.isActive = false;
              gsap.to([other.marquee, other.inner], { y: '101%', duration: 0.4 });
            }
          });

          item.isActive = true;
          touchActive = true;
          gsap.timeline({ defaults: { duration: 0.45, ease: 'power2.out' } })
            .set(marquee, { y: '101%' }, 0)
            .set(inner, { y: '-101%' }, 0)
            .to([marquee, inner], { y: '0%' }, 0);
        }
      }, { passive: true });
    }

    updateRepetitions(item) {
      const { inner, data } = item;
      const text = data[this.currentLang] || data.es;
      const part = inner.querySelector('.marquee__part');
      if (!part) return;

      const contentWidth = part.offsetWidth || 300;
      const viewportWidth = window.innerWidth;
      const needed = Math.max(4, Math.ceil(viewportWidth / Math.max(1, contentWidth)) + 2);

      inner.innerHTML = '';
      for (let i = 0; i < needed; i++) {
        const p = document.createElement('div');
        p.className = 'marquee__part';
        p.style.color = this.marqueeTextColor;
        p.innerHTML = `<span>${text}</span><div class="marquee__img" style="background-image: url('${data.image}')"></div>`;
        inner.appendChild(p);
      }

      if (item.anim) {
        item.anim.kill();
        item.anim = null;
      }

      // Loop horizontal infinito con GSAP
      setTimeout(() => {
        if (typeof gsap === 'undefined') return;
        const singlePart = inner.querySelector('.marquee__part');
        const width = singlePart ? singlePart.offsetWidth : 300;
        if (width > 0) {
          item.anim = gsap.to(inner, {
            x: -width,
            duration: this.speed,
            ease: 'none',
            repeat: -1
          });
        }
      }, 50);
    }

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

      const langBtns = document.querySelectorAll('.lang-btn');
      langBtns.forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));

      // Actualizar enlaces y encabezados con data-es/data-en
      document.querySelectorAll('[data-es][data-en]').forEach(el => {
        const t = el.getAttribute(`data-${lang}`);
        if (t) el.textContent = t;
      });

      // Actualizar textos del menú
      this.menuItems.forEach(item => {
        const text = item.data[lang] || item.data.es;
        item.linkEl.textContent = text;
        this.updateRepetitions(item);
      });
    }

    initCustomCursor() {
      const cursor = document.getElementById('cursor-dot');
      if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

      const updateHoverState = (e) => {
        const isClickable = e.target && e.target.closest('.menu__item, .menu__item-link, a, button');
        cursor.classList.toggle('is-hovering', !!isClickable);
      };

      window.addEventListener('mouseover', updateHoverState, { passive: true });
    }
  }

  // Inicializar en DOMContentLoaded
  function startMenu() {
    window.flowingMenu = new VanillaFlowingMenu({
      speed: 15,
      textColor: '#ffffff',
      bgColor: 'transparent',
      marqueeBgColor: '#ffffff',
      marqueeTextColor: '#070707',
      borderColor: 'rgba(255, 255, 255, 0.12)'
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMenu);
  } else {
    startMenu();
  }
})();
