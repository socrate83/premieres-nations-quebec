#!/usr/bin/env python3
"""Add Jean-Claude / Pierre framing to article 76 i18n JSON."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "locales/articles/76-les-outils-de-chasse.json"

FRAMES = {
    "en": {
        "insert_after_meta": (
            '\n\n<div class="highlight">\n'
            "<p><strong>Jean-Claude —</strong> My friend Pierre entrusted me with this account, written long ago: "
            "a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. "
            "I pass it on to you as he wrote it — I invent nothing.</p>\n"
            "</div>\n\n"
            "<p><em>Here is the notebook Pierre gave me.</em></p>"
        ),
        "thanks_old": (
            "<p><em>I thank my friend Pierre who, with the help of the 11 nations, was able to "
            "produce this report to share it on my site.</em> — Jean-Claude</p>"
        ),
        "thanks_new": (
            "<p><em>Thanks to Pierre for this notebook, and to the nations whose knowledge nourished it.</em> "
            "— Jean-Claude</p>"
        ),
        "footer_old": (
            "<strong>Note:</strong> Report written with respect for the traditions of the First Nations of Quebec. "
            "Techniques vary according to families and territories; the nations concerned remain the authorities "
            "of their own knowledge. Some methods described are today regulated or reserved for educational transmission."
        ),
        "footer_new": (
            "<strong>Note:</strong> Ancient text written by Pierre, with the help of the nations' knowledge — "
            "not by the First Nations themselves. Jean-Claude shares it as he received it, with respect for "
            "these writings and the traditions they describe. Techniques vary according to families and "
            "territories; the nations concerned remain the authorities of their own knowledge. "
            "Some methods described are today regulated or reserved for educational transmission."
        ),
    },
    "es": {
        "insert_after_meta": (
            '\n\n<div class="highlight">\n'
            "<p><strong>Jean-Claude —</strong> Mi amigo Pierre me confió este relato, redactado hace mucho tiempo: un cuaderno de ruta a "
            "través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. "
            "Te lo transmito tal como él lo escribió — no invento nada.</p>\n"
            "</div>\n\n"
            "<p><em>Aquí está el cuaderno que Pierre me entregó.</em></p>"
        ),
        "thanks_old": (
            "<p><em>Agradezco a mi amigo Pierre quien, con la colaboración de las 11 naciones, pudo realizar "
            "este reportaje para difundirlo en mi sitio.</em> — Jean-Claude</p>"
        ),
        "thanks_new": (
            "<p><em>Gracias a Pierre por este cuaderno, y a las naciones cuyos saberes lo nutrieron.</em> "
            "— Jean-Claude</p>"
        ),
        "footer_old": (
            "<strong>Nota:</strong> Reportaje redactado con respeto por las tradiciones de las Primeras Naciones de Quebec. "
            "Las técnicas varían según las familias y los territorios; las naciones concernidas siguen siendo las "
            "autoridades de sus propios saberes. Algunos métodos descritos están hoy regulados o reservados a la "
            "transmisión pedagógica."
        ),
        "footer_new": (
            "<strong>Nota:</strong> Texto antiguo redactado por Pierre, con la colaboración de los saberes de las naciones — "
            "y no por las Primeras Naciones mismas. Jean-Claude lo transmite tal como lo recibió, con respeto por "
            "estos escritos y las tradiciones que describen. Las técnicas varían según las familias y los territorios; "
            "las naciones concernidas siguen siendo las autoridades de sus propios saberes. "
            "Algunos métodos descritos están hoy regulados o reservados a la transmisión pedagógica."
        ),
    },
}

META_END = re.compile(
    r'(</div>\s*\n\s*<div class="lead">)',
    re.S,
)


def patch_lang(html: str, lang: str) -> str:
    cfg = FRAMES[lang]
    marker = '<div class="lead">'
    if "Voici le carnet" in html or "Here is the notebook" in html or "cuaderno que Pierre" in html:
        pass
    elif marker in html:
        html = META_END.sub(cfg["insert_after_meta"] + r"\n\n<div class=\"lead\">", html, count=1)
    html = html.replace(cfg["thanks_old"], cfg["thanks_new"])
    html = html.replace(cfg["footer_old"], cfg["footer_new"])
    return html


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang in ("en", "es"):
        data[lang]["html"] = patch_lang(data[lang]["html"], lang)
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Patched", JSON_PATH)


if __name__ == "__main__":
    main()
