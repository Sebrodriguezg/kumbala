(() => {
const { GENEROS, FRASES } = window;

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = texto => String(texto).replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);

// ---------- barra: aparece al salir de la portada
const barra = $('#barra');
new IntersectionObserver(([e]) => barra.classList.toggle('visible', !e.isIntersecting), { threshold: 0.2 })
  .observe($('#inicio'));

// ---------- secciones que aparecen al llegar
// (las secciones solo se esconden para animarlas si este script corre; si falla, se ven igual)
document.documentElement.classList.add('js-listo');
const revelador = new IntersectionObserver(entradas => {
  for (const e of entradas) if (e.isIntersecting) { e.target.classList.add('visto'); revelador.unobserve(e.target); }
}, { threshold: 0.1 });
$$('.revelar').forEach(el => revelador.observe(el));

// ---------- frase de portada que va rotando
const frase = $('#frase');
let iFrase = Math.floor(Math.random() * FRASES.length);
frase.textContent = FRASES[iFrase];
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    frase.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).onfinish = () => {
      iFrase = (iFrase + 1) % FRASES.length;
      frase.textContent = FRASES[iFrase];
      frase.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' });
    };
  }, 5000);
}

// ---------- integrantes: punto en la foto ↔ tarjeta
function marcar(i) {
  $$('.punto, #integrantes li').forEach(el => el.classList.toggle('activo', el.dataset.i === String(i)));
}
$$('.punto, #integrantes li').forEach(el => {
  el.addEventListener('mouseenter', () => marcar(el.dataset.i));
  el.addEventListener('focus', () => marcar(el.dataset.i));
  el.addEventListener('click', () => marcar(el.dataset.i));
});
$('.foto-banda').addEventListener('mouseleave', () => marcar(-1));
$('#integrantes').addEventListener('mouseleave', () => marcar(-1));

// ---------- géneros
const cajaGeneros = $('#generos');
const textoGenero = $('#genero-texto');
cajaGeneros.innerHTML = GENEROS.map((g, i) =>
  `<button type="button" class="genero" role="tab" aria-selected="false" data-i="${i}">${esc(g.nombre)}</button>`).join('');
function elegirGenero(i) {
  $$('.genero').forEach(b => b.setAttribute('aria-selected', String(b.dataset.i === String(i))));
  textoGenero.textContent = GENEROS[i].texto;
}
cajaGeneros.addEventListener('click', e => {
  const b = e.target.closest('.genero');
  if (b) elegirGenero(b.dataset.i);
});
elegirGenero(Math.floor(Math.random() * GENEROS.length));

// ---------- galería: ver foto en grande
const visor = $('#visor');
$('#galeria-fotos').addEventListener('click', e => {
  const img = e.target.closest('.foto')?.querySelector('img');
  if (!img || !visor.showModal) return;
  visor.querySelector('img').src = img.src;
  visor.querySelector('img').alt = img.alt;
  visor.showModal();
});
visor.addEventListener('click', () => visor.close());

// ---------- cotización: arma el mensaje y abre WhatsApp o el correo
const CORREO = 'kumbalamusic@gmail.com';
$('#cotizar').addEventListener('submit', e => {
  e.preventDefault();
  const datos = new FormData(e.target);
  const fecha = datos.get('fecha')
    ? new Date(datos.get('fecha') + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'por definir';
  const lineas = [
    'Hola Kúmbala, quiero cotizar una presentación.',
    `• Evento: ${datos.get('tipo')}`,
    `• Fecha: ${fecha}`,
    `• Lugar: ${datos.get('lugar') || 'por definir'}`,
    `• Invitados: ${datos.get('invitados') || 'por definir'}`,
  ];
  if (datos.get('nota')) lineas.push(`• Nota: ${datos.get('nota')}`);
  const mensaje = lineas.join('\n');
  const destino = e.submitter?.dataset.a ?? 'correo';
  const url = destino === 'correo'
    ? `mailto:${CORREO}?subject=${encodeURIComponent('Cotización: ' + datos.get('tipo'))}&body=${encodeURIComponent(mensaje)}`
    : `https://wa.me/${destino}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, destino === 'correo' ? '_self' : '_blank', 'noopener');
});

// ---------- videos y redes (datos/config.json)
const ICONOS = {
  facebook: '<path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/>',
  instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM16.5 2h-9A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2zm3.7 14.5a3.7 3.7 0 0 1-3.7 3.7h-9a3.7 3.7 0 0 1-3.7-3.7v-9a3.7 3.7 0 0 1 3.7-3.7h9a3.7 3.7 0 0 1 3.7 3.7z"/>',
  youtube: '<path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12a31 31 0 0 0 .4 3.8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15.2V8.8l5.2 3.2z"/>',
  soundcloud: '<path d="M1 14.5v3M3.2 12v5.5M5.4 10.6v6.9M7.6 9.6v7.9M9.8 8.4v9.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" style="stroke:var(--tinta)"/><path d="M12 7.4v10.1h7.3a3.7 3.7 0 0 0 .4-7.4A5.4 5.4 0 0 0 12 7.4z"/>',
  spotify: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9zm1.2-2.7a.8.8 0 0 1-1.1.3c-2.7-1.7-6.9-2.2-10.1-1.2a.8.8 0 1 1-.5-1.5c3.7-1.1 8.3-.6 11.4 1.3.4.2.5.7.3 1.1zm.1-2.8C14.7 9 9.3 8.8 6.2 9.8a1 1 0 1 1-.6-1.8c3.6-1.1 9.6-.9 13.3 1.3a1 1 0 0 1-1 1.6z"/>',
  tiktok: '<path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.1-2.8V9.1a6.3 6.3 0 1 0 5.5 6.3V8.6a8 8 0 0 0 4.4 1.3V6.5a4.5 4.5 0 0 1-4.4-4.5z"/>',
};

async function cargarConfig() {
  let config = {};
  try { config = await (await fetch('datos/config.json')).json(); } catch { /* sin config */ }

  // redes: solo las que tengan enlace
  const redes = Object.entries(config.redes ?? {}).filter(([red, url]) => url && ICONOS[red]);
  $('#redes').innerHTML = redes.map(([red, url]) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${red}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[red]}</svg></a>`).join('');

  window.iniciarVideos($('#lista-videos'), config.videos ?? {});
}
cargarConfig();
})();
