/* =========================================================
   GYM-APP.JS — interacciones de la página de Gym App
   - Precio del plan (sale de js/config.js)
   - Rueda de objetivos
   - Capturas en 3D que se deslizan
   - Línea de "Cómo funciona" que se llena al bajar
   - Pestañas con indicador que se desliza
   - Números que cuentan y cronómetro de ejemplo
   No hace falta editar este archivo para cambiar textos.
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  /* ---------- Precio del plan mensual ---------- */
  if (cfg.precioGymApp) {
    document.querySelectorAll('[data-gym-price]').forEach(el => { el.textContent = cfg.precioGymApp; });
    document.querySelectorAll('[data-gym-period]').forEach(el => { el.hidden = false; });
  }

  /* ---------- Rueda de objetivos ---------- */
  (function rueda() {
    const wheel = $('[data-wheel]');
    const drum = $('[data-wheel-drum]');
    if (!wheel || !drum) return;
    const items = [...drum.children];
    const paso = 360 / items.length;   // ángulo entre opciones
    const radio = 120;
    // "pos" sigue contando sin volver a 0, así la rueda gira siempre para el mismo lado
    let pos = 0, actual = 0, auto = null, inicioY = null, base = 0;

    items.forEach((li, i) => {
      li.style.transform = `rotateX(${-i * paso}deg) translateZ(${radio}px)`;
    });

    function ir(nuevo) {
      pos = nuevo;
      actual = ((pos % items.length) + items.length) % items.length;
      drum.style.transform = `translateZ(${-radio}px) rotateX(${pos * paso}deg)`;
      items.forEach((li, j) => li.classList.toggle('is-on', j === actual));
      const li = items[actual];
      $('[data-wheel-titulo]').textContent = li.textContent;
      $('[data-wheel-dias]').textContent = li.dataset.dias;
      $('[data-wheel-texto]').textContent = li.dataset.texto;
      const info = $('.wheel-info');
      info.classList.remove('is-swap'); void info.offsetWidth; info.classList.add('is-swap');
    }
    function detener() { clearInterval(auto); auto = null; }
    function arrancar() { if (!reducir && !auto) auto = setInterval(() => ir(pos + 1), 2600); }

    $('[data-wheel-prev]').addEventListener('click', () => { ir(pos - 1); detener(); });
    $('[data-wheel-next]').addEventListener('click', () => { ir(pos + 1); detener(); });
    wheel.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { ir(pos + 1); detener(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { ir(pos - 1); detener(); e.preventDefault(); }
    });

    // Arrastrar con el dedo hacia arriba o abajo
    wheel.addEventListener('pointerdown', e => { inicioY = e.clientY; base = pos; detener(); wheel.setPointerCapture(e.pointerId); drum.classList.add('is-drag'); });
    wheel.addEventListener('pointermove', e => {
      if (inicioY === null) return;
      const d = (inicioY - e.clientY) / 4;          // grados arrastrados
      drum.style.transform = `translateZ(${-radio}px) rotateX(${base * paso + d}deg)`;
    });
    const soltar = e => {
      if (inicioY === null) return;
      const d = (inicioY - e.clientY) / 4;
      inicioY = null;
      drum.classList.remove('is-drag');
      // Si fue un toque (sin arrastrar), elige la opción tocada
      if (Math.abs(d) < 1.5) {
        const li = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.parentElement === drum);
        if (!li) return ir(base);
        // Camino más corto hasta la opción tocada
        let dif = items.indexOf(li) - actual;
        if (dif > items.length / 2) dif -= items.length;
        if (dif < -items.length / 2) dif += items.length;
        return ir(base + dif);
      }
      ir(base + Math.round(d / paso));
    };
    wheel.addEventListener('pointerup', soltar);
    wheel.addEventListener('pointercancel', soltar);

    ir(0);
    // Gira sola solo mientras se ve
    new IntersectionObserver(([e]) => (e.isIntersecting ? arrancar() : detener()), { threshold: 0.4 }).observe(wheel);
  })();

  /* ---------- Capturas en 3D ---------- */
  (function capturas() {
    const flow = $('[data-flow]');
    if (!flow) return;
    const figs = [...flow.children];
    const dots = $('[data-flow-dots]');
    dots.innerHTML = figs.map((_, i) => `<button type="button" aria-label="Captura ${i + 1}"></button>`).join('');
    let actual = 0, inicioX = null, auto = null;

    function ir(i) {
      actual = (i + figs.length) % figs.length;
      figs.forEach((f, j) => {
        let d = j - actual;
        if (d > figs.length / 2) d -= figs.length;
        if (d < -figs.length / 2) d += figs.length;
        const a = Math.abs(d);
        f.style.transform = `translateX(-50%) translateX(${d * 72}%) translateZ(${-a * 160}px) rotateY(${-d * 24}deg)`;
        f.style.zIndex = 10 - a;
        f.style.opacity = a > 1 ? 0 : 1;
        f.classList.toggle('is-on', d === 0);
      });
      [...dots.children].forEach((b, j) => b.classList.toggle('is-on', j === actual));
    }
    figs.forEach((f, i) => f.addEventListener('click', () => { ir(i); clearInterval(auto); }));
    dots.addEventListener('click', e => {
      const i = [...dots.children].indexOf(e.target);
      if (i >= 0) { ir(i); clearInterval(auto); }
    });
    flow.addEventListener('pointerdown', e => { inicioX = e.clientX; });
    flow.addEventListener('pointerup', e => {
      if (inicioX === null) return;
      const d = e.clientX - inicioX;
      inicioX = null;
      if (Math.abs(d) > 30) { ir(actual + (d < 0 ? 1 : -1)); clearInterval(auto); }
    });
    ir(0);
    if (!reducir) auto = setInterval(() => ir(actual + 1), 3500);
  })();

  /* ---------- Línea de "Cómo funciona" ---------- */
  (function progreso() {
    const lista = $('[data-progress]');
    if (!lista) return;
    let pendiente = false;
    function medir() {
      pendiente = false;
      const r = lista.getBoundingClientRect();
      const centro = innerHeight * 0.6;
      const p = Math.min(1, Math.max(0, (centro - r.top) / r.height));
      lista.style.setProperty('--p', p.toFixed(3));
      [...lista.children].forEach(li => {
        li.classList.toggle('is-done', li.getBoundingClientRect().top < centro);
      });
    }
    addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(medir); } }, { passive: true });
    medir();
  })();

  /* ---------- Pestañas con indicador ---------- */
  (function pestanas() {
    const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
    const pill = $('.tabs-pill');
    function mover(tab) {
      if (!pill) return;
      pill.style.width = tab.offsetWidth + 'px';
      pill.style.transform = `translateX(${tab.offsetLeft - 5}px)`;
    }
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          const activa = t === tab;
          t.setAttribute('aria-selected', activa);
          document.getElementById(t.getAttribute('aria-controls')).hidden = !activa;
        });
        mover(tab);
      });
    });
    const activa = tabs.find(t => t.getAttribute('aria-selected') === 'true');
    if (activa) { mover(activa); addEventListener('resize', () => mover(tabs.find(t => t.getAttribute('aria-selected') === 'true'))); }
  })();

  /* ---------- Números que cuentan ---------- */
  const numeros = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && !reducir) {
    numeros.forEach(el => { el.textContent = '0'; });
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const fin = +e.target.dataset.countTo;
      const inicio = performance.now();
      (function paso(t) {
        const p = Math.min((t - inicio) / 1400, 1);
        e.target.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      })(inicio);
    }), { threshold: 0.6 });
    numeros.forEach(el => io.observe(el));
  }

  /* ---------- Cronómetro de descanso de ejemplo ---------- */
  const reloj = $('[data-rest-timer]');
  if (reloj && !reducir) {
    let s = 90;
    setInterval(() => {
      s = s <= 0 ? 90 : s - 1;
      reloj.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }
})();
