#!/usr/bin/env python3
"""Étape 1 article #79 — catalogue, redirect, nav #78→#79, Carnets n°4."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = "79-l-hiver-pierre-le-fouineur"
FILE = f"{SLUG}.html"

ITEM = {
    "n": "79",
    "title": "L'Hiver sur le territoire — Partie 1 (Carnet n° 4)",
    "teaser": (
        "C'est quoi l'hiver au Québec : neige, glace, froid et vigilance sur le territoire — "
        "le carnet n° 4 de Pierre le Fouineur, publié en quatre parties."
    ),
    "file": FILE,
}

I18N_CATALOG = {
    "en": {
        "title": "Winter on the Land — Part 1 (Pierre le Fouineur's Notebook No. 4)",
        "teaser": (
            "What winter in Quebec really means: snow, ice, cold and vigilance on the land — "
            "Notebook No. 4 in four parts."
        ),
    },
    "es": {
        "title": "El invierno en el territorio — Parte 1 (Cuaderno n° 4 de Pierre le Fouineur)",
        "teaser": (
            "Qué es el invierno en Quebec: nieve, hielo, frío y vigilancia en el territorio — "
            "cuaderno n° 4 en cuatro partes."
        ),
    },
}

REDIRECT = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=79-l-hiver-pierre-le-fouineur.html">
  <link rel="canonical" href="79-l-hiver-pierre-le-fouineur.html">
  <title>Article #79 — Premières Nations</title>
  <script>location.replace("79-l-hiver-pierre-le-fouineur.html");</script>
  <link rel="stylesheet" href="lang-switcher.css">
  <script src="lang-switcher.js" defer></script>
</head>
<body>
  <p><a href="79-l-hiver-pierre-le-fouineur.html">Article #79 — L'Hiver sur le territoire — ouvrir l'article</a></p>
</body>
</html>
"""

CARNETS_CARD = """
    <article class="card">
      <img src="images/articles/79-hiver-territoire.png" alt="Hiver sur le territoire — carnet n° 4">
      <div class="card-body">
        <div class="card-tag">Carnet n° 4 · Article #79 · Nouveau</div>
        <h2>❄️ L'Hiver sur le territoire</h2>
        <p>Neige, traces, traîneaux et feu d'hiver — reportage en <strong>4 parties</strong> (une tous les 2 jours).</p>
        <a class="btn" href="79-l-hiver-pierre-le-fouineur.html">Lire la partie 1 →</a>
      </div>
    </article>
"""


def add_to_catalog():
    for path in (ROOT / "blog-serie-articles.json", ROOT / "pages" / "blog-serie-articles.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        flat = []
        for g in data.get("groups", []):
            flat.extend(g.get("items", []))
        if any(str(it.get("n")) == "79" for it in flat):
            print("catalog already has #79", path.name)
            continue
        flat.append(ITEM)
        data["groups"] = [{"label": "temp", "items": flat}]
        data["stats"] = {
            "articlesNumbered": 79,
            "withFeatured": data.get("stats", {}).get("withFeatured", True),
            "nextArticle": 80,
        }
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("added #79 to", path.name)


def patch_blog_serie_i18n():
    path = ROOT / "locales" / "blog-serie-i18n.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    for lang, entry in I18N_CATALOG.items():
        data.setdefault(lang, {})[FILE] = entry
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched blog-serie-i18n.json")


def write_redirect():
    for name in ("article79.html",):
        (ROOT / name).write_text(REDIRECT, encoding="utf-8")
        pages = ROOT / "pages" / name
        pages.write_text(
            REDIRECT.replace('href="79-', 'href="../79-').replace("url=79-", "url=../79-"),
            encoding="utf-8",
        )
        print("wrote", name)


def patch_78_nav():
    old = '<a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    new = f'<a href="{FILE}">#79 Hiver →</a>\n    <a href="Articles.html">📚 Tous les articles</a>\n</nav>'
    for rel in (ROOT / "78-le-feu-pierre-le-fouineur.html", ROOT / "pages" / "78-le-feu-pierre-le-fouineur.html"):
        if not rel.exists():
            continue
        text = rel.read_text(encoding="utf-8")
        if f'href="{FILE}"' in text or 'href="../79-' in text:
            print("78 nav already links to 79", rel.name)
            continue
        prefix = "../" if "pages" in str(rel) else ""
        text = text.replace(old, new.replace(FILE, prefix + FILE))
        rel.write_text(text, encoding="utf-8")
        print("patched nav in", rel.name)


def patch_carnets():
    path = ROOT / "Carnets.html"
    text = path.read_text(encoding="utf-8")
    if "79-l-hiver-pierre-le-fouineur.html" in text:
        print("Carnets.html already has #79")
        return
    marker = "  </div>\n\n  <p class=\"cta-all\">"
    if marker not in text:
        raise SystemExit("Carnets.html marker not found")
    text = text.replace(marker, CARNETS_CARD + marker, 1)
    text = text.replace("Voir les 78 articles", "Voir les 79 articles")
    path.write_text(text, encoding="utf-8")
    print("patched Carnets.html")


def main():
    subprocess.run(
        ["python", str(ROOT / "scripts/build-article-79-episodes.py"), "--publish-step1"],
        check=True,
    )
    add_to_catalog()
    patch_blog_serie_i18n()
    write_redirect()
    patch_78_nav()
    patch_carnets()
    subprocess.run(["python", str(ROOT / "scripts/reorganize-blog-series.py")], check=True)
    subprocess.run(["python", str(ROOT / "scripts/sync-article-count-i18n.py")], check=True)
    subprocess.run(["python", str(ROOT / "scripts/build-sitemap.py")], check=True)
    print("Article #79 partie 1 — prêt pour git push")


if __name__ == "__main__":
    main()
