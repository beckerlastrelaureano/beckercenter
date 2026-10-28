/* =========================================================
   FX.JS — efectos animados e interactivos
   Inspirados en los efectos tipo "React Bits", hechos sin
   librerías y con los colores de la marca.

   Cómo se usan (en el HTML):
   - <canvas data-fx="liquid">    fondo líquido que sigue el dedo
   - <canvas data-fx="lightfall"> lluvia de luces
   - data-split                   el texto aparece palabra por palabra
   - data-tilt                    la tarjeta se inclina en 3D
   - data-magnet                  el botón se acerca al mouse
   - .shiny                       texto con brillo que pasa

   No hace falta editar este archivo.
   ========================================================= */

(function () {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactil = matchMedia('(hover: none)').matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  // ¿Está el sitio en modo claro?
  function modoClaro() {
    const t = document.documentElement.dataset.theme;
    if (t) return t === 'light';
    return matchMedia('(prefers-color-scheme: light)').matches;
  }

  // Ejecuta una animación solo mientras el elemento se ve en pantalla
  function mientrasSeVea(el, alEntrar, alSalir) {
    if (!('IntersectionObserver' in window)) return alEntrar();
    new IntersectionObserver(([e]) => (e.isIntersecting ? alEntrar() : alSalir()))
      .observe(el);
  }

  /* =======================================================
     1. FONDO LÍQUIDO (manchas de luz que siguen el dedo)
     Se dibuja en baja resolución y el navegador lo agranda:
     así queda suave y no consume batería.
     ======================================================= */
  function liquido(canvas) {
    const ctx = canvas.getContext('2d');
    const ESCALA = 0.22;                      // resolución interna (22%)
    const colores = [[76, 116, 116], [127, 169, 167], [47, 111, 110], [159, 211, 207]];
    let w, h, raf = 0, activo = false, t = 0;
    const puntero = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4, fuerza: 0 };

    const manchas = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0016, vy: (Math.random() - 0.5) * 0.0016,
      r: 0.2 + Math.random() * 0.16,
      c: colores[i % colores.length],
      fase: Math.random() * 6.28
    }));
    const ondas = [];   // círculos que deja el dedo al moverse

    function medir() {
      const r = canvas.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.round(r.width * ESCALA));
      h = canvas.height = Math.max(1, Math.round(r.height * ESCALA));
    }

    function dibujar() {
      t += 1;
      const claro = modoClaro();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = claro ? 'source-over' : 'lighter';
      const alfa = claro ? 0.16 : 0.2;
      const lado = Math.max(w, h);

      // El puntero se mueve con suavidad hacia el dedo
      puntero.x += (puntero.tx - puntero.x) * 0.06;
      puntero.y += (puntero.ty - puntero.y) * 0.06;
      puntero.fuerza *= 0.985;

      manchas.forEach(m => {
        // Movimiento propio + atracción hacia el dedo
        m.x += m.vx + Math.sin(t * 0.004 + m.fase) * 0.0008;
        m.y += m.vy + Math.cos(t * 0.005 + m.fase) * 0.0008;
        m.x += (puntero.x - m.x) * 0.004 * (0.4 + puntero.fuerza);
        m.y += (puntero.y - m.y) * 0.004 * (0.4 + puntero.fuerza);
        if (m.x < -0.2 || m.x > 1.2) m.vx *= -1;
        if (m.y < -0.2 || m.y > 1.2) m.vy *= -1;

        const g = ctx.createRadialGradient(m.x * w, m.y * h, 0, m.x * w, m.y * h, m.r * lado);
        g.addColorStop(0, `rgba(${m.c},${alfa})`);
        g.addColorStop(1, `rgba(${m.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // Mancha que sigue al dedo
      const gp = ctx.createRadialGradient(puntero.x * w, puntero.y * h, 0, puntero.x * w, puntero.y * h, 0.22 * lado);
      gp.addColorStop(0, `rgba(159,211,207,${(claro ? 0.14 : 0.22) * (0.5 + puntero.fuerza)})`);
      gp.addColorStop(1, 'rgba(159,211,207,0)');
      ctx.fillStyle = gp;
      ctx.fillRect(0, 0, w, h);

      // Ondas
      for (let i = ondas.length - 1; i >= 0; i--) {
        const o = ondas[i];
        o.r += 0.6; o.a *= 0.94;
        if (o.a < 0.01) { ondas.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(200,235,232,${o.a})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(o.x * w, o.y * h, o.r, 0, 6.28); ctx.stroke();
      }

      if (activo) raf = requestAnimationFrame(dibujar);
    }

    const zona = canvas.parentElement;
    zona.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      puntero.tx = (e.clientX - r.left) / r.width;
      puntero.ty = (e.clientY - r.top) / r.height;
      puntero.fuerza = Math.min(1.2, puntero.fuerza + 0.08);
      if (Math.random() < 0.25 && ondas.length < 12) ondas.push({ x: puntero.tx, y: puntero.ty, r: 2, a: 0.5 });
    }, { passive: true });
    zona.addEventListener('pointerdown', e => {
      const r = canvas.getBoundingClientRect();
      ondas.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r: 2, a: 0.9 });
      puntero.fuerza = 1.2;
    }, { passive: true });

    medir();
    addEventListener('resize', medir);
    if (reducir) { dibujar(); return; }
    mientrasSeVea(canvas,
      () => { if (!activo) { activo = true; raf = requestAnimationFrame(dibujar); } },
      () => { activo = false; cancelAnimationFrame(raf); });
  }

  /* =======================================================
     2. LLUVIA DE LUCES (rayos que caen)
     ======================================================= */
  function lluvia(canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, raf = 0, activo = false;
    let px = -999, py = -999;
    let rayos = [];

    function nuevo(alInicio) {
      return {
        x: Math.random() * w,
        y: alInicio ? Math.random() * h : -Math.random() * h * 0.5,
        v: (1.2 + Math.random() * 3.2) * DPR,
        largo: (60 + Math.random() * 220) * DPR,
        ancho: (0.6 + Math.random() * 1.6) * DPR,
        a: 0.25 + Math.random() * 0.6
      };
    }
    function medir() {
      const r = canvas.getBoundingClientRect();
      w = canvas.width = Math.round(r.width * DPR);
      h = canvas.height = Math.round(r.height * DPR);
      const cantidad = Math.round(Math.min(90, r.width / 7));
      rayos = Array.from({ length: cantidad }, () => nuevo(true));
    }
    function dibujar() {
      const claro = modoClaro();
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = claro ? 'source-over' : 'lighter';
      const base = claro ? '63,100,100' : '127,169,167';
      rayos.forEach((r, i) => {
        // Los rayos cerca del dedo brillan y aceleran
        const cerca = Math.max(0, 1 - Math.hypot(r.x - px, r.y - py) / (160 * DPR));
        r.y += r.v * (1 + cerca * 2.5);
        if (r.y - r.largo > h) rayos[i] = nuevo(false);
        const g = ctx.createLinearGradient(r.x, r.y - r.largo, r.x, r.y);
        g.addColorStop(0, `rgba(${base},0)`);
        g.addColorStop(0.85, `rgba(${base},${r.a * 0.7 + cerca * 0.3})`);
        g.addColorStop(1, claro ? `rgba(47,85,85,${r.a})` : `rgba(235,250,248,${Math.min(1, r.a + cerca)})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = r.ancho + cerca * 1.5 * DPR;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r.x, r.y - r.largo); ctx.lineTo(r.x, r.y); ctx.stroke();
      });
      if (activo) raf = requestAnimationFrame(dibujar);
    }
    const zona = canvas.parentElement;
    zona.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) * DPR; py = (e.clientY - r.top) * DPR;
    }, { passive: true });
    zona.addEventListener('pointerleave', () => { px = py = -999; });

    medir();
    addEventListener('resize', medir);
    if (reducir) { dibujar(); return; }
    mientrasSeVea(canvas,
      () => { if (!activo) { activo = true; raf = requestAnimationFrame(dibujar); } },
      () => { activo = false; cancelAnimationFrame(raf); });
  }

  /* =======================================================
     3. TEXTO QUE APARECE PALABRA POR PALABRA (desenfoque)
     ======================================================= */
  function dividir(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    let n = 0;
    (function recorrer(nodo) {
      [...nodo.childNodes].forEach(hijo => {
        if (hijo.nodeType === 3) {
          const frag = document.createDocumentFragment();
          hijo.textContent.split(/(\s+)/).forEach(parte => {
            if (!parte) return;
            if (/^\s+$/.test(parte)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'word';
            s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--w', n++);
            s.textContent = parte;
            frag.appendChild(s);
          });
          hijo.replaceWith(frag);
        } else if (hijo.nodeType === 1) {
          recorrer(hijo);
        }
      });
    })(el);
    el.classList.add('is-split');
    const ver = () => el.classList.add('is-in');
    if (reducir || !('IntersectionObserver' in window)) return ver();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { ver(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
  }

  /* =======================================================
     4. TARJETAS QUE SE INCLINAN EN 3D (con reflejo)
     ======================================================= */
  function inclinar(el) {
    const max = +el.dataset.tilt || 10;
    let raf = 0;
    function mover(e) {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg');
        el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%');
        el.classList.add('is-tilting');
      });
    }
    function soltar() {
      cancelAnimationFrame(raf);
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    }
    el.addEventListener('pointermove', mover, { passive: true });
    el.addEventListener('pointerleave', soltar);
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', soltar);
  }

  /* =======================================================
     5. BOTONES MAGNÉTICOS (solo con mouse)
     ======================================================= */
  function iman(el) {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  /* ---------- Arranque ---------- */
  document.querySelectorAll('canvas[data-fx="liquid"]').forEach(liquido);
  document.querySelectorAll('canvas[data-fx="lightfall"]').forEach(lluvia);
  document.querySelectorAll('[data-split]').forEach(dividir);
  if (!reducir) document.querySelectorAll('[data-tilt]').forEach(inclinar);
  if (!reducir && !tactil) document.querySelectorAll('[data-magnet]').forEach(iman);
})();
