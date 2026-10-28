/* =========================================================
   HERO-LOGO.JS — monograma "IB" en 3D para el Inicio (Three.js)
   - Metal oscuro con volumen dentro del anillo verde azulado
   - Polvo de partículas alrededor
   - Gira siguiendo el dedo, el mouse o la inclinación del celular
   - Al bajar, el logo se aleja y las partículas se dispersan
   - Si el celular anda lento, se simplifica solo

   Lo carga js/home.js solo en niveles "alto" y "medio".
   No hace falta editar este archivo.
   ========================================================= */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const hero = document.querySelector('.hero');
const canvas = document.querySelector('.hero-3d');
const lugar = document.querySelector('.hero .hero-inner > .mark');   // el 3D ocupa el lugar del logo plano
const perf = window.BC_PERF;
const alto = perf.nivel === 'alto';

/* ---------- Escena, cámara y renderizador ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: alto, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, alto ? 1.75 : 1));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 10);

// Reflejos de estudio para que el metal brille de verdad
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const luzFrente = new THREE.DirectionalLight(0xffffff, 1.4);
luzFrente.position.set(3, 4, 6);
scene.add(luzFrente);
const luzBorde = new THREE.DirectionalLight(0x7fa9a7, 3.2);   // luz verde azulada desde atrás
luzBorde.position.set(-4, 1.5, -5);
scene.add(luzBorde);

/* ---------- Monograma "IB" (mismas medidas que el logo) ---------- */
// El logo original mide 100 x 100. Se pasa a unidades 3D.
const S = 1 / 30;
const P = (x, y) => new THREE.Vector2((x - 50) * S, (50 - y) * S);

function rectangulo(x1, y1, x2, y2) {
  const a = P(x1, y1), b = P(x2, y2);
  const s = new THREE.Shape();
  s.moveTo(a.x, a.y); s.lineTo(b.x, a.y); s.lineTo(b.x, b.y); s.lineTo(a.x, b.y); s.closePath();
  return s;
}
// Media rosca del lado derecho (las "pancitas" de la B)
function mediaRosca(cx, cy, rExt, rInt) {
  const c = P(cx, cy);
  const s = new THREE.Shape();
  s.absarc(c.x, c.y, rExt * S, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(c.x, c.y - rInt * S);
  s.absarc(c.x, c.y, rInt * S, -Math.PI / 2, Math.PI / 2, false);
  s.closePath();
  return s;
}

const formas = [
  rectangulo(31, 30, 37, 70),     // la "I"
  rectangulo(42, 30, 55, 36),     // B: línea de arriba
  mediaRosca(55, 41, 11, 5),      // B: pancita de arriba
  rectangulo(44, 46, 57, 52),     // B: línea del medio
  mediaRosca(57, 58, 12, 6),      // B: pancita de abajo
  rectangulo(42, 64, 57, 70)      // B: línea de abajo
];
const PROF = 0.34;
const geoLogo = new THREE.ExtrudeGeometry(formas, {
  depth: PROF,
  curveSegments: alto ? 28 : 14,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.022,
  bevelSegments: alto ? 3 : 1
});
geoLogo.translate(0, 0, -PROF / 2);

const matLogo = alto
  ? new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 })
  : new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.28 });
const logo = new THREE.Mesh(geoLogo, matLogo);

// Anillo del logo, con brillo propio
const matAnillo = new THREE.MeshStandardMaterial({ color: 0x4c7474, emissive: 0x4c7474, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
const anillo = new THREE.Mesh(new THREE.TorusGeometry(46 * S, 0.05, 24, alto ? 180 : 90), matAnillo);

// Dos órbitas finas que giran alrededor (dan profundidad)
const matOrbita = new THREE.MeshBasicMaterial({ color: 0x7fa9a7, transparent: true, opacity: 0.35 });
const orbita1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 8, 160), matOrbita);
const orbita2 = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.004, 8, 160), matOrbita);
orbita1.rotation.x = 1.15;
orbita2.rotation.set(1.4, 0.5, 0);

const grupo = new THREE.Group();     // lo que gira con el dedo
grupo.add(logo, anillo, orbita1, orbita2);
const base = new THREE.Group();      // lo que se ubica en pantalla
base.add(grupo);
scene.add(base);

/* ---------- Partículas ---------- */
const CANT = alto ? 1400 : 600;
const pos = new Float32Array(CANT * 3);
for (let i = 0; i < CANT; i++) {
  const r = 2.3 + Math.pow(Math.random(), 0.7) * 4.5;
  const t = Math.random() * Math.PI * 2;
  const f = Math.acos(2 * Math.random() - 1);
  pos[i * 3] = r * Math.sin(f) * Math.cos(t);
  pos[i * 3 + 1] = r * Math.sin(f) * Math.sin(t) * 0.75;
  pos[i * 3 + 2] = r * Math.cos(f);
}
const geoPolvo = new THREE.BufferGeometry();
geoPolvo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

