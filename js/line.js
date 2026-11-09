/* =========================================================
   LINE.JS — vidriera de Becker Line
   Productos, precios y fotos: editá la lista PRODUCTOS de abajo.
   ========================================================= */
(function () {
// ─── DATOS QUE PODÉS EDITAR ───────────────────────────────
// Número de WhatsApp que recibe los pedidos (con código de país, sin + ni espacios).
const WHATSAPP = (window.BECKER && window.BECKER.whatsapp) || "5492954574231";

// Productos y precios de EJEMPLO. Reemplazalos por los reales.
// coleccion: "line" (entrenar) o "club" (clásica). Cada una tiene su muro en line.html.
// Una prenda con un solo color lleva foto + color; con varios colores lleva la lista colores
// (nombre, foto y muestra = el color del circulito para elegirlo).
const PRODUCTOS = [
  { coleccion: "line", id: "buzo-base", nombre: "Buzo Base", foto: "img/line/buzo-base.jpg", precio: 48000, color: "Negro", talles: ["S", "M", "L", "XL"], detalle: "Algodón pesado con capucha." },
  { coleccion: "line", id: "musculosa-line", nombre: "Musculosa Line", foto: "img/line/musculosa-line.jpg", precio: 22000, color: "Hueso", talles: ["S", "M", "L", "XL"], detalle: "Corte amplio para entrenar." },
  { coleccion: "line", id: "short-train", nombre: "Short Train", foto: "img/line/short-train.jpg", precio: 28000, color: "Petróleo", talles: ["S", "M", "L", "XL"], detalle: "Liviano, con cordón." },
  { coleccion: "line", id: "gorra-monograma", nombre: "Gorra Monograma", foto: "img/line/gorra-monograma.jpg", precio: 18000, color: "Negro", talles: ["Único"], detalle: "Visera curva y ajuste trasero." },
  { coleccion: "line", id: "buzo-linea", nombre: "Buzo Línea", foto: "img/line/buzo-linea.jpg", precio: 52000, color: "Hueso", talles: ["S", "M", "L", "XL"], detalle: "Línea petróleo en las mangas." },

  { coleccion: "club", id: "polo-riviera", nombre: "Polo Riviera", precio: 46000, talles: ["S", "M", "L", "XL"],
    detalle: "Punto de algodón con textura acanalada y cuello de tres botones. Fresco, se acomoda al cuerpo y queda impecable con un pantalón de pinzas. Monograma bordado tono sobre tono.",
    colores: [{ nombre: "Azul marino", foto: "img/line/club/polo-marino.jpg", muestra: "#1f2a3d" }, { nombre: "Verde oliva", foto: "img/line/club/polo-oliva.jpg", muestra: "#4f5733" }] },
  { coleccion: "club", id: "remera-pima", nombre: "Remera Pima", precio: 32000, talles: ["S", "M", "L", "XL"],
    detalle: "Algodón pima de punto pesado: suave al tacto, caída firme y un cuello que no se deforma con los lavados. La básica que se ve cara.",
    colores: [{ nombre: "Marfil", foto: "img/line/club/remera-marfil.jpg", muestra: "#ece6d8" }, { nombre: "Arena", foto: "img/line/club/remera-arena.jpg", muestra: "#c8a982" }] },
  { coleccion: "club", id: "pantalon-sastrero", nombre: "Pantalón Sastrero", precio: 68000, talles: ["38", "40", "42", "44", "46"],
    detalle: "Tiro alto, doble pinza y raya marcada. Pierna amplia que cae recta, en sarga de lana y algodón. Para estar bien vestido sin esfuerzo.",
    colores: [{ nombre: "Beige piedra", foto: "img/line/club/sastrero-beige.jpg", muestra: "#cdbfa5" }, { nombre: "Chocolate", foto: "img/line/club/sastrero-chocolate.jpg", muestra: "#4a3427" }] },
  { coleccion: "club", id: "chino-club", nombre: "Chino Club", precio: 56000, talles: ["38", "40", "42", "44", "46"],
    detalle: "Sarga de algodón con pierna recta, apenas entallada. Limpio y fresco: va del club al centro sin cambiarte.",
    colores: [{ nombre: "Blanco", foto: "img/line/club/chino-blanco.jpg", muestra: "#f1eee6" }, { nombre: "Gris perla", foto: "img/line/club/chino-gris.jpg", muestra: "#c6c6c1" }] },
  { coleccion: "club", id: "sueter-florencia", nombre: "Suéter Florencia", precio: 74000, talles: ["S", "M", "L", "XL"],
    detalle: "Merino de punto fino, liviano y abrigado a la vez. Cuello redondo y puños acanalados: puesto o sobre los hombros, siempre suma. Monograma bordado tono sobre tono.",
    colores: [{ nombre: "Topo", foto: "img/line/club/sueter-topo.jpg", muestra: "#8b7a6a" }, { nombre: "Crudo", foto: "img/line/club/sueter-crudo.jpg", muestra: "#e8e0cd" }] },
];
// Las prendas de un solo color se pasan al mismo formato que las de varios colores.
PRODUCTOS.forEach((p) => { if (!p.colores) p.colores = [{ nombre: p.color, foto: p.foto }]; });

const $ = (id) => document.getElementById(id);
const pesos = (n) => "$ " + n.toLocaleString("es-AR");
const sinMovimiento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pedido: se guarda en este navegador.
const CLAVE = "bc-line-pedido";
let pedido = [];
try { pedido = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch {}
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch {} };

// Muros: un nicho iluminado por prenda, uno por colección ([data-muro="line"] y [data-muro="club"]).
const nichos = PRODUCTOS.map((p, n) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "nicho";
  b.setAttribute("aria-label", `Ver ${p.nombre}`);
  const varios = p.colores.length > 1 ? `<small>${p.colores.length} colores</small>` : "";
  b.innerHTML = `<img src="${p.colores[0].foto}" alt="${p.nombre}, color ${p.colores[0].nombre}" width="1088" height="1456"><span>${p.nombre}${varios}</span>`;
  b.onclick = () => abrir(n);
  return b;
});
document.querySelectorAll("[data-muro]").forEach((muro) => {
  const propios = nichos.filter((_, n) => PRODUCTOS[n].coleccion === muro.dataset.muro);
  propios.forEach((b, i) => b.style.setProperty("--n", i));
  muro.replaceChildren(...propios);
});
// Prendas de la misma colección (para las flechas del detalle).
const mismaColeccion = (n) => PRODUCTOS.map((_, i) => i).filter((i) => PRODUCTOS[i].coleccion === PRODUCTOS[n].coleccion);

let actual = 0;
let color = 0;
let talle = null;

function mostrarColor(c) {
  color = c;
  const p = PRODUCTOS[actual], col = p.colores[c];
  $("det-foto").src = col.foto;
  $("det-foto").alt = `${p.nombre}, color ${col.nombre}`;
  $("det-color").textContent = col.nombre;
  $("det-colores").querySelectorAll("button").forEach((x, i) => x.setAttribute("aria-pressed", i === c));
}

function llenarDetalle(n) {
  actual = n;
  const p = PRODUCTOS[n];
  const lista = mismaColeccion(n);
  $("detalle").classList.toggle("es-club", p.coleccion === "club");
  $("det-nombre").textContent = p.nombre;
  $("det-texto").textContent = p.detalle;
  $("det-precio").textContent = pesos(p.precio);
  $("det-pos").textContent = `${lista.indexOf(n) + 1} / ${lista.length}`;
  // Circulitos de color (solo si la prenda tiene más de uno)
  $("det-colores").hidden = p.colores.length < 2;
  $("det-colores").replaceChildren(...p.colores.map((col, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.style.setProperty("--muestra", col.muestra || "#888");
    b.setAttribute("aria-label", col.nombre);
    b.title = col.nombre;
    b.onclick = () => {
      mostrarColor(i);
      if (!sinMovimiento()) $("det-foto").animate([{ opacity: .3 }, { opacity: 1 }], { duration: 280, easing: "ease-out" });
    };
    return b;
  }));
  mostrarColor(0);
  talle = p.talles.length === 1 ? p.talles[0] : null;
  $("det-talles").replaceChildren(...p.talles.map((t) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t;
    b.setAttribute("aria-pressed", t === talle);
    b.onclick = () => {
      talle = t;
      $("det-talles").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    };
    return b;
  }));
  $("ver-pedido").hidden = !pedido.length;
}

