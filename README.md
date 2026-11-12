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
| `descargas/` | Press kit en PDF liviano |

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
