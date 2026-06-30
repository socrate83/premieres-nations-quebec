#!/usr/bin/env python3
"""Insert Pierre le Fouineur portrait block into article 76 i18n."""
import json
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "locales/articles/76-les-outils-de-chasse.json"

PORTRAITS = {
    "en": """
<div class="pierre-portrait">
<h2>Who is Pierre le Fouineur?</h2>
<p>My friend Pierre shared with me, one day, old notebooks found at his home — stories left by <strong>his great-grandfather</strong>, also named Pierre. He was called <strong>Pierre le Fouineur</strong> — Pierre the Snoop.</p>
<p>It was not mockery; it was a compliment. A coureur des bois at heart, he walked Quebec: portages, trading posts where flour, pelts, stories and silence were exchanged. He listened. He wrote. Night after night, in worn leather notebooks, he gathered words — hunting, fishing, plants, ceremonies. The eleven nations of Quebec pass through these pages, each with its own voice: he was the witness who wrote; they were the ones who knew.</p>
<p>The notebooks slept for a long time — attic, trunks, forgetfulness. Then Pierre, his great-grandson, found them by chance, like an arrow stuck in birch bark, and entrusted me with reading them.</p>
<p>What he gave me is not yellow gold. It is something better: a <strong>mine of living stories</strong> among the different nations of Quebec — ancient, respectful texts written with the help of those who shared their knowledge. I invent nothing. I pass them on.</p>
</div>

""",
    "es": """
<div class="pierre-portrait">
<h2>¿Quién es Pierre le Fouineur?</h2>
<p>Mi amigo Pierre me hizo partícipe, un día, de viejos cuadernos encontrados en su casa — relatos dejados por <strong>su bisabuelo</strong>, también llamado Pierre. Le decían <strong>Pierre le Fouineur</strong>.</p>
<p>No era burla, era un elogio. Coureur des bois de corazón, recorrió Quebec: portajes, cabañas de trueque donde se intercambiaban harina, pieles, historias y silencio. Escuchaba. Anotaba. Noche tras noche, en cuadernos de cuero gastado, acumulaba palabras — caza, pesca, plantas, ceremonias. Las once naciones del Quebec pasan por estas páginas, cada una con su voz: él era el testigo que escribía; ellos eran quienes sabían.</p>
<p>Los cuadernos dormían desde hacía mucho — desván, baúles, olvido. Luego Pierre, su bisnieto, los encontró por casualidad, como una flecha clavada en la corteza de un abedul, y me confió su lectura.</p>
<p>Lo que me entregó no es oro amarillo. Es algo mejor: una <strong>mina de relatos vivos</strong>, entre las diferentes naciones del Quebec — textos antiguos y respetuosos, redactados con la colaboración de quienes compartían su saber. No invento nada. Transmito.</p>
</div>

""",
}

MARKER = "</div>\n\n<p><em>"


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang, block in PORTRAITS.items():
        html = data[lang]["html"]
        if "pierre-portrait" in html:
            print(lang, "already has portrait")
            continue
        needle = MARKER
        if lang == "en":
            needle = '</div>\n\n<p><em>Here is one of these notebooks'
        elif lang == "es":
            needle = '</div>\n\n<p><em>Aquí está uno de esos cuadernos'
        idx = html.find(needle)
        if idx == -1:
            raise SystemExit(f"marker not found for {lang}")
        insert_at = html.find("</div>", html.find('<div class="highlight">')) + len("</div>")
        html = html[:insert_at] + block + html[insert_at:]
        data[lang]["html"] = html
        print(lang, "OK")
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
