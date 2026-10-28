/* =========================================================
   MOTION.JS — movimiento ligado al scroll en todas las páginas
   (GSAP + ScrollTrigger)

   - Carga la figura 3D de la portada (si el celular la aguanta)
   - La portada se va con profundidad al bajar
   - Títulos que hacen zoom al aparecer
   - Grupos de tarjetas que se acercan desde el fondo
   - Manifiesto que se ilumina palabra por palabra  [data-manifiesto]
   - Tarjetas que pasan de costado                  [data-hscroll]
   - Parallax                                       [data-parallax="0.2"]

   Si el celular pide "reducir movimiento" o el CDN falla,
   todo se ve igual pero quieto. No hace falta editar este archivo.
   ========================================================= */

(function () {
  const perf = window.BC_PERF || { nivel: 'bajo', reducir: true };
  window.BC_HERO = { p: 0 };   // progreso del scroll de la portada (lo lee el 3D)

  /* ---------- 1. Figura 3D de la portada ---------- */
  // Se descarga después de que la página ya se ve, para que abra rápido.
  if (document.querySelector('.hero-3d') && perf.nivel !== 'bajo') {
    const cargar = () => import('../3d/hero3d.js?v=8').catch(err => {
      console.warn('El 3D no se pudo cargar; queda el dibujo plano.', err);
    });
    if (document.readyState === 'complete') cargar();
    else addEventListener('load', cargar);
  }

  if (!window.gsap || !window.ScrollTrigger || perf.reducir) return;
  document.documentElement.classList.add('gsap-on');
  const conBlur = perf.nivel === 'alto';   // el desenfoque es caro: solo en celulares potentes
  seccionesFijas();   // ver 6 y 7 (funciones de más abajo)

  /* ---------- 2. La portada se va con profundidad ---------- */
  const portada = document.querySelector('.hero, .page-hero, .gx-hero');
  if (portada) {
    const contenido = portada.querySelector('.hero-inner, .gx-hero-inner, .wrap');
    const disparo = { trigger: portada, start: 'top top', end: 'bottom top', scrub: true };
    ScrollTrigger.create({ ...disparo, onUpdate: s => { window.BC_HERO.p = s.progress; } });
    if (contenido) {
      gsap.to(contenido, { yPercent: -22, scale: 0.9, opacity: 0, ease: 'none', scrollTrigger: disparo });
    }
  }

  /* ---------- 3. Títulos con zoom ---------- */
  // Los títulos de cierre llegan desde grandes (zoom hacia adentro);
  // el resto crece desde chico.
  gsap.utils.toArray('[data-zoom], .section .h2, .gx-closing-title').forEach(el => {
    const cierre = !!el.closest('.gx-closing');
    const desde = { scale: cierre ? 1.6 : 0.78, opacity: 0.1 };
    const hasta = { scale: 1, opacity: 1, ease: 'none' };
    if (conBlur) { desde.filter = 'blur(8px)'; hasta.filter = 'blur(0px)'; }
    gsap.fromTo(el, desde, {
      ...hasta,
      transformOrigin: cierre ? '50% 50%' : '0% 50%',
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 50%', scrub: true }
    });
  });

  /* ---------- 4. Grupos de tarjetas desde el fondo ---------- */
  gsap.utils.toArray('.train, .bento, .app-grid, .plans, .stats, .steps, .showcase, .wheel-wrap, .faq, .flow, .about-text, .compare, .demo-video').forEach(el => {
    gsap.fromTo(el,
      { rotateX: 16, y: 90, scale: 0.9, transformPerspective: 1100, transformOrigin: '50% 0%' },
      { rotateX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 45%', scrub: true } });
  });

  /* ---------- 4b. Saltos entre secciones ---------- */
  // Cada sección entra como una "ventana" que se abre: bordes redondeados
  // y recortada, hasta ocupar toda la pantalla.
  gsap.utils.toArray('main > .section:not(.is-sticky), main > .gx-closing').forEach(sec => {
    gsap.fromTo(sec,
      { clipPath: 'inset(7% 4% 0% 4% round 36px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: true } });
  });

  /* ---------- 5. Parallax y cintas gigantes ---------- */
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const v = parseFloat(el.dataset.parallax) || 0.2;
    gsap.fromTo(el, { yPercent: v * 50 }, {
      yPercent: -v * 50, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  gsap.utils.toArray('.mega-marquee').forEach(m => {
    m.querySelectorAll('.mm-row').forEach((fila, i) => {
      gsap.fromTo(fila, { xPercent: i % 2 ? -10 : 10 }, {
        xPercent: i % 2 ? 10 : -10, ease: 'none',
        scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });

  // Recalcula posiciones cuando terminan de cargar fuentes e imágenes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ---------- 6. Manifiesto que se ilumina ---------- */
  // Las secciones fijas (6 y 7) se crean antes que el resto:
  // así las demás animaciones calculan bien dónde empiezan.
  function seccionesFijas() {
  gsap.utils.toArray('[data-manifiesto]').forEach(seccion => {
    const texto = seccion.querySelector('.manifiesto-texto');
    if (!texto) return;
    texto.setAttribute('aria-label', texto.textContent.replace(/\s+/g, ' ').trim());
    // Separa en palabras sin perder las <em> (palabras en color)
    (function separar(nodo) {
      [...nodo.childNodes].forEach(hijo => {
        if (hijo.nodeType === 3) {
          const frag = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) return frag.appendChild(document.createTextNode(' '));
            const s = document.createElement('span');
            s.className = 'mw'; s.setAttribute('aria-hidden', 'true'); s.textContent = parte;
            frag.appendChild(s);
          });
          hijo.replaceWith(frag);
        } else if (hijo.nodeType === 1) separar(hijo);
      });
    })(texto);
    const palabras = texto.querySelectorAll('.mw');
    // La sección mide 2,6 pantallas y su contenido queda "pegado" (CSS sticky)
    // mientras las palabras se iluminan.
    seccion.classList.add('is-sticky');
    const linea = gsap.timeline({
      scrollTrigger: { trigger: seccion, start: 'top top', end: 'bottom bottom', scrub: true }
    });
    linea.fromTo(texto, { scale: 0.86 }, { scale: 1, ease: 'none', duration: 1 }, 0)
         .fromTo(palabras, { opacity: 0.12 }, { opacity: 1, stagger: 0.9 / palabras.length, ease: 'none', duration: 0.1 }, 0);
  });

  /* ---------- 7. Tarjetas que pasan de costado ---------- */
  gsap.utils.toArray('[data-hscroll]').forEach(seccion => {
    const pista = seccion.querySelector('.hs-track');
    if (!pista) return;
    seccion.classList.add('is-hscroll', 'is-sticky');
    const distancia = () => Math.max(0, pista.scrollWidth - document.documentElement.clientWidth + 40);
    // La sección se alarga lo que tienen que recorrer las tarjetas
    const ajustar = () => { seccion.style.height = (innerHeight + distancia()) + 'px'; };
    ajustar();
    ScrollTrigger.addEventListener('refreshInit', ajustar);
    const barra = seccion.querySelector('.hs-bar i');
    gsap.to(pista, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: seccion,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: s => { if (barra) barra.style.transform = `scaleX(${s.progress})`; }
      }
    });
  });
  }
})();
