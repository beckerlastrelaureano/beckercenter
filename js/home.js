/* =========================================================
   HOME.JS — animaciones de la página de Inicio
   - Carga el monograma 3D (solo si el celular lo aguanta)
   - Al bajar, el contenido del hero se va con profundidad
   No hace falta editar este archivo para cambiar textos.
   ========================================================= */

(function () {
  const perf = window.BC_PERF || { nivel: 'bajo', reducir: true };
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Progreso del scroll del hero (0 arriba, 1 al terminar). Lo lee el 3D.
  window.BC_HERO = { p: 0 };

  /* ---------- Monograma 3D ---------- */
  // Se carga después de que la página ya se ve, para que abra rápido.
  if (perf.nivel !== 'bajo') {
    const cargar = () => import('./3d/hero-logo.js?v=5').catch(err => {
      console.warn('El 3D no se pudo cargar; queda el logo plano.', err);
    });
    if (document.readyState === 'complete') cargar();
    else addEventListener('load', cargar);
  }

  /* ---------- Salida del hero con profundidad ---------- */
  if (window.gsap && window.ScrollTrigger && !perf.reducir) {
    const disparador = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };

    ScrollTrigger.create({ ...disparador, onUpdate: s => { window.BC_HERO.p = s.progress; } });

    gsap.to('.hero-inner', {
      yPercent: -22,
      scale: 0.92,
      opacity: 0,
      ease: 'none',
      scrollTrigger: disparador
    });
  }
})();
