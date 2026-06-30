#!/usr/bin/env python3
"""Fix meta div + Pierre frame opening in article 76 i18n (EN/ES)."""
import json
import re
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "locales/articles/76-les-outils-de-chasse.json"

OPENINGS = {
    "en": """<div class="meta">
    Series <em>Indigenous Peoples of Quebec</em> — Article #76<br>
    Facebook Group: <a href="https://www.facebook.com/groups/1451283625021958" target="_blank">Les Premières Nations au Québec</a>
</div>

<div class="highlight">
<p><strong>Jean-Claude —</strong> My friend Pierre entrusted me with this account: a travel notebook across Quebec's eleven nations, composed with the help of their knowledge. I pass it on to you as he wrote it.</p>
</div>

<p><em>Here is the notebook Pierre gave me.</em></p>

""",
    "es": """<div class="meta">
    Serie <em>Pueblos Indígenas de Quebec</em> — Artículo #76<br>
    Grupo de Facebook: <a href="https://www.facebook.com/groups/1451283625021958" target="_blank">Les Premières Nations au Québec</a>
</div>

<div class="highlight">
<p><strong>Jean-Claude —</strong> Mi amigo Pierre me confió este relato: un cuaderno de ruta a través de las once naciones de Quebec, compuesto con la colaboración de sus saberes. Te lo transmito tal como él lo escribió.</p>
</div>

<p><em>Aquí está el cuaderno que Pierre me entregó.</em></p>

""",
}

DEDUPE = {
    "en": re.compile(
        r'(<p><em>Here is the notebook Pierre gave me\.</em></p>\s*)+',
        re.S,
    ),
    "es": re.compile(
        r'(<p><em>Aquí está el cuaderno que Pierre me entregó\.</em></p>\s*)+',
        re.S,
    ),
}


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for lang in ("en", "es"):
        html = data[lang]["html"]
        html = re.sub(
            r'<div class="meta">.*?</div>\s*(?:<div class="highlight">.*?</div>\s*<p><em>.*?</em></p>\s*)*',
            OPENINGS[lang],
            html,
            count=1,
            flags=re.S,
        )
        html = html.replace('<div class=\\"lead\\">', '<div class="lead">')
        html = DEDUPE[lang].sub(r"\1", html, count=1)
        data[lang]["html"] = html

    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for lang in ("en", "es"):
        h = data[lang]["html"]
        assert h.count("Here is the notebook" if lang == "en" else "cuaderno que Pierre") == 1
        assert 'class="lead"' in h
        assert "Composite narrative" in h or "Relato compuesto" in h
        print(lang, "OK")


if __name__ == "__main__":
    main()
