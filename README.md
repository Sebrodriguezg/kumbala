# Kúmbala Music Group — sitio web

Sitio estático (HTML, CSS y JavaScript, sin compilar nada). Para publicarlo basta con copiar la carpeta
(GitHub Pages, Netlify o cualquier hosting).

## Verlo en el computador

```bash
python3 -m http.server 8765
# abrir http://127.0.0.1:8765
```

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Portada, la banda, sonido, escenarios, videos y contacto |
| `js/cuerdas.js` | Fondo de cuerdas que vibran (y suenan) al pasar el cursor o el dedo; cambia en cada visita |
| `js/principal.js` | Integrantes, géneros, formulario de cotización (WhatsApp / correo), redes |
| `js/datos.js` | Frases de la portada y textos de los géneros |
| `js/videos.js` | Videos de YouTube (se cargan solo al tocarlos) |
| `datos/config.json` | Enlaces de redes y videos: **se editan aquí sin tocar código** |
| `img/` | Logo, fotos e ícono |
| `img/galeria/` | Fotos de la galería (del Drive de la banda) |
| `descargas/` | Press kit en PDF liviano |
| `promocion/` | Imágenes para redes: `redes/` (una por día, estado 1080×1920 y publicación 1080×1080) |

## Redes y videos

En `datos/config.json` llenar los enlaces. Las redes vacías no aparecen; si no hay videos se muestra
"Muy pronto".

```json
{
  "redes": { "instagram": "https://instagram.com/...", "youtube": "https://youtube.com/@..." },
  "videos": {
    "lista_reproduccion": "https://www.youtube.com/playlist?list=...",
    "videos": [{ "url": "https://youtu.be/XXXXXXXXXXX", "titulo": "En vivo", "descripcion": "..." }]
  }
}
```

Redes soportadas: facebook, instagram, youtube, soundcloud, spotify, tiktok.

## Imágenes para redes

En `promocion/redes/` hay una imagen por día de la semana (más una general y una de diciembre), cada una en
formato estado de WhatsApp/Instagram (`-estado`) y publicación cuadrada (`-post`). Todas llevan el QR de la
página y el contacto de Julio.

Para cambiar textos, fotos o colores, editar `promocion/dias.json` y regenerar:

```bash
uv venv .venv && uv pip install --python .venv/bin/python playwright
.venv/bin/python promocion/generar.py   # usa Google Chrome instalado
```
