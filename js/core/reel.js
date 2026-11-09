/* =========================================================
   REEL.JS — videos verticales de las apps (Gym App, Perchero)
   - [data-reel-player]: video dentro de la página. Se toca y arranca con sonido.
     Si tiene data-pasos="#lista", marca el paso de la lista según el segundo
     del video (cada <li data-t="12"> se enciende desde ese segundo).
   - [data-reel="img/video/x.mp4"]: botón que abre el video en pantalla completa.
     data-reel-poster = imagen de portada (opcional).
   ========================================================= */
(function () {
  const lenis = () => window.BC_LENIS;

  /* ---------- Videos dentro de la página ---------- */
  document.querySelectorAll('[data-reel-player]').forEach(caja => {
    const video = caja.querySelector('video');
    const boton = caja.querySelector('.reel-play');
    const lista = caja.dataset.pasos ? document.querySelector(caja.dataset.pasos) : null;
    const pasos = lista ? [...lista.querySelectorAll('[data-t]')] : [];

    function reproducir() {
      video.muted = false;
      video.controls = true;
      video.play().catch(() => {});
    }
    boton.addEventListener('click', reproducir);
    caja.reproducir = reproducir;
    video.addEventListener('play', () => caja.classList.add('is-playing'));
    video.addEventListener('pause', () => caja.classList.remove('is-playing'));
    video.addEventListener('ended', () => { video.controls = false; caja.classList.remove('is-playing'); });

    if (pasos.length) {
      video.addEventListener('timeupdate', () => {
        const t = video.currentTime;
        let activo = 0;
        pasos.forEach((li, i) => { if (t >= parseFloat(li.dataset.t)) activo = i; });
        pasos.forEach((li, i) => li.classList.toggle('is-on', i === activo));
      });
      // Tocar un paso salta a ese momento del video
      pasos.forEach(li => li.addEventListener('click', () => {
        video.currentTime = parseFloat(li.dataset.t);
        reproducir();
      }));
    }

    // Si sale de la pantalla, se pausa
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused) video.pause(); }, { threshold: 0.25 }).observe(caja);
    }
  });

  /* ---------- Video en pantalla completa ---------- */
  let modal, videoModal;
  function crearModal() {
    modal = document.createElement('dialog');
    modal.className = 'reel-modal';
    modal.setAttribute('aria-label', 'Video');
    modal.innerHTML = '<button class="reel-cerrar" type="button" aria-label="Cerrar video">×</button><video controls playsinline preload="auto"></video>';
    document.body.appendChild(modal);
    videoModal = modal.querySelector('video');
    modal.querySelector('.reel-cerrar').addEventListener('click', cerrar);
    modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
    // Tecla Escape: el navegador cierra el cuadro; igual frenamos el video
    modal.addEventListener('cancel', () => videoModal.pause());
    modal.addEventListener('close', () => {
      videoModal.pause();
      if (lenis()) lenis().start();
    });
  }
  function cerrar() {
    videoModal.pause();
    modal.close();
    if (lenis()) lenis().start();
  }
  function abrir(src, poster) {
    if (!modal) crearModal();
    if (videoModal.getAttribute('src') !== src) {
      videoModal.src = src;
      if (poster) videoModal.poster = poster; else videoModal.removeAttribute('poster');
    }
    if (lenis()) lenis().stop();
    modal.showModal();
    videoModal.currentTime = 0;
    videoModal.play().catch(() => {});
  }

  document.addEventListener('click', e => {
    const disparador = e.target.closest('[data-reel]');
    if (!disparador) return;
    e.preventDefault();
    abrir(disparador.dataset.reel, disparador.dataset.reelPoster);
  });
})();
