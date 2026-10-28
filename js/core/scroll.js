/* =========================================================
   SCROLL.JS — scroll suave (Lenis) + animaciones de scroll (GSAP)
   - Con mouse o trackpad el scroll se vuelve suave.
   - En el celular se deja el scroll natural del dedo.
   - Conecta Lenis con ScrollTrigger para que las animaciones
     ligadas al scroll vayan sincronizadas.
   No hace falta editar este archivo.
   ========================================================= */

(function () {
  const perf = window.BC_PERF || { reducir: false };
  if (!window.gsap || !window.ScrollTrigger) return;   // si el CDN falla, el sitio sigue andando
  gsap.registerPlugin(ScrollTrigger);

  if (perf.reducir || !window.Lenis) return;

  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    syncTouch: false          // el dedo mantiene el scroll nativo del celular
  });
  window.BC_LENIS = lenis;

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Los links a secciones (#algo) también se desplazan suave
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const destino = document.querySelector(a.getAttribute('href'));
    if (!destino) return;
    e.preventDefault();
    lenis.scrollTo(destino, { offset: -60 });
  });
})();