// Puntito redondo y suave
const tex = (function () {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const matPolvo = new THREE.PointsMaterial({ size: 0.06, map: tex, transparent: true, depthWrite: false, opacity: 0.85 });
const polvo = new THREE.Points(geoPolvo, matPolvo);
base.add(polvo);

/* ---------- Colores según modo claro / oscuro ---------- */
function modoClaro() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'light' : matchMedia('(prefers-color-scheme: light)').matches;
}
function aplicarTema() {
  const claro = modoClaro();
  matLogo.color.set(claro ? 0x2b3535 : 0xdfe7e6);       // grafito en claro, plata en oscuro
  matLogo.roughness = claro ? 0.32 : 0.22;
  matPolvo.color.set(claro ? 0x3f6464 : 0x9fd3cf);
  matPolvo.blending = claro ? THREE.NormalBlending : THREE.AdditiveBlending;
  matPolvo.needsUpdate = true;
  matOrbita.opacity = claro ? 0.5 : 0.35;
  luzBorde.intensity = claro ? 1.6 : 3.2;
}
aplicarTema();
new MutationObserver(aplicarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
matchMedia('(prefers-color-scheme: light)').addEventListener('change', aplicarTema);

/* ---------- Ubicar el 3D donde estaba el logo plano ---------- */
let escalaBase = 1;
function medir() {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();

  const alturaVisible = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  const unidadPorPx = alturaVisible / r.height;
  const l = lugar.getBoundingClientRect();
  base.position.x = (l.left + l.width / 2 - r.left - r.width / 2) * unidadPorPx;
  base.position.y = -(l.top + l.height / 2 - r.top - r.height / 2) * unidadPorPx;
  escalaBase = (l.height * unidadPorPx) / 3.1 * 1.1;   // el anillo mide ~3.1 unidades
}
medir();
addEventListener('resize', medir);

/* ---------- Dedo, mouse y giroscopio ---------- */
const mira = { x: 0, y: 0, cx: 0, cy: 0, giro: 0 };
hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect();
  mira.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mira.y = ((e.clientY - r.top) / r.height) * 2 - 1;
}, { passive: true });
// Tocar el logo lo hace girar
hero.addEventListener('pointerdown', e => {
  if (e.target.closest('a, button')) return;
  mira.giro += 7;
}, { passive: true });

function escucharGiroscopio() {
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    mira.x = Math.max(-1, Math.min(1, e.gamma / 30));
    mira.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
  });
}
const esIphone = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const pidePermiso = esIphone && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
const botonGiro = document.querySelector('[data-gyro]');
if (pidePermiso && botonGiro) {
  // iPhone: el permiso solo se puede pedir con un toque
  botonGiro.hidden = false;
  botonGiro.addEventListener('click', () => {
    DeviceOrientationEvent.requestPermission().then(r => {
      if (r === 'granted') escucharGiroscopio();
      botonGiro.hidden = true;
    }).catch(() => { botonGiro.hidden = true; });
  });
} else if (matchMedia('(pointer: coarse)').matches) {
  escucharGiroscopio();   // Android: funciona directo
}

/* ---------- Animación ---------- */
const reloj = new THREE.Clock();
let activo = false, raf = 0;
let medidos = 0, sumaDt = 0, revisado = false;

function cuadro() {
  const dt = Math.min(reloj.getDelta(), 0.05);
  const t = reloj.elapsedTime;
  const p = (window.BC_HERO && window.BC_HERO.p) || 0;    // 0 arriba, 1 al terminar el hero

  // Suavizado del movimiento del dedo
  mira.cx += (mira.x - mira.cx) * 0.06;
  mira.cy += (mira.y - mira.cy) * 0.06;
  mira.giro *= 0.95;

  grupo.rotation.y += ((mira.cx * 0.6 + Math.sin(t * 0.5) * 0.18) - grupo.rotation.y) * 0.08 + mira.giro * dt;
  grupo.rotation.x += ((mira.cy * 0.4 + Math.cos(t * 0.4) * 0.08 + p * 1.1) - grupo.rotation.x) * 0.08;
  grupo.position.y = Math.sin(t * 1.1) * 0.06;

  orbita1.rotation.z += dt * 0.35;
  orbita2.rotation.z -= dt * 0.22;

  // Al bajar: el logo se aleja y las partículas se dispersan
  const e = escalaBase * (1 - p * 0.35);
  grupo.scale.setScalar(e);
  grupo.position.z = -p * 5;
  polvo.scale.setScalar(escalaBase * (1 + p * 2.2));
  polvo.rotation.y += dt * 0.03;
  polvo.rotation.x = -mira.cy * 0.15;
  polvo.position.x = -mira.cx * 0.3;
  matPolvo.opacity = 0.85 * (1 - p * 0.7);

  renderer.render(scene, camera);

  // Control de fluidez: si anda lento, se simplifica
  if (!revisado) {
    medidos++; sumaDt += dt;
    if (medidos === 90) {
      revisado = true;
      const fps = 90 / sumaDt;
      if (fps < 24) {
        // Muy lento: se apaga el 3D y vuelve el logo plano con el fondo líquido
        apagado = true; detener(); perf.bajar(); perf.bajar();
        hero.classList.remove('is-3d');
        dispatchEvent(new Event('resize'));
        return;
      }
      if (fps < 40) {
        renderer.setPixelRatio(1);
        geoPolvo.setDrawRange(0, Math.floor(CANT / 2));
        medir();
      }
    }
  }
  if (activo) raf = requestAnimationFrame(cuadro);
}
let visible = true, apagado = false;
function arrancar() { if (!activo && visible && !apagado && !document.hidden) { activo = true; reloj.getDelta(); raf = requestAnimationFrame(cuadro); } }
function detener() { activo = false; cancelAnimationFrame(raf); }

// Solo se dibuja mientras el hero se ve y la pestaña está abierta
new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? arrancar() : detener(); }).observe(hero);
document.addEventListener('visibilitychange', () => (document.hidden ? detener() : arrancar()));

// Listo: se muestra el 3D y se oculta el logo plano
renderer.render(scene, camera);
hero.classList.add('is-3d');
