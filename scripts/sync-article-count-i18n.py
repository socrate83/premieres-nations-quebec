#!/usr/bin/env python3
"""Sync « Articles 1–N » labels from blog-serie-articles.json into locales/*.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "blog-serie-articles.json"


def load_count() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    n = data.get("stats", {}).get("articlesNumbered")
    if not isinstance(n, int) or n < 1:
        raise SystemExit("stats.articlesNumbered manquant dans blog-serie-articles.json")
    return n


PATCHES = {
    "fr": lambda n: {
        "nav.articles": f"📚 Articles 1–{n}",
        "nav.allArticles": f"📚 Tous les articles (1–{n})",
        "home.serieTitle": f"Série thématique — Les articles ({n})",
        "home.serieSub": (
            f"{(n + 9) // 10} séries de dix articles (#1 à #{n}) : spiritualité, histoire, "
            "savoir-faire québécois, Sagesse Oubliée, culture vivante… Chaque carte ouvre l'article complet."
        ),
        "home.serieNotice": (
            f"Tous les articles au même endroit. Série 1 (#1–#10) à Série {(n + 9) // 10} "
            f"(#{((n - 1) // 10) * 10 + 1}–#{n}) — lecture vocale sur chaque page."
        ),
        "home.seeAllArticles": f"📚 Voir tous les articles (#1 à #{n}) →",
        "articlesPage.intro": f"Série numérotée #1 à #{n} — chaque article propose la lecture vocale (▶ Écouter).",
        "articlesPage.metaTitle": f"Tous les articles (1–{n}) — Premières Nations du Québec",
    },
    "en": lambda n: {
        "nav.articles": f"📚 Articles 1–{n}",
        "nav.allArticles": f"📚 All articles (1–{n})",
        "home.serieTitle": f"Thematic series — Articles ({n})",
        "home.serieSub": (
            f"{(n + 9) // 10} series of ten articles (#1 to #{n}): spirituality, history, "
            "Quebec know-how, forgotten wisdom, living culture… Each card opens the full article."
        ),
        "home.serieNotice": (
            f"All articles in one place. Series 1 (#1–#10) to Series {(n + 9) // 10} "
            f"(#{((n - 1) // 10) * 10 + 1}–#{n}) — listen button (▶ Listen) on each page."
        ),
        "home.seeAllArticles": f"📚 See all articles (#1 to #{n}) →",
        "articlesPage.intro": f"Numbered series #1 to #{n} — each article includes read-aloud (▶ Listen).",
        "articlesPage.metaTitle": f"All articles (1–{n}) — First Nations of Quebec",
    },
    "es": lambda n: {
        "nav.articles": f"📚 Artículos 1–{n}",
        "nav.allArticles": f"📚 Todos los artículos (1–{n})",
        "home.serieTitle": f"Serie temática — Artículos ({n})",
        "home.serieSub": (
            f"{(n + 9) // 10} series de diez artículos (#1 a #{n}): espiritualidad, historia, "
            "saberes de Québec, sabiduría olvidada, cultura viva… Cada tarjeta abre el artículo completo."
        ),
        "home.serieNotice": (
            f"Todos los artículos en un solo lugar. Serie 1 (#1–#10) a Serie {(n + 9) // 10} "
            f"(#{((n - 1) // 10) * 10 + 1}–#{n}) — lectura en voz alta (▶ Escuchar) en cada página."
        ),
        "home.seeAllArticles": f"📚 Ver todos los artículos (#1 a #{n}) →",
        "articlesPage.intro": f"Serie numerada #1 a #{n} — cada artículo incluye lectura en voz alta (▶ Escuchar).",
        "articlesPage.metaTitle": f"Todos los artículos (1–{n}) — Primeras Naciones de Québec",
    },
}


def set_nested(obj, dotted_key, value):
    parts = dotted_key.split(".")
    for p in parts[:-1]:
        obj = obj[p]
    obj[parts[-1]] = value


def patch_html(n: int):
    home = ROOT / "Home.html"
    text = home.read_text(encoding="utf-8")
    import re
    text = re.sub(r'(data-i18n="nav\.articles">📚 Articles 1–)\d+', rf"\g<1>{n}", text)
    text = re.sub(r"Neuf sous-séries de #1 à #\d+", f"Neuf sous-séries de #1 à #{n}", text)
    text = re.sub(r"Fiches #1–#51, puis #52–#\d+", f"Fiches #1–#51, puis #52–#{n}", text)
    text = re.sub(r"Voir tous les articles \(#1 à #\d+\)", f"Voir tous les articles (#1 à #{n})", text)
    home.write_text(text, encoding="utf-8")

    articles = ROOT / "Articles.html"
    text = articles.read_text(encoding="utf-8")
    text = re.sub(r"<title>Tous les articles \(1–\d+\)", f"<title>Tous les articles (1–{n})", text)
    text = re.sub(r"Série numérotée #1 à #\d+", f"Série numérotée #1 à #{n}", text)
    articles.write_text(text, encoding="utf-8")


def main():
    n = load_count()
    for lang, fn in PATCHES.items():
        path = ROOT / "locales" / f"{lang}.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        for key, val in fn(n).items():
            set_nested(data, key, val)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"locales/{lang}.json -> 1-{n}")
    patch_html(n)
    print(f"Home.html + Articles.html -> 1-{n}")
    print(f"Source: stats.articlesNumbered = {n}")


if __name__ == "__main__":
    main()
