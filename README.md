# MAD 3D Studio — Sitio Web

## Estructura de archivos

```
WEB MAD/
├── index.html          → Página principal (slideshow + logo + ticker)
├── archive.html        → Galería de proyectos (grilla 4 columnas)
├── about.html          → Sobre el estudio
├── contact.html        → Contacto
├── css/
│   └── styles.css      → Estilos globales
├── js/
│   └── main.js         → Slideshow, menú, animaciones
└── images/
    ├── logo-white.png  → Logo blanco (para fondos oscuros)
    ├── logo-bg.png     → Logo con fondo azul (favicon)
    └── renders/        → TUS RENDERS VAN ACÁ
        ├── render-01.jpg
        ├── render-02.jpg
        └── ...
```

---

## ⚙️ Cómo agregar tus imágenes

### Slideshow (página principal)
1. Copiá tus renders a `images/renders/`
2. Nombralos `render-01.jpg`, `render-02.jpg`, etc.
3. El slideshow los carga automáticamente

### Galería / Archive
En `archive.html`, cada proyecto tiene esta estructura:
```html
<a href="#" class="archive-item">
  <div class="archive-item__placeholder"></div>  ← reemplazar
  <div class="archive-item__caption"><span>Proyecto 01</span></div>
</a>
```
Reemplazá el `div.archive-item__placeholder` por:
```html
<img src="images/renders/mi-render.jpg" alt="Nombre del proyecto">
```

### Logo
Copiá manualmente tus archivos de logo:
- `logo-white.png` → logo blanco con fondo transparente
- `logo-bg.png`    → logo con fondo azul (usado como favicon)

---

## 🎨 Paleta de colores

| Variable         | Hex       | Uso                        |
|-----------------|-----------|----------------------------|
| `--blue`        | `#1F2C4B` | Fondo principal / header   |
| `--cream`       | `#F6F9F5` | Fondo páginas claras       |
| `--text`        | `#091405` | Texto oscuro               |
| `--gray`        | `#949593` | Texto secundario           |

---

## ✏️ Personalización rápida

- **Email de contacto**: editarlo en `contact.html` (buscar `contacto@mad3dstudio.com`)
- **Texto del ticker**: editarlo en `index.html` (buscar `ticker__item`)
- **Servicios en About**: editarlos en `about.html` (buscar `about-services`)
- **Nombres de proyectos**: editarlos en `archive.html` (buscar `archive-item__caption`)
