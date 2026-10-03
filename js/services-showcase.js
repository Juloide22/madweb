/**
 * MADVIZ — Interactive Services Showcase Engine
 * Maneja la lista de servicios alineada a la izquierda, acordeón animado,
 * vitrina multimedia sincronizada a la derecha (Renders, Video, 360, Brochure),
 * visor esférico WebGL 360 y sincronización bilingüe (ES / EN).
 */

(function () {
  'use strict';

  class ServicesShowcase {
    constructor() {
      this.items = document.querySelectorAll('.service-accordion-item');
      this.panes = document.querySelectorAll('.media-pane');
      this.video = document.getElementById('showcase-video');
      this.soundBtn = document.getElementById('video-audio-btn');
      this.canvas360 = document.getElementById('showcase-360-canvas');
      this.currentService = 'renders';
      this.gl360Initialized = false;

      this.initAccordion();
      this.initVideoControls();
      this.initLanguageSync();
    }

    initAccordion() {
      if (!this.items.length) return;

      this.items.forEach(item => {
        const btn = item.querySelector('.service-header-btn');
        const serviceKey = item.getAttribute('data-service');

        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.activateService(serviceKey);
          });

          // Accesibilidad con teclado
          btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.activateService(serviceKey);
            }
          });
        }
      });
    }

    activateService(serviceKey) {
      if (this.currentService === serviceKey) return;
      this.currentService = serviceKey;

      // 1. Actualizar Acordeón Izquierdo
      this.items.forEach(item => {
        const isMatch = item.getAttribute('data-service') === serviceKey;
        item.classList.toggle('is-active', isMatch);

        const btn = item.querySelector('.service-header-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
        }
      });

      // 2. Actualizar Vitrina Derecha (Showcase)
      this.panes.forEach(pane => {
        const isMatch = pane.getAttribute('data-pane') === serviceKey;
        pane.classList.toggle('is-active', isMatch);
      });

      // 3. Manejo de Video en Pane 2
      if (this.video) {
        if (serviceKey === 'animaciones') {
          this.video.currentTime = 0;
          const playPromise = this.video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else {
          this.video.pause();
        }
      }

      // 4. Inicializar / Despertar Visor 360 en Pane 3
      if (serviceKey === 'tours360') {
        this.init360Viewer();
      }
    }

    initVideoControls() {
      if (!this.soundBtn || !this.video) return;

      this.soundBtn.addEventListener('click', () => {
        this.video.muted = !this.video.muted;
        const isES = document.documentElement.lang !== 'en';
        if (this.video.muted) {
          this.soundBtn.textContent = isES ? '🔊 ACTIVAR AUDIO' : '🔊 UNMUTE AUDIO';
        } else {
          this.soundBtn.textContent = isES ? '🔇 SILENCIAR' : '🔇 MUTE AUDIO';
        }
      });
    }

    init360Viewer() {
      if (this.gl360Initialized || !this.canvas360) return;
      this.gl360Initialized = true;

      const canvas = this.canvas360;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        console.warn('[ServicesShowcase] WebGL no disponible para el visor 360');
        return;
      }

      const vsSource = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision mediump float;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform float uYaw;
        uniform float uPitch;
        uniform float uFov;
        const float PI = 3.14159265358979323846;

        void main() {
          vec2 st = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
          vec3 ray = normalize(vec3(st * tan(uFov * 0.5), -1.0));

          float cp = cos(uPitch);
          float sp = sin(uPitch);
          ray = vec3(ray.x, ray.y * cp - ray.z * sp, ray.y * sp + ray.z * cp);

          float cy = cos(uYaw);
          float sy = sin(uYaw);
          ray = vec3(ray.x * cy + ray.z * sy, ray.y, -ray.x * sy + ray.z * cy);

          float u = fract(atan(ray.z, ray.x) / (2.0 * PI) + 0.5);
          float v = clamp(asin(clamp(ray.y, -0.9999, 0.9999)) / PI + 0.5, 0.001, 0.999);

          gl_FragColor = texture2D(uTexture, vec2(u, v));
        }
      `;

      function createShader(glCtx, type, source) {
        const s = glCtx.createShader(type);
        glCtx.shaderSource(s, source);
        glCtx.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vsSource));
      gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(prog, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const uResLoc = gl.getUniformLocation(prog, 'uResolution');
      const uYawLoc = gl.getUniformLocation(prog, 'uYaw');
      const uPitchLoc = gl.getUniformLocation(prog, 'uPitch');
      const uFovLoc = gl.getUniformLocation(prog, 'uFov');
      const uTexLoc = gl.getUniformLocation(prog, 'uTexture');

      let yaw = 0, pitch = 0;
      let targetYaw = 0, targetPitch = 0;
      let fov = 1.35;
      let isDragging = false;
      let lastX = 0, lastY = 0;
      let autoRotate = true;
      let resumeTimeout = null;

      const texture = gl.createTexture();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        requestAnimationFrame(renderLoop);
      };
      img.src = 'images/services/tour-360-panorama.jpg';

      // Interacción con Mouse
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        lastX = e.clientX;
        lastY = e.clientY;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        targetYaw += dx * 0.005;
        targetPitch += dy * 0.005;
        targetPitch = Math.max(-1.3, Math.min(1.3, targetPitch));
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          resumeTimeout = setTimeout(() => {
            if (!isDragging) autoRotate = true;
          }, 3500);
        }
      });

      // Interacción Táctil (Mobile / Tablet)
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          autoRotate = false;
          if (resumeTimeout) clearTimeout(resumeTimeout);
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
        }
      }, { passive: true });

      canvas.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        targetYaw += dx * 0.006;
        targetPitch += dy * 0.006;
        targetPitch = Math.max(-1.3, Math.min(1.3, targetPitch));
      }, { passive: true });

      canvas.addEventListener('touchend', () => {
        isDragging = false;
        resumeTimeout = setTimeout(() => {
          if (!isDragging) autoRotate = true;
        }, 3500);
      });

      const self = this;
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth * dpr;
        const h = canvas.clientHeight * dpr;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      }

      function renderLoop() {
        if (self.currentService === 'tours360') {
          resize();
          if (autoRotate) {
            targetYaw += 0.0016;
          }
          yaw += (targetYaw - yaw) * 0.1;
          pitch += (targetPitch - pitch) * 0.1;

          gl.uniform2f(uResLoc, canvas.width, canvas.height);
          gl.uniform1f(uYawLoc, yaw);
          gl.uniform1f(uPitchLoc, pitch);
          gl.uniform1f(uFovLoc, fov);
          gl.uniform1i(uTexLoc, 0);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        requestAnimationFrame(renderLoop);
      }
    }

    initLanguageSync() {
      const langBtns = document.querySelectorAll('.lang-btn');

      const applyTranslations = (lang) => {
        document.documentElement.lang = lang;
        langBtns.forEach(btn => {
          btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
          btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        // Traducir todos los elementos con data-es y data-en
        const translatable = document.querySelectorAll('[data-es][data-en]');
        translatable.forEach(el => {
          const text = el.getAttribute(`data-${lang}`);
          if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
              el.placeholder = text;
            } else {
              el.textContent = text;
            }
          }
        });

        // Actualizar botón de audio si el video está silenciado
        if (this.soundBtn && this.video) {
          if (this.video.muted) {
            this.soundBtn.textContent = lang === 'en' ? '🔊 UNMUTE AUDIO' : '🔊 ACTIVAR AUDIO';
          } else {
            this.soundBtn.textContent = lang === 'en' ? '🔇 MUTE AUDIO' : '🔇 SILENCIAR';
          }
        }
      };

      langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.getAttribute('data-lang');
          if (lang) {
            try { localStorage.setItem('mad_lang', lang); } catch (e) {}
            applyTranslations(lang);
          }
        });
      });

      // Leer idioma guardado
      const savedLang = localStorage.getItem('mad_lang') || 'es';
      applyTranslations(savedLang);

      window.updateServicesLanguage = applyTranslations;
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.servicesShowcaseInstance = new ServicesShowcase();
    });
  } else {
    window.servicesShowcaseInstance = new ServicesShowcase();
  }
})();
