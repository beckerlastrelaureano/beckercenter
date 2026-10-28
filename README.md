# Becker Center

Sitio oficial de Becker Center: entrenamiento, Becker Books, Becker Design y Gym App.

Sitio publicado: https://beckerlastrelaureano.github.io/beckercenter/

## Qué editar

| Quiero cambiar… | Archivo |
|---|---|
| WhatsApp, Instagram, precio de Gym App | `js/config.js` |
| Libros, precios, stock | `data/books.json` |
| Apps de Becker Design | `data/apps.json` |
| Textos de cada página | `index.html`, `books.html`, `design.html`, `gym-app.html` (buscá `TEXTO EDITABLE`) |
| Colores y fuentes | `css/styles.css`, sección 1 |

La guía para editar los archivos de datos está en `data/LEEME.md`.

## Estructura

```
index.html      Inicio
books.html      Catálogo de libros
design.html     Vitrina de apps
gym-app.html    Página de venta de Gym App
404.html        Página para links rotos
css/            Estilos
js/             Funcionamiento (config.js es el único que se edita seguido)
data/           Libros y apps en JSON
img/            Portadas, capturas, imágenes para compartir
sw.js           Limpia la versión vieja del sitio guardada en los celulares
```

No usa librerías ni herramientas de compilación: se sube tal cual a GitHub Pages.
