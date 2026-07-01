#!/usr/bin/env python3
"""Cadre Pierre carnet n°3 + note footer dans i18n article 78."""
import json
import re
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "locales/articles/78-le-feu-pierre-le-fouineur.json"

PORTRAIT_EN = """
<div class="pierre-portrait">
<h2>Who is Pierre le Fouineur?</h2>
<p>My friend Pierre shared with me, one day, old notebooks found at his home — stories left by <strong>his great-grandfather</strong>, also named Pierre. He was called <strong>Pierre le Fouineur</strong>.</p>
<p>It was not mockery; it was a compliment. A coureur des bois, he walked Quebec: portages, trading posts where flour, pelts, stories and silence were exchanged. He listened. He wrote. Night after night, in worn leather notebooks, he gathered words — hunting, fishing, plants, ceremonies. The eleven nations of Quebec pass through these pages, each with its own voice: he was the witness who wrote; they were the ones who knew.</p>
<p>The notebooks slept for a long time — attic, trunks, forgetfulness. Then Pierre, his great-grandson, found them by chance, like an arrow stuck in birch bark, and entrusted me with reading them.</p>
<p>What he gave me is not yellow gold. It is something better: a <strong>mine of living stories</strong> among the different nations of Quebec — ancient, respectful texts written with the help of those who shared their knowledge. I invent nothing. I pass them on.</p>
</div>

"""

PORTRAIT_ES = """
<div class="pierre-portrait">
<h2>¿Quién es Pierre le Fouineur?</h2>
<p>Mi amigo Pierre me hizo partícipe, un día, de viejos cuadernos encontrados en su casa — relatos dejados por <strong>su bisabuelo</strong>, también llamado Pierre. Le decían <strong>Pierre le Fouineur</strong>.</p>
<p>No era burla, era un elogio. Coureur des bois, recorrió Quebec: portajes, cabañas de trueque donde se intercambiaban harina, pieles, historias y silencio. Escuchaba. Anotaba. Noche tras noche, en cuadernos de cuero gastado, acumulaba palabras — caza, pesca, plantas, ceremonias. Las once naciones del Quebec pasan por estas páginas, cada una con su voz: él era el testigo que escribía; ellos eran quienes sabían.</p>
<p>Los cuadernos dormían desde hacía mucho — desván, baúles, olvido. Luego Pierre, su bisnieto, los encontró por casualidad, como una flecha clavada en la corteza de un abedul, y me confió su lectura.</p>
<p>Lo que me entregó no es oro amarillo. Es algo mejor: una <strong>mina de relatos vivos</strong>, entre las diferentes naciones del Quebec — textos antiguos y respetuosos, redactados con la colaboración de quienes compartían su saber. No invento nada. Transmito.</p>
</div>

"""

HIGHLIGHT = {
    "en": (
        '<div class="highlight">\n'
        "<p><strong>Notebook No. 3 — Jean-Claude —</strong> My friend Pierre shared with me the notebooks of stories "
        "left by his great-grandfather, written long ago: a travel notebook across Quebec's eleven nations, "
        "composed with the help of their knowledge. I pass it on to you as it was written — I invent nothing.</p>\n"
        "</div>"
    ),
    "es": (
        '<div class="highlight">\n'
        "<p><strong>Cuaderno n° 3 — Jean-Claude —</strong> Mi amigo Pierre me hizo partícipe de los cuadernos de relatos "
        "dejados por su bisabuelo, redactados hace mucho tiempo: un cuaderno de ruta a través de las once naciones "
        "de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como fue escrito — no invento nada.</p>\n"
        "</div>"
    ),
}

FOOTER = {
    "en": (
        "<strong>Note:</strong> Ancient text written by my friend Pierre's great-grandfather — Pierre le Fouineur, "
        "coureur des bois — with the help of the nations' knowledge, and not by the First Nations themselves. "
        "Jean-Claude shares it as he received it, with respect for these writings and the traditions they describe. "
        "Techniques vary according to families and territories; the nations concerned remain the authorities of "
        "their own knowledge. Some methods described are today regulated or reserved for educational transmission."
    ),
    "es": (
        "<strong>Nota:</strong> Texto antiguo redactado por el bisabuelo de mi amigo Pierre — Pierre le Fouineur, "
        "coureur des bois — con la colaboración de los saberes de las naciones, y no por las Primeras Naciones mismas. "
        "Jean-Claude lo transmite tal como lo recibió, con respeto por estos escritos y las tradiciones que describen. "
        "Las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las autoridades "
        "de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica."
    ),
}

H1 = {
    "en": (
        '<h1>🔥 #78 — Fire Without Matches — Liturgy of the Ancients<br>'
        '<span style="font-size:0.65em;color:#d4a574;">Pierre le Fouineur\'s Notebooks — Notebook No. 3</span></h1>'
    ),
    "es": (
        '<h1>🔥 #78 — Fuego sin cerillas — Liturgia de los Antiguos<br>'
        '<span style="font-size:0.65em;color:#d4a574;">Cuadernos de Pierre le Fouineur — Cuaderno n° 3</span></h1>'
    ),
}


def patch_lang(html: str, lang: str) -> str:
    html = re.sub(r"<h1>🔥 #78.*?</h1>", H1[lang], html, count=1, flags=re.S)
    html = re.sub(r'<div class="highlight">.*?</div>', HIGHLIGHT[lang], html, count=1, flags=re.S)
    html = re.sub(
        r'<div class="footer-sources">\s*<strong>(?:Note|Nota)\s*:.*?</div>',
        f'<div class="footer-sources">\n    {FOOTER[lang]}\n</div>',
        html,
        count=1,
        flags=re.S,
    )
    return html


def main():
    if not JSON_PATH.exists():
        raise SystemExit(f"Missing {JSON_PATH} — run build-article-78-i18n.py first")
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    data["en"]["title"] = "#78 — Fire Without Matches — Pierre le Fouineur's Notebook No. 3"
    data["es"]["title"] = "#78 — Fuego sin cerillas — Cuaderno n° 3 de Pierre le Fouineur"
    for lang in ("en", "es"):
        data[lang]["html"] = patch_lang(data[lang]["html"], lang)
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Patched", JSON_PATH)


if __name__ == "__main__":
    main()
