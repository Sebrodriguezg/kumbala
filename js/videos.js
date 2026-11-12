// Videos de YouTube. Se configuran en datos/config.json:
//   "lista_reproduccion": enlace de una lista de YouTube (se actualiza sola desde YouTube)
//   "videos": [{ "url": "https://youtu.be/...", "titulo": "...", "descripcion": "..." }]
// El reproductor solo se carga al tocar el video (más liviano y sin cookies hasta entonces).

const esc = texto => String(texto).replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);

export function idVideo(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(url) ? url : null;
}

export function idLista(url) {
  const m = String(url).match(/[?&]list=([\w-]+)/);
  return m ? m[1] : /^[\w-]{12,}$/.test(url) ? url : null;
}

function reproductor(src, titulo) {
  return `<iframe src="${src}" title="${titulo}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`;
}

function tarjeta(v) {
  const id = idVideo(v.url ?? v.id);
  if (!id) return '';
  const titulo = esc(v.titulo ?? 'Video');
  return `<article class="video">
    <button type="button" class="video-portada" data-id="${id}" aria-label="Reproducir: ${titulo}">
      <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">
      <span class="video-play" aria-hidden="true">▶</span>
    </button>
    <h3>${titulo}</h3>${v.descripcion ? `<p>${esc(v.descripcion)}</p>` : ''}
  </article>`;
}

export function iniciarVideos(contenedor, videos) {
  const lista = idLista(videos.lista_reproduccion ?? '');
  const sueltos = (videos.videos ?? []).filter(v => idVideo(v.url ?? v.id));
  let html = '';
  if (lista) {
    html += `<div class="video-lista">${reproductor(`https://www.youtube-nocookie.com/embed/videoseries?list=${lista}`, 'Lista de videos')}</div>`;
  }
  if (sueltos.length) html += `<div class="videos">${sueltos.map(tarjeta).join('')}</div>`;
  if (!html) html = '<div class="espacio-pronto">Muy pronto: videos de nuestras presentaciones en vivo.</div>';
  contenedor.innerHTML = html;
  contenedor.addEventListener('click', e => {
    const boton = e.target.closest('.video-portada');
    if (!boton || boton.tagName !== 'BUTTON') return;
    const titulo = esc(boton.closest('.video').querySelector('h3').textContent);
    boton.outerHTML = `<div class="video-portada">${reproductor(`https://www.youtube-nocookie.com/embed/${boton.dataset.id}?autoplay=1&rel=0`, titulo)}</div>`;
  });
}
