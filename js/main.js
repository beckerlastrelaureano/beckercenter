/* =========================================================
   MAIN.JS — comportamiento común a todas las páginas
   - Modo claro / oscuro
   - Botones de WhatsApp
   - Animaciones al hacer scroll
   - Efecto de luz en tarjetas
   No hace falta editar este archivo para cambiar textos.
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};
  const root = document.documentElement;

  /* ---------- Modo claro / oscuro ---------- */
  // El tema elegido se guarda en el navegador de cada visitante.
  const toggle = document.querySelector('[data-theme-toggle]');
  function currentTheme() {
    return root.dataset.theme ||
      (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('bc-theme', next); } catch (e) {}
    });
  }

  /* ---------- WhatsApp ---------- */
  // Cualquier enlace con data-wa abre WhatsApp.
  // Si data-wa tiene texto, ese es el mensaje; si está vacío usa el de config.js.
  document.querySelectorAll('[data-wa]').forEach(a => {
    const msg = a.dataset.wa || cfg.mensajeWhatsapp || '';
    a.href = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Enlaces a Instagram.
  document.querySelectorAll('[data-ig]').forEach(a => {
    a.href = 'https://www.instagram.com/' + cfg.instagram + '/';
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Menú: marca la página actual ---------- */
  const page = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
  });

  /* ---------- Encabezado al hacer scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Animaciones al aparecer ---------- */
  // Los hijos de un elemento con data-stagger aparecen uno detrás de otro.
  document.querySelectorAll('[data-stagger]').forEach(group => {
    [...group.children].forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--i', i);
    });
  });
  const reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveal.forEach(el => io.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Luz que sigue al dedo / mouse en tarjetas ---------- */
  document.addEventListener('pointermove', e => {
    const card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Celular con capturas que cambian solas ---------- */
  // Se usa en Design y en Gym App. Cambia la captura cada 3 segundos.
  window.animarCelulares = function () {
    document.querySelectorAll('[data-phone]:not([data-phone-on])').forEach(phone => {
      phone.setAttribute('data-phone-on', '');
      const imgs = phone.querySelectorAll('img');
      const dots = phone.querySelectorAll('.phone-dots span');
      if (imgs.length < 2) return;
      let i = 0;
      setInterval(() => {
        imgs[i].classList.remove('is-on'); dots[i] && dots[i].classList.remove('is-on');
        i = (i + 1) % imgs.length;
        imgs[i].classList.add('is-on'); dots[i] && dots[i].classList.add('is-on');
      }, 3000);
    });
  };
  window.animarCelulares();

  /* ---------- Salto entre páginas con telón ---------- */
  // Al ir a otra página del sitio, un telón con el logo cubre la pantalla
  // y se abre en la página nueva (ver js/core/rendimiento.js y la sección 20 del CSS).
  const perf = window.BC_PERF || {};
  if (!perf.reducir) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || a.target || a.hasAttribute('data-wa') || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (!/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      try { sessionStorage.setItem('bc-telon', '1'); } catch (err) {}
      root.classList.add('telon-out');
      setTimeout(() => { location.href = url.href; }, 430);
    });
    // Si vuelven con "atrás", el telón no debe quedar puesto
    addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('telon-out', 'telon-in'); });
  }

  /* ---------- Año del pie de página ---------- */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
