/* =========================================================
   SW.JS — limpieza de la versión anterior del sitio
   La web vieja de Becker Center guardaba una copia en el
   celular de cada visitante (service worker). Este archivo
   borra esa copia y se desactiva solo, para que todos vean
   el sitio nuevo. No hace falta tocarlo.
   ========================================================= */

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));
  })());
});
