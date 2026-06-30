#!/usr/bin/env python3
"""Étape 1 article #77 — catalogue, redirect, nav #76→#77 (comme #74–#76)."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = "77-les-techniques-de-peche"
FILE = f"{SLUG}.html"

ITEM = {
    "n": "77",
    "title": "Les Techniques de Pêche — Reportage vivant des onze nations du Québec",
    "teaser": (
        "Harpons, nasses, filets et protocoles du tabac : un carnet de Pierre le Fouineur "
        "sur la pêche chez les Innu, Atikamekw, Mi'kmaq, Wendat et les nations du Québec."
    ),
    "file": FILE,
}

REDIRECT = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=77-les-techniques-de-peche.html">
  <link rel="canonical" href="77-les-techniques-de-peche.html">
  <title>Article #77 — Premières Nations</title>
  <script>location.replace("77-les-techniques-de-peche.html");</script>
  <link rel="stylesheet" href="lang-switcher.css">
  <script src="lang-switcher.js" defer></script>
</head>
<body>
  <p><a href="77-les-techniques-de-peche.html">Article #77 — Techniques de pêche — ouvrir l'article</a></p>
</body>
</html>
"""


def add_to_catalog():
    for path in (ROOT / "blog-serie-articles.json", ROOT / "pages" / "blog-serie-articles.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        flat = []
        for g in data.get("groups", []):
            flat.extend(g.get("items", []))
        if any(str(it.get("n")) == "77" for it in flat):
            print("catalog already has #77", path.name)
            continue
        flat.append(ITEM)
        flat.sort(key=lambda x: int(str(x["n"])))
        # rebuild via reorganize script after
        data["groups"] = [{"label": "temp", "items": flat}]
        data["stats"] = {
            "articlesNumbered": 77,
            "withFeatured": data.get("stats", {}).get("withFeatured", True),
            "nextArticle": 78,
        }
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("added #77 to", path.name)


def write_redirect():
    for name in ("article77.html",):
        p = ROOT / name
        p.write_text(REDIRECT, encoding="utf-8")
        pages = ROOT / "pages" / name
        pages.write_text(REDIRECT.replace('href="77-', 'href="../77-').replace('url=77-', 'url=../77-'), encoding="utf-8")
        print("wrote", p)


def patch_76_nav():
    old = '<a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    new = f'<a href="{FILE}">#77 Pêche →</a>\n    <a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    for rel in (ROOT / "76-les-outils-de-chasse.html", ROOT / "pages" / "76-les-outils-de-chasse.html"):
        text = rel.read_text(encoding="utf-8")
        if f'href="{FILE}"' in text:
            print("76 nav already links to 77", rel.name)
            continue
        text = text.replace(old, new.replace(FILE, FILE if "pages" not in str(rel) else "../" + FILE))
        rel.write_text(text, encoding="utf-8")
        print("patched nav in", rel.name)


def patch_77_nav():
    for rel in (ROOT / FILE, ROOT / "pages" / FILE):
        text = rel.read_text(encoding="utf-8")
        if "article76.html" in text or "76-les-outils-de-chasse.html" in text:
            print("77 nav ok", rel.name)
            continue


def main():
    add_to_catalog()
    write_redirect()
    patch_76_nav()
    import subprocess
    subprocess.run(["python", str(ROOT / "scripts/reorganize-blog-series.py")], check=True)
    subprocess.run(["python", str(ROOT / "scripts/sync-article-count-i18n.py")], check=True)
    print("Step1 catalog done — run build-article-77-i18n.py then patch-article-77-i18n.py")


if __name__ == "__main__":
    main()