// Transformación que lleva la foto grande hasta la posición del nicho.
function desdeNicho(n) {
  const a = nichos[n].querySelector("img").getBoundingClientRect();
  const b = $("det-foto").getBoundingClientRect();
  return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
}

function abrir(n) {
  llenarDetalle(n);
  $("detalle").scrollTop = 0;
  $("detalle").showModal();
  if (sinMovimiento()) return;
  $("det-foto").animate(
    [{ transform: desdeNicho(n), transformOrigin: "0 0" }, { transform: "none", transformOrigin: "0 0" }],
    { duration: 620, easing: "cubic-bezier(.2,.7,.2,1)" },
  );
  $("det-panel").animate(
    [{ opacity: 0, transform: "translateX(24px)" }, { opacity: 1, transform: "none" }],
    { duration: 420, delay: 240, easing: "ease-out", fill: "backwards" },
  );
}

function cerrar() {
  if (sinMovimiento()) return $("detalle").close();
  $("det-panel").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
  const vuelta = $("det-foto").animate(
    [{ transform: "none", transformOrigin: "0 0" }, { transform: desdeNicho(actual), transformOrigin: "0 0" }],
    { duration: 460, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
  );
  vuelta.onfinish = () => {
    $("detalle").close();
    $("detalle").getAnimations({ subtree: true }).forEach((a) => a.cancel());
  };
}

function mover(paso) {
  const lista = mismaColeccion(actual);
  llenarDetalle(lista[(lista.indexOf(actual) + paso + lista.length) % lista.length]);
  if (sinMovimiento()) return;
  $("det-foto").animate([{ opacity: .25 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
}

$("agregar").onclick = () => {
  if (!talle) return avisar("Elegí un talle primero.");
  const p = PRODUCTOS[actual];
  const nombreColor = p.colores[color].nombre;
  const clave = `${p.id}|${nombreColor}|${talle}`;
  const item = pedido.find((i) => i.clave === clave);
  if (item) item.cantidad++;
  else pedido.push({ clave, id: p.id, color: nombreColor, talle, cantidad: 1 });
  actualizarPedido();
  $("ver-pedido").hidden = false;
  avisar(`${p.nombre} agregado.`);
};

function mensajeWhatsApp(items) {
  const lineas = items.map(({ p, i }) => `• ${i.cantidad} x ${p.nombre} (Talle ${i.talle}, ${colorDe(p, i).nombre}): ${pesos(p.precio * i.cantidad)}`);
  const total = items.reduce((s, { p, i }) => s + p.precio * i.cantidad, 0);
  return `Hola! Quiero hacer este pedido de Becker Line:\n\n${lineas.join("\n")}\n\nTotal: ${pesos(total)}`;
}

// Color elegido de cada ítem del pedido (los pedidos viejos no lo guardaban: va el primero).
const colorDe = (p, i) => p.colores.find((c) => c.nombre === i.color) || p.colores[0];

function actualizarPedido() {
  guardar();
  const items = pedido.map((i) => ({ i, p: PRODUCTOS.find((p) => p.id === i.id) })).filter((x) => x.p);
  const cuenta = items.reduce((s, x) => s + x.i.cantidad, 0);
  $("contador").textContent = cuenta;
  $("contador").hidden = !cuenta;
  $("total").textContent = pesos(items.reduce((s, { p, i }) => s + p.precio * i.cantidad, 0));
  const enviar = $("enviar");
  enviar.setAttribute("aria-disabled", !items.length);
  enviar.href = items.length ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensajeWhatsApp(items))}` : "#";
  if (!items.length) {
    $("pedido-lista").innerHTML = '<p class="vacio">Todavía no agregaste nada.</p>';
    return;
  }
  $("pedido-lista").replaceChildren(...items.map(({ p, i }) => {
    const fila = document.createElement("div");
    fila.className = "item";
    fila.innerHTML = `<img src="${colorDe(p, i).foto}" alt="" width="60" height="80">
      <div><strong>${p.nombre}</strong><small>Talle ${i.talle} · ${colorDe(p, i).nombre}<br>${pesos(p.precio * i.cantidad)}</small></div>
      <div class="cantidad"><button type="button" aria-label="Sacar uno">−</button><span>${i.cantidad}</span><button type="button" aria-label="Sumar uno">+</button></div>`;
    const [menos, mas] = fila.querySelectorAll("button");
    menos.onclick = () => {
      i.cantidad--;
      if (!i.cantidad) pedido = pedido.filter((x) => x !== i);
      actualizarPedido();
    };
    mas.onclick = () => { i.cantidad++; actualizarPedido(); };
    return fila;
  }));
}

let espera;
function avisar(texto) {
  const aviso = $("aviso");
  aviso.textContent = texto;
  aviso.classList.add("visible");
  // El aviso va dentro del diálogo abierto para que se vea por encima.
  ($("pedido").open ? $("pedido") : $("detalle").open ? $("detalle") : document.body).append(aviso);
  clearTimeout(espera);
  espera = setTimeout(() => { aviso.classList.remove("visible"); document.body.append(aviso); }, 1800);
}

$("abrir-pedido").onclick = () => $("pedido").showModal();
$("ver-pedido").onclick = () => $("pedido").showModal();
$("cerrar-pedido").onclick = () => $("pedido").close();
$("pedido").onclick = (e) => { if (e.target === $("pedido")) $("pedido").close(); };
$("cerrar-detalle").onclick = cerrar;
$("anterior").onclick = () => mover(-1);
$("siguiente").onclick = () => mover(1);
$("detalle").addEventListener("cancel", (e) => { e.preventDefault(); cerrar(); });
$("detalle").addEventListener("keydown", (e) => {
  if ($("pedido").open) return;
  if (e.key === "ArrowLeft") mover(-1);
  if (e.key === "ArrowRight") mover(1);
});

actualizarPedido();

})();
