// Fondo de "cuerdas": las líneas finas del press kit convertidas en cuerdas que vibran
// cuando el cursor (o el dedo) las cruza. Con el botón "Toca las cuerdas" además suenan
// (síntesis Karplus-Strong, afinadas en una escala pentatónica).
// Cada visita arma un conjunto distinto de cuerdas y un color de acento distinto.

const lienzo = document.getElementById('cuerdas');
const ctx = lienzo.getContext('2d');
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- acento distinto en cada visita
const ACENTOS = ['#d9904a', '#e0675a', '#4fb3a0', '#e3b448', '#c77dba', '#6fa8dc'];
let anterior = -1;
try { anterior = Number(localStorage.getItem('acento') ?? -1); } catch { /* sin almacenamiento */ }
let iAcento;
do { iAcento = Math.floor(Math.random() * ACENTOS.length); } while (iAcento === anterior);
try { localStorage.setItem('acento', iAcento); } catch { /* sin almacenamiento */ }
const ACENTO = ACENTOS[iAcento];
document.documentElement.style.setProperty('--acento', ACENTO);

// ---------- cuerdas
// Escala pentatónica mayor (Do), dos octavas y media: las cuerdas cortas suenan más agudo.
const NOTAS = [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
let cuerdas = [];
let ancho = 0, alto = 0, dpr = 1;

function azar(a, b) { return a + Math.random() * (b - a); }

function armar() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  ancho = innerWidth; alto = innerHeight;
  lienzo.width = ancho * dpr; lienzo.height = alto * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cuerdas = [];
  const n = Math.round(Math.max(10, Math.min(26, ancho * alto / 52000)));
  const estilo = Math.random(); // en algunas visitas aparecen cuerdas inclinadas
  for (let i = 0; i < n; i++) {
    const vertical = Math.random() < 0.62;
    const largo = azar(0.12, 0.42) * (vertical ? alto : ancho);
    let x1, y1, x2, y2;
    if (vertical) {
      x1 = x2 = azar(0.03, 0.97) * ancho;
      y1 = azar(-0.05, 0.95) * alto; y2 = y1 + largo;
    } else {
      y1 = y2 = azar(0.03, 0.97) * alto;
      x1 = azar(-0.05, 0.95) * ancho; x2 = x1 + largo;
    }
    if (estilo > 0.6 && Math.random() < 0.3) { x2 += azar(-0.3, 0.3) * largo; }
    cuerdas.push(nuevaCuerda(x1, y1, x2, y2));
  }
}

function nuevaCuerda(x1, y1, x2, y2) {
  const largo = Math.hypot(x2 - x1, y2 - y1);
  const diag = Math.hypot(ancho, alto);
  // largo → nota: más corta, más aguda
  const k = Math.max(0, Math.min(NOTAS.length - 1, Math.round((1 - largo / (0.45 * diag)) * (NOTAS.length - 1))));
  return {
    x1, y1, x2, y2, largo,
    nx: -(y2 - y1) / largo, ny: (x2 - x1) / largo, // normal unitaria
    amp: 0, p: 0.5, t0: 0, frec: NOTAS[k],
  };
}

// ---------- detección de cruce entre el movimiento del puntero y cada cuerda
function lado(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); }

function cruce(c, ax, ay, bx, by) {
  const d1 = lado(c.x1, c.y1, c.x2, c.y2, ax, ay);
  const d2 = lado(c.x1, c.y1, c.x2, c.y2, bx, by);
  if (d1 * d2 >= 0) return null;
  const d3 = lado(ax, ay, bx, by, c.x1, c.y1);
  const d4 = lado(ax, ay, bx, by, c.x2, c.y2);
  if (d3 * d4 >= 0) return null;
  const s = d3 / (d3 - d4);       // posición a lo largo de la cuerda (0..1)
  return { s, signo: Math.sign(d2) };
}

let ultimo = null;
function mover(x, y) {
  if (ultimo) {
    const vel = Math.hypot(x - ultimo.x, y - ultimo.y);
    for (const c of cuerdas) {
      const r = cruce(c, ultimo.x, ultimo.y, x, y);
      if (r && r.s > 0.04 && r.s < 0.96) pulsar(c, r.s, r.signo * Math.min(18, 4 + vel * 0.4));
    }
  }
  ultimo = { x, y };
}

