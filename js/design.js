/* =========================================================
   DESIGN.JS — vitrina de apps de Becker Design
   Lee las apps de data/apps.json:
   - la app con "destacada": true se muestra grande arriba
   - el resto se muestra en tarjetas
   Para sumar o cambiar apps editá data/apps.json, no este archivo.
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};
  const destacadaBox = document.querySelector('[data-featured]');
  const grid = document.querySelector('[data-apps]');

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wa = msg => 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg || cfg.mensajeWhatsapp || '');
  const ESTADOS = { disponible: 'Disponible', proximamente: 'Próximamente', desarrollo: 'En desarrollo' };

  const iconoWa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>';
  const flecha = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

  /* Celular con capturas que cambian solas */
  function celular(app) {
    if (!app.capturas.length) return '';
    return `
      <div class="phone" data-phone>
        <div class="phone-screen">
          ${app.capturas.map((src, i) => `<img src="${esc(src)}" alt="Captura de ${esc(app.nombre)} ${i + 1}" ${i ? 'loading="lazy"' : ''} class="${i ? '' : 'is-on'}" width="375" height="812">`).join('')}
        </div>
        <div class="phone-dots">${app.capturas.map((_, i) => `<span class="${i ? '' : 'is-on'}"></span>`).join('')}</div>
      </div>`;
  }

  function botones(app) {
    let html = '';
    if (app.probar) html += `<a class="btn btn-primary" href="${esc(app.probar)}" target="_blank" rel="noopener">Probar gratis ${flecha}</a>`;
    if (app.pagina) html += `<a class="btn" href="${esc(app.pagina)}">Ver más</a>`;
    if (!app.probar) html += `<a class="btn btn-primary" href="${wa(app.mensaje)}" target="_blank" rel="noopener">${iconoWa} ${app.estado === 'disponible' ? 'Pedir info' : 'Avisame'}</a>`;
    return html;
  }

  function destacada(app) {
    return `
      <article class="showcase" data-reveal>
        <div class="showcase-media">${celular(app)}</div>
        <div class="showcase-info">
          <div class="app-tags">
            <span class="badge is-stock">${ESTADOS[app.estado] || app.estado}</span>
            <span class="badge is-soft">${esc(app.tipo)}</span>
          </div>
          <h2 class="showcase-title">${esc(app.nombre)} <small>${esc(app.subtitulo)}</small></h2>
          <p class="lead">${esc(app.resumen)}</p>
          ${app.funciones.length ? `<ul class="feature-list">${app.funciones.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
          <p class="for-who"><span>Para</span> ${app.paraQuien.map(esc).join(' · ')}</p>
          <div class="hero-cta">${botones(app)}</div>
          <a class="text-link" href="${wa(app.mensaje)}" target="_blank" rel="noopener">¿Dudas? Escribime por WhatsApp</a>
        </div>
      </article>`;
  }

  function tarjeta(app, i) {
    const imagen = app.capturas[0]
      ? `<img src="${esc(app.capturas[0])}" alt="Captura de ${esc(app.nombre)}" loading="lazy">`
      : `<div class="app-placeholder"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46"/><path d="M34 30V70M42 33H55a8 8 0 0 1 0 16H44M44 49H57a9 9 0 0 1 0 18H42"/></svg></div>`;
    return `
      <article class="card app-card" style="--i:${i}" data-reveal>
        <div class="app-media">${imagen}</div>
        <div class="app-body">
          <div class="app-tags">
            <span class="badge${app.estado === 'disponible' ? ' is-stock' : ''}">${ESTADOS[app.estado] || app.estado}</span>
          </div>
          <h3>${esc(app.nombre)} <small>${esc(app.subtitulo)}</small></h3>
          <p>${esc(app.resumen)}</p>
          <p class="for-who"><span>Para</span> ${app.paraQuien.map(esc).join(' · ')}</p>
          <div class="app-actions">${botones(app)}</div>
        </div>
      </article>`;
  }

  /* Hace aparecer los elementos creados por este archivo */
  function revelar() {
    const els = document.querySelectorAll('[data-featured] [data-reveal], [data-apps] [data-reveal]');
    if (!('IntersectionObserver' in window)) return els.forEach(el => el.classList.add('is-in'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  fetch('data/apps.json')
    .then(r => r.json())
    .then(data => {
      const apps = data.apps || [];
      const top = apps.find(a => a.destacada);
      const resto = apps.filter(a => a !== top);
      if (top) destacadaBox.innerHTML = destacada(top);
      grid.innerHTML = resto.map(tarjeta).join('');
      window.animarCelulares();   // está en main.js
      revelar();
    })
    .catch(() => {
      destacadaBox.innerHTML = '<p class="empty">No se pudieron cargar las apps. Si abriste el archivo directo desde la carpeta, usá un servidor local.</p>';
    });
})();
