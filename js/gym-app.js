/* =========================================================
   GYM-APP.JS — interacciones de la página de Gym App
   - Precios de los planes y link de la demo (salen de js/config.js)
   - Funciones: el celular gira y cambia de pantalla al bajar
   - "Video" de la app: recorrido animado con las capturas
   - Capturas en 3D que se deslizan
   - Pestañas con indicador que se desliza
   No hace falta editar este archivo para cambiar textos.
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};
  const perf = window.BC_PERF || {};
  const quieto = !!perf.reducir;
  const $ = s => document.querySelector(s);

  /* ---------- Precios y link de la demo ---------- */
  document.querySelectorAll('[data-precio]').forEach(el => {
    const valor = cfg[el.dataset.precio];
    if (!valor) return;
    el.textContent = valor;
    const mes = el.nextElementSibling;
    if (mes) mes.hidden = false;
  });
  if (cfg.demoGymApp) document.querySelectorAll('[data-demo]').forEach(a => { a.href = cfg.demoGymApp; });

  /* ---------- Funciones con el celular que gira ---------- */
  (function funciones() {
    const seccion = $('[data-features]');
    if (!seccion) return;
    const articulos = [...seccion.querySelectorAll('.features-text article')];
    const img = seccion.querySelector('[data-feature-img]');
    const celular = seccion.querySelector('[data-feature-phone]');
    const puntos = [...seccion.querySelectorAll('.features-dots i')];
    let actual = -1;

    function mostrar(i) {
      if (i === actual) return;
      actual = i;
      articulos.forEach((a, j) => a.classList.toggle('is-on', j === i));
      puntos.forEach((p, j) => p.classList.toggle('is-on', j === i));
      const a = articulos[i];
      // Cambio de pantalla con un fundido
      img.classList.remove('is-on');
      setTimeout(() => {
        if (img.getAttribute('src') !== a.dataset.pantalla) img.src = a.dataset.pantalla;
        img.style.objectPosition = 'center ' + (a.dataset.foco || 'top');
        img.classList.add('is-on');
      }, 180);
    }

    if (window.gsap && window.ScrollTrigger && !quieto) {
      seccion.classList.add('is-sticky', 'is-steps');
      gsap.fromTo(celular,
        { rotateY: -32, rotateX: 10, transformPerspective: 1200 },
        {
          rotateY: 32, rotateX: -6, ease: 'none',
          scrollTrigger: {
            trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: 0.5,
            onUpdate: s => mostrar(Math.min(articulos.length - 1, Math.floor(s.progress * articulos.length)))
          }
        });
    } else {
      // Sin animaciones: todas las funciones en lista y el celular quieto
      articulos.forEach(a => a.classList.add('is-on'));
    }
    mostrar(0);
  })();

  /* ---------- "Video" de la app ---------- */
  (function video() {
    const caja = $('[data-video]');
    if (!caja) return;
    const tomas = [...caja.querySelectorAll('.dv-shot')];
    const toque = caja.querySelector('.dv-tap');
    const barra = $('[data-video-progress]');
    const pasos = [...document.querySelectorAll('[data-video-steps] li')];
    const boton = $('[data-video-play]');
    // Dónde "toca el dedo" en cada pantalla (porcentaje del ancho y alto)
    const guion = [
      { toma: 0, x: 50, y: 57, dur: 2800 },   // Entrar con el DNI
      { toma: 1, x: 50, y: 40, dur: 3200 },   // Tocar "Día 1"
      { toma: 2, x: 86, y: 34, dur: 3200 }    // Marcar una serie
    ];
    const total = guion.reduce((s, g) => s + g.dur, 0);
    let t = 0, ultimo = 0, andando = !quieto, visible = false, raf = 0, paso = -1;

    function ir(i) {
      paso = i;
      tomas.forEach((im, j) => im.classList.toggle('is-on', j === guion[i].toma));
      pasos.forEach((li, j) => li.classList.toggle('is-on', j === i));
      toque.classList.remove('is-tap');
      toque.style.left = guion[i].x + '%';
      toque.style.top = guion[i].y + '%';
    }
    function cuadro(ahora) {
      if (!ultimo) ultimo = ahora;
      t = (t + (ahora - ultimo)) % total;
      ultimo = ahora;
      // Qué paso del guion toca ahora
      let i = 0, inicio = 0;
      while (i < guion.length - 1 && t >= inicio + guion[i].dur) { inicio += guion[i].dur; i++; }
      if (i !== paso) ir(i);
      // El dedo toca cerca del final de cada paso
      toque.classList.toggle('is-tap', t - inicio > guion[i].dur - 900);
      barra.style.transform = `scaleX(${t / total})`;
      if (andando && visible) raf = requestAnimationFrame(cuadro);
    }
    function arrancar() { if (andando && visible) { ultimo = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro); } }

    boton.addEventListener('click', () => {
      andando = !andando;
      caja.classList.toggle('is-paused', !andando);
      boton.setAttribute('aria-label', andando ? 'Pausar video' : 'Reproducir video');
      if (andando) arrancar(); else cancelAnimationFrame(raf);
    });
    caja.classList.toggle('is-paused', !andando);
    if (!andando) boton.setAttribute('aria-label', 'Reproducir video');
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? arrancar() : cancelAnimationFrame(raf); }, { threshold: 0.3 }).observe(caja);
    ir(0);
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
    if (!quieto) auto = setInterval(() => ir(actual + 1), 3500);
  })();

  /* ---------- Pestañas con indicador ---------- */
  (function pestanas() {
    const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
    const pill = $('.tabs-pill');
    function mover(tab) {
      if (!pill || !tab) return;
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
    const activa = () => tabs.find(t => t.getAttribute('aria-selected') === 'true');
    mover(activa());
    addEventListener('resize', () => mover(activa()));
  })();
})();
