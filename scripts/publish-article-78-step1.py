#!/usr/bin/env python3
"""Étape 1 article #78 — catalogue, redirect, nav #77→#78, blog-serie-i18n."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = "78-le-feu-pierre-le-fouineur"
FILE = f"{SLUG}.html"

ITEM = {
    "n": "78",
    "title": "Le Feu sans allumettes — Liturgie des Anciens (Carnet n° 3)",
    "teaser": (
        "Friction, cercle sacré et prière du feu : le carnet n° 3 de Pierre le Fouineur "
        "sur l'allumage du feu et le respect des savoirs des Premières Nations du Québec."
    ),
    "file": FILE,
}

I18N_CATALOG = {
    "en": {
        "title": "Fire Without Matches — Pierre le Fouineur's Notebook No. 3",
        "teaser": (
            "Friction, sacred circle and fire prayer: Notebook No. 3 on fire-making "
            "and respect for First Nations knowledge in Quebec."
        ),
    },
    "es": {
        "title": "Fuego sin cerillas — Cuaderno n° 3 de Pierre le Fouineur",
        "teaser": (
            "Fricción, círculo sagrado y oración del fuego: cuaderno n° 3 sobre "
            "el encendido del fuego y el respeto de los saberes de las Primeras Naciones de Quebec."
        ),
    },
}

REDIRECT = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=78-le-feu-pierre-le-fouineur.html">
  <link rel="canonical" href="78-le-feu-pierre-le-fouineur.html">
  <title>Article #78 — Premières Nations</title>
  <script>location.replace("78-le-feu-pierre-le-fouineur.html");</script>
  <link rel="stylesheet" href="lang-switcher.css">
  <script src="lang-switcher.js" defer></script>
</head>
<body>
  <p><a href="78-le-feu-pierre-le-fouineur.html">Article #78 — Le Feu — ouvrir l'article</a></p>
</body>
</html>
"""


def add_to_catalog():
    for path in (ROOT / "blog-serie-articles.json", ROOT / "pages" / "blog-serie-articles.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        flat = []
        for g in data.get("groups", []):
            flat.extend(g.get("items", []))
        if any(str(it.get("n")) == "78" for it in flat):
            print("catalog already has #78", path.name)
            continue
        flat.append(ITEM)
        data["groups"] = [{"label": "temp", "items": flat}]
        data["stats"] = {
            "articlesNumbered": 78,
            "withFeatured": data.get("stats", {}).get("withFeatured", True),
            "nextArticle": 79,
        }
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("added #78 to", path.name)


def patch_blog_serie_i18n():
    path = ROOT / "locales" / "blog-serie-i18n.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    for lang, entry in I18N_CATALOG.items():
        data.setdefault(lang, {})[FILE] = entry
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched blog-serie-i18n.json")


def write_redirect():
    for name in ("article78.html",):
        (ROOT / name).write_text(REDIRECT, encoding="utf-8")
        pages = ROOT / "pages" / name
        pages.write_text(
            REDIRECT.replace('href="78-', 'href="../78-').replace("url=78-", "url=../78-"),
            encoding="utf-8",
        )
        print("wrote", name)


def patch_77_nav():
    old = '<a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    new = f'<a href="{FILE}">#78 Feu →</a>\n    <a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    for rel in (ROOT / "77-les-techniques-de-peche.html", ROOT / "pages" / "77-les-techniques-de-peche.html"):
        text = rel.read_text(encoding="utf-8")
        if f'href="{FILE}"' in text or 'href="../78-' in text:
            print("77 nav already links to 78", rel.name)
            continue
        prefix = "../" if "pages" in str(rel) else ""
        text = text.replace(old, new.replace(FILE, prefix + FILE))
        rel.write_text(text, encoding="utf-8")
        print("patched nav in", rel.name)


def main():
    add_to_catalog()
    patch_blog_serie_i18n()
    write_redirect()
    patch_77_nav()
    subprocess.run(["python", str(ROOT / "scripts/reorganize-blog-series.py")], check=True)
    subprocess.run(["python", str(ROOT / "scripts/sync-article-count-i18n.py")], check=True)
    print("Step1 done — run build-article-78-i18n.py then patch-article-78-i18n.py")


if __name__ == "__main__":
    main()
