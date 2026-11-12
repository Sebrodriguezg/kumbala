"""Genera las imágenes para redes (estado 1080×1920 y publicación 1080×1080) de cada día.

Uso:  python generar.py        (necesita playwright y Google Chrome)
Los textos, fotos y colores se cambian en dias.json.
"""
import asyncio, json, pathlib, urllib.parse
from playwright.async_api import async_playwright

AQUI = pathlib.Path(__file__).resolve().parent
SALIDA = AQUI / 'redes'
TAMANOS = {'estado': (1080, 1920), 'post': (1080, 1080)}


async def main():
    dias = json.loads((AQUI / 'dias.json').read_text())
    SALIDA.mkdir(exist_ok=True)
    async with async_playwright() as p:
        nav = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        for formato, (w, h) in TAMANOS.items():
            pagina = await nav.new_page(viewport={'width': w, 'height': h})
            for d in dias:
                datos = urllib.parse.quote(json.dumps({**d, 'formato': formato}))
                await pagina.goto(f'{(AQUI / "plantilla.html").as_uri()}#{datos}')
                await pagina.reload(wait_until='networkidle')
                await pagina.evaluate('document.fonts.ready')
                await pagina.wait_for_timeout(300)
                png = SALIDA / f'{d["archivo"]}-{formato}.png'
                await pagina.screenshot(path=png)
                print(png.name)
        await nav.close()

asyncio.run(main())
