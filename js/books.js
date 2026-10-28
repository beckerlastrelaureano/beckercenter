/* =========================================================
   BOOKS.JS — catálogo de Becker Books
   Lee los libros de data/books.json y arma:
   - las tarjetas
   - la búsqueda y los filtros por categoría
   - el pedido que se envía por WhatsApp
   Para cambiar libros o precios NO edites este archivo:
   editá data/books.json (ver data/LEEME.md).
   ========================================================= */

(function () {
  const cfg = window.BECKER || {};
  const POR_PAGINA = 24;               // cuántos libros se muestran antes de "Ver más"
  const $ = s => document.querySelector(s);

  const grid = $('[data-grid]');
  const chipsBox = $('[data-chips]');
  const search = $('[data-search]');
  const onlyStock = $('[data-only-stock]');
  const countEl = $('[data-count]');
  const emptyEl = $('[data-empty]');
  const moreBtn = $('[data-more]');

  let libros = [];
  let categorias = [];
  const state = { q: '', cat: 'Todos', stock: false, visibles: POR_PAGINA };

  /* ---------- Ayudas ---------- */
  const precio = n => '$' + Number(n || 0).toLocaleString('es-AR');
  const normal = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Pedido (se guarda en el navegador del visitante) ---------- */
  let pedido = {};
  try { pedido = JSON.parse(localStorage.getItem('bc-pedido')) || {}; } catch (e) {}
  const guardarPedido = () => { try { localStorage.setItem('bc-pedido', JSON.stringify(pedido)); } catch (e) {} };

  function cambiarCantidad(id, delta) {
    const n = (pedido[id] || 0) + delta;
    if (n <= 0) delete pedido[id]; else pedido[id] = n;
    guardarPedido();
    actualizarPedido();
    // Pequeño salto del botón del pedido al agregar un libro
    if (delta > 0) {
      document.querySelectorAll('.cart-btn, [data-cart-bar]').forEach(el => {
        el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump');
      });
    }
    // Actualiza solo la tarjeta tocada, sin redibujar todo
    const card = grid.querySelector(`[data-id="${id}"] .book-buy`);
    if (card) card.innerHTML = botonCompra(id);
  }

  function lineasPedido() {
    return Object.entries(pedido)
      .map(([id, q]) => ({ libro: libros.find(l => l.id === id), q }))
      .filter(l => l.libro);
  }

  function actualizarPedido() {
    const lineas = lineasPedido();
    const cantidad = lineas.reduce((s, l) => s + l.q, 0);
    const total = lineas.reduce((s, l) => s + l.q * l.libro.precio, 0);

    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = cantidad; el.hidden = !cantidad; });
    const bar = $('[data-cart-bar]');
    bar.hidden = !cantidad;
    $('[data-cart-bar-count]').textContent = cantidad === 1 ? '1 libro' : cantidad + ' libros';
    $('[data-cart-bar-total]').textContent = precio(total);
    $('[data-cart-total]').textContent = precio(total);

    const lista = $('[data-cart-list]');
    lista.innerHTML = lineas.length ? lineas.map(({ libro, q }) => `
      <div class="cart-line">
        <div>
          <b>${esc(libro.titulo)}</b>
          <small>${precio(libro.precio)} c/u</small>
        </div>
        <div class="stepper">
          <button type="button" data-dec="${libro.id}" aria-label="Quitar uno">−</button>
          <span>${q}</span>
          <button type="button" data-inc="${libro.id}" aria-label="Agregar uno">+</button>
        </div>
      </div>`).join('') : '<p class="sheet-empty">Tu pedido está vacío. Agregá libros desde el catálogo.</p>';

    // Mensaje que llega a tu WhatsApp con el detalle del pedido
    const msg = ['Hola Becker, quiero hacer este pedido en Becker Books:', '',
      ...lineas.map(({ libro, q }) => `• ${q} x ${libro.titulo}${libro.autor ? ' (' + libro.autor + ')' : ''}: ${precio(libro.precio * q)}`),
      '', 'Total: ' + precio(total)].join('\n');
    const send = $('[data-cart-send]');
    send.href = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
    send.target = '_blank';
    send.rel = 'noopener';
    send.classList.toggle('is-disabled', !lineas.length);
  }

  /* ---------- Panel del pedido ---------- */
  const sheet = $('[data-cart]');
  function abrirPedido() { sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add('is-open')); document.body.style.overflow = 'hidden'; }
  function cerrarPedido() {
    sheet.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { sheet.hidden = true; }, 350);
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-cart-open]')) abrirPedido();
    else if (e.target.closest('[data-cart-close]')) cerrarPedido();
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) cambiarCantidad(inc.dataset.inc, 1);
    if (dec) cambiarCantidad(dec.dataset.dec, -1);
    const more = e.target.closest('[data-desc-toggle]');
    if (more) {
      const card = more.closest('.book');
      const open = card.classList.toggle('is-expanded');
      more.textContent = open ? 'Ver menos' : 'Ver más';
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) cerrarPedido(); });

  /* ---------- Tarjetas ---------- */
  function botonCompra(id) {
    const q = pedido[id];
    if (!q) return `<button class="add-btn" type="button" data-inc="${id}">Agregar</button>`;
    return `<div class="stepper is-active">
        <button type="button" data-dec="${id}" aria-label="Quitar uno">−</button>
        <span>${q}</span>
        <button type="button" data-inc="${id}" aria-label="Agregar uno">+</button>
      </div>`;
  }

  function tarjeta(l, i) {
    const portada = l.portada
      ? `<img src="${esc(l.portada)}" alt="Tapa de ${esc(l.titulo)}" loading="lazy" decoding="async" width="300" height="450">`
      : `<div class="cover-fallback"><span>${esc(l.titulo)}</span></div>`;
    const estado = l.estado === 'disponible'
      ? '<span class="badge is-stock">En stock</span>'
      : '<span class="badge">Por encargo</span>';
    return `
      <article class="card book tilt" data-tilt="6" data-id="${l.id}" style="--i:${i % POR_PAGINA}">
        <span class="glare" aria-hidden="true"></span>
        <div class="book-cover">${portada}</div>
        <div class="book-body">
          <div class="book-tags">${estado}${l.tapaDura ? '<span class="badge is-soft">Tapa dura</span>' : ''}</div>
          <h3>${esc(l.titulo)}</h3>
          ${l.autor ? `<p class="book-author">${esc(l.autor)}</p>` : ''}
          ${l.descripcion ? `<p class="book-desc">${esc(l.descripcion)}</p><button class="desc-toggle" type="button" data-desc-toggle>Ver más</button>` : ''}
          <div class="book-foot">
            <b class="price">${precio(l.precio)}</b>
            <div class="book-buy">${botonCompra(l.id)}</div>
          </div>
        </div>
      </article>`;
  }

  /* ---------- Filtros ---------- */
  function filtrados() {
    const q = normal(state.q);
    return libros.filter(l =>
      (state.cat === 'Todos' || l.categoria === state.cat) &&
      (!state.stock || l.estado === 'disponible') &&
      (!q || normal(l.titulo + ' ' + l.autor).includes(q))
    );
  }

  function dibujarChips() {
    const cuenta = {};
    libros.forEach(l => { cuenta[l.categoria] = (cuenta[l.categoria] || 0) + 1; });
    const lista = ['Todos', ...categorias.filter(c => cuenta[c])];
    chipsBox.innerHTML = lista.map(c => `
      <button type="button" class="chip" role="tab" aria-selected="${c === state.cat}" data-cat="${esc(c)}">
        ${esc(c)} <small>${c === 'Todos' ? libros.length : cuenta[c]}</small>
      </button>`).join('');
  }

  function dibujar() {
    const lista = filtrados();
    grid.innerHTML = lista.slice(0, state.visibles).map(tarjeta).join('');
    if (window.FX) window.FX.activar(grid);   // inclinación 3D (js/fx.js)
    countEl.textContent = lista.length === 1 ? '1 libro' : lista.length + ' libros';
    emptyEl.hidden = lista.length > 0;
    moreBtn.hidden = lista.length <= state.visibles;
  }

  chipsBox.addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (!chip) return;
    state.cat = chip.dataset.cat;
    state.visibles = POR_PAGINA;
    chipsBox.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-selected', c === chip));
    chip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    dibujar();
  });
  search.addEventListener('input', () => { state.q = search.value; state.visibles = POR_PAGINA; dibujar(); });
  onlyStock.addEventListener('change', () => { state.stock = onlyStock.checked; state.visibles = POR_PAGINA; dibujar(); });
  moreBtn.addEventListener('click', () => {
    const antes = state.visibles;
    state.visibles += POR_PAGINA;
    const lista = filtrados();
    grid.insertAdjacentHTML('beforeend', lista.slice(antes, state.visibles).map(tarjeta).join(''));
    if (window.FX) window.FX.activar(grid);
    moreBtn.hidden = lista.length <= state.visibles;
  });

  /* ---------- Carga del catálogo ---------- */
  fetch('data/books.json')
    .then(r => r.json())
    .then(data => {
      categorias = data.categorias || [];
      // Orden: destacados primero, después los que están en stock
      libros = (data.libros || [])
        .map((l, i) => ({ ...l, _i: i }))
        .sort((a, b) => (b.destacado - a.destacado) ||
          ((b.estado === 'disponible') - (a.estado === 'disponible')) || (a._i - b._i));
      dibujarChips();
      dibujar();
      actualizarPedido();
    })
    .catch(() => {
      grid.innerHTML = '<p class="empty">No se pudo cargar el catálogo. Si abriste el archivo directo desde la carpeta, usá un servidor local (ver data/LEEME.md).</p>';
    });
})();
