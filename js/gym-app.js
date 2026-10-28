/* =========================================================
   GYM-APP.JS — interacciones de la página de Gym App
   - Precio del plan (sale de js/config.js)
   - Pestañas Alumnos / Entrenadores / Gimnasios
   - Números que cuentan al aparecer
   No hace falta editar este archivo para cambiar textos.
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};

  /* ---------- Precio del plan mensual ---------- */
  if (cfg.precioGymApp) {
    document.querySelectorAll('[data-gym-price]').forEach(el => { el.textContent = cfg.precioGymApp; });
    document.querySelectorAll('[data-gym-period]').forEach(el => { el.hidden = false; });
  }

  /* ---------- Pestañas ---------- */
  const tabs = document.querySelectorAll('.tabs [role="tab"]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        const activa = t === tab;
        t.setAttribute('aria-selected', activa);
        document.getElementById(t.getAttribute('aria-controls')).hidden = !activa;
      });
    });
  });

  /* ---------- Números que cuentan ---------- */
  const numeros = document.querySelectorAll('[data-count-to]');
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducir) {
    numeros.forEach(el => { el.textContent = '0'; });
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const fin = +e.target.dataset.countTo;
      const inicio = performance.now();
      const dur = 1400;
      (function paso(t) {
        const p = Math.min((t - inicio) / dur, 1);
        e.target.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      })(inicio);
    }), { threshold: 0.6 });
    numeros.forEach(el => io.observe(el));
  }
})();
