/**
 * marca.js — Configuración de marca (branding) de ESTE cliente
 * -----------------------------------------------------------------------
 * Este es el ÚNICO archivo de texto/color que hay que tocar para armar la
 * versión de un entrenador nuevo. El resto del código (index.html, css,
 * app.js) lee estos valores en vez de tener el nombre o los colores
 * escritos a mano en varios lugares.
 *
 * Lo que SÍ hay que reemplazar aparte, por afuera de este archivo, porque
 * son imágenes y no texto:
 *   assets/iconos/logo-mark.png            (ícono chico, sidebar/login)
 *   assets/iconos/logo-splash.png          (pantalla de carga)
 *   assets/iconos/icon-192.png / icon-512.png
 *   assets/iconos/icon-maskable-192.png / icon-maskable-512.png
 *   assets/iconos/apple-touch-icon.png
 * Y en manifest.json: "name", "short_name", "theme_color" (mismo valor
 * que colorAcento acá abajo).
 */

const MARCA = {
  // Nombre partido en dos: la primera parte va en color normal, la
  // segunda en negrita con el color de acento. Ej: "Becker" + "Center".
  nombre: 'Becker',
  sufijo: 'Center',

  // Usado en el <title> de la pestaña, meta description y manifest.
  nombreCompleto: 'Becker Center',
  descripcion: 'Panel de administración: entrenadores, códigos de invitación y suspensiones.',

  // Frase corta de la pantalla de carga (splash).
  tagline: 'PANEL DE ADMINISTRACIÓN',

  // Paleta. colorAcentoRgb tiene que ser el MISMO color que colorAcento,
  // pero escrito como "R, G, B" (sin rgb(), sin #) para poder armar
  // versiones transparentes del color en el CSS.
  colorAcento: '#0F5D75',
  colorAcentoClaro: '#1B87A8',
  colorAcentoRgb: '15, 93, 117',
};

// -----------------------------------------------------------------------
// A partir de acá no hace falta tocar nada: aplica automáticamente los
// valores de arriba al título de la pestaña, los metadatos y los colores.
// -----------------------------------------------------------------------
(function aplicarMarca() {
  document.title = `${MARCA.nombreCompleto} — Panel de entrenador`;

  const setMeta = (selector, attr, valor) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, valor);
  };
  setMeta('meta[name="description"]', 'content', `${MARCA.nombreCompleto}: ${MARCA.descripcion}`);
  setMeta('meta[name="theme-color"]', 'content', MARCA.colorAcento);
  setMeta('meta[name="apple-mobile-web-app-title"]', 'content', MARCA.nombreCompleto);

  const raiz = document.documentElement.style;
  raiz.setProperty('--color-acento', MARCA.colorAcento);
  raiz.setProperty('--color-acento-claro', MARCA.colorAcentoClaro);
  raiz.setProperty('--color-acento-rgb', MARCA.colorAcentoRgb);
})();