addEventListener('pointermove', e => mover(e.clientX, e.clientY), { passive: true });
addEventListener('touchmove', e => { const t = e.touches[0]; if (t) mover(t.clientX, t.clientY); }, { passive: true });
addEventListener('pointerdown', e => { ultimo = { x: e.clientX, y: e.clientY }; }, { passive: true });
addEventListener('touchstart', e => { const t = e.touches[0]; if (t) ultimo = { x: t.clientX, y: t.clientY }; }, { passive: true });
addEventListener('pointerleave', () => { ultimo = null; });

function pulsar(c, s, fuerza) {
  c.amp = fuerza; c.p = s; c.t0 = performance.now();
  if (sonido) tocarNota(c.frec, Math.min(1, Math.abs(fuerza) / 18));
  if (!animando) { animando = true; requestAnimationFrame(cuadro); }
  const pista = document.getElementById('pista');
  if (pista) pista.style.opacity = 0;
}

// ---------- dibujo
const SEG = 28;
let animando = false;

function dibujar(ahora) {
  ctx.clearRect(0, 0, ancho, alto);
  let viva = false;
  for (const c of cuerdas) {
    const t = (ahora - c.t0) / 1000;
    const caida = quieto ? 0 : Math.exp(-t * 2.6);
    const a = c.amp * caida;
    const activa = Math.abs(a) > 0.15;
    if (activa) viva = true;
    ctx.beginPath();
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG;
      let d = 0;
      if (activa) {
        // suma de los tres primeros modos, pesados según el punto de pulsación
        for (let m = 1; m <= 3; m++) {
          d += Math.sin(m * Math.PI * c.p) / (m * m) * Math.sin(m * Math.PI * s) * Math.cos(m * 38 * t);
        }
        d *= a;
      }
      const x = c.x1 + (c.x2 - c.x1) * s + c.nx * d;
      const y = c.y1 + (c.y2 - c.y1) * s + c.ny * d;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    const brillo = Math.min(1, Math.abs(a) / 10);
    ctx.strokeStyle = activa ? mezclar(brillo) : 'rgba(244,241,236,0.13)';
    ctx.lineWidth = activa ? 1 + brillo : 1;
    ctx.stroke();
  }
  return viva;
}

function mezclar(b) {
  const r = parseInt(ACENTO.slice(1, 3), 16), g = parseInt(ACENTO.slice(3, 5), 16), bl = parseInt(ACENTO.slice(5, 7), 16);
  return `rgba(${r},${g},${bl},${0.25 + 0.75 * b})`;
}

function cuadro(ahora) {
  const viva = dibujar(ahora);
  if (viva && !quieto) requestAnimationFrame(cuadro);
  else { animando = false; dibujar(ahora); }
}

let espera;
addEventListener('resize', () => {
  clearTimeout(espera);
  espera = setTimeout(() => { armar(); dibujar(performance.now()); }, 150);
});

armar();
dibujar(performance.now());

// ---------- sonido (Karplus-Strong)
let audio = null;
let sonido = false;

function tocarNota(frec, volumen) {
  if (!audio) return;
  const sr = audio.sampleRate;
  const duracion = 2.2;
  const buf = audio.createBuffer(1, Math.floor(sr * duracion), sr);
  const datos = buf.getChannelData(0);
  const periodo = Math.round(sr / frec);
  const linea = new Float32Array(periodo);
  for (let i = 0; i < periodo; i++) linea[i] = Math.random() * 2 - 1;
  let j = 0;
  for (let i = 0; i < datos.length; i++) {
    const sig = (j + 1) % periodo;
    const v = 0.5 * (linea[j] + linea[sig]) * 0.996;
    datos[i] = linea[j];
    linea[j] = v;
    j = sig;
  }
  const fuente = audio.createBufferSource();
  fuente.buffer = buf;
  const g = audio.createGain();
  g.gain.value = 0.18 + 0.25 * volumen;
  fuente.connect(g).connect(audio.destination);
  fuente.start();
}

const botonSonar = document.getElementById('sonar');
const textoSonar = document.getElementById('sonar-texto');
botonSonar?.addEventListener('click', () => {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { textoSonar.textContent = 'Sin sonido en este navegador'; return; }
    audio = new Ctx();
  }
  sonido = !sonido;
  if (sonido) audio.resume();
  botonSonar.setAttribute('aria-pressed', String(sonido));
  textoSonar.textContent = sonido ? 'Sonido activado' : 'Toca las cuerdas';
  // una cuerda al azar suena para confirmar
  if (sonido && cuerdas.length) {
    const c = cuerdas[Math.floor(Math.random() * cuerdas.length)];
    pulsar(c, 0.35, 12);
  }
});
