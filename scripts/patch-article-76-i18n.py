#!/usr/bin/env python3
"""Patch i18n JSON for article 76: title + gallery after 'Pour aller plus loin' list."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "locales/articles/76-les-outils-de-chasse.json"

H1 = {
    "en": (
        "#76 — Hunting Techniques of the 11 First Nations of Quebec",
        "A Living Report, Immortal Traditions",
    ),
    "es": (
        "#76 — Técnicas de Caza de las 11 Primeras Naciones de Quebec",
        "Un Reportaje Vivo, Tradiciones Inmortales",
    ),
}


def move_gallery_after_ul(html: str) -> str:
    m = re.search(
        r'(<div class="gallery">.*?</div>\s*)'
        r'(<p>(?:Ce reportage|This report|Este reportaje))',
        html,
        re.S,
    )
    if not m:
        return html
    gallery, rest_start = m.group(1), m.group(2)
    html = html.replace(gallery, "", 1)
    ul_end = html.rfind("</ul>")
    if ul_end == -1:
        return html
    insert_at = ul_end + len("</ul>")
    return html[:insert_at] + "\n\n" + gallery.strip() + "\n" + html[insert_at:]


def patch_h1(html: str, lang: str) -> str:
    title, subtitle = H1[lang]
    return re.sub(
        r"<h1>🏹 #76 — .*?<br><span style=\"font-size:0\.65em;color:#d4a574;\">.*?</span></h1>",
        f'<h1>🏹 {title}<br><span style="font-size:0.65em;color:#d4a574;">{subtitle}</span></h1>',
        html,
        count=1,
        flags=re.S,
    )


def patch_thanks(html: str, lang: str) -> str:
    thanks = {
        "en": '<p><em>I thank my friend Pierre who, with the help of the 11 nations, was able to produce this report to share it on my site.</em> — Jean-Claude</p>\n\n',
        "es": '<p><em>Agradezco a mi amigo Pierre quien, con la colaboración de las 11 naciones, pudo realizar este reportaje para difundirlo en mi sitio.</em> — Jean-Claude</p>\n\n',
    }
    if lang not in thanks:
        return html
    needle = '<blockquote class="quote">'
    if "Jean-Claude</p>" in html and needle in html:
        return html
    return html.replace(needle, thanks[lang] + needle, 1)


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang in ("en", "es"):
        html = data[lang]["html"]
        html = patch_h1(html, lang)
        html = move_gallery_after_ul(html)
        html = patch_thanks(html, lang)
        data[lang]["html"] = html
        data[lang]["title"] = H1[lang][0]
    JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("Patched", JSON_PATH)


if __name__ == "__main__":
    main()
