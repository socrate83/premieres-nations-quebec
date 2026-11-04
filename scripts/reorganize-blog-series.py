#!/usr/bin/env python3
"""Réorganise la série d'articles, régénère Articles.html et met à jour
tous les compteurs du site : Home.html, Carnets.html, locales fr/en/es.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG_PATHS = [ROOT / "blog-serie-articles.json", ROOT / "pages" / "blog-serie-articles.json"]
ARTICLES_HTML = ROOT / "Articles.html"
HOME_HTML = ROOT / "Home.html"
CARNETS_HTML = ROOT / "Carnets.html"
LOCALES = [ROOT / "locales" / "fr.json", ROOT / "locales" / "en.json", ROOT / "locales" / "es.json"]
CHUNK = 10


def flatten_items(catalog):
    items = []
    for g in catalog.get("groups", []):
        for it in g.get("items", []):
            items.append((int(str(it["n"])), it))
    items.sort(key=lambda x: x[0])
    return [it for _, it in items]


def series_label(series_num: int, start: int, end: int) -> str:
    return f"Série {series_num} — articles {start} à {end}"


def rebuild_groups(items):
    if not items:
        return []
    max_n = max(int(str(it["n"])) for it in items)
    groups, series_num, start = [], 1, 1
    while start <= max_n:
        end = min(start + CHUNK - 1, max_n)
        chunk = [it for it in items if start <= int(str(it["n"])) <= end]
        if chunk:
            groups.append({"label": series_label(series_num, start, end), "items": chunk})
            series_num += 1
        start += CHUNK
    return groups


def escape(s):
    return html.escape(str(s or ""), quote=True)


def generate_catalog_html(catalog):
    rows = []
    if catalog.get("featured"):
        f = catalog["featured"]
        rows.append(
            f'<li class="articles-item articles-item--featured" data-pn-article-file="{escape(f["file"])}">'
            f'<a href="{escape(f["file"])}"><span class="n">★</span> '
            f'<span class="pn-catalog-title">{escape(f["title"])}</span></a>'
            f'<p class="pn-catalog-teaser">{escape(f.get("teaser", ""))}</p></li>'
        )
    for g in catalog["groups"]:
        nums = [int(str(it["n"])) for it in g["items"]]
        start, end = min(nums), max(nums)
        rows.append(
            f'<li class="articles-group"><h2 data-pn-range-start="{start}" data-pn-range-end="{end}">'
            f'{escape(g["label"])}</h2><ol>'
        )
        for it in g["items"]:
            href = it.get("file", "#")
            rows.append(
                f'<li data-pn-article-file="{escape(href)}">'
                f'<a href="{escape(href)}"><span class="n">#{escape(it["n"])}</span> '
                f'<span class="pn-catalog-title">{escape(it["title"])}</span></a>'
                f'<p class="pn-catalog-teaser">{escape(it.get("teaser", ""))}</p></li>'
            )
        rows.append("</ol></li>")
    return "\n".join(rows)


def patch_articles_html(catalog, max_n):
    text = ARTICLES_HTML.read_text(encoding="utf-8")
    new_ul = generate_catalog_html(catalog)
    text = re.sub(
        r'<ul class="articles-catalog">.*?</ul>',
        f'<ul class="articles-catalog">\n{new_ul}\n  </ul>',
        text, count=1, flags=re.S,
    )
    text = re.sub(
        r"<title>Tous les articles \(1–\d+\)",
        f"<title>Tous les articles (1–{max_n})",
        text,
    )
    text = re.sub(
        r'<meta name="description" content="Catalogue des \d+ articles',
        f'<meta name="description" content="Catalogue des {max_n} articles',
        text,
    )
    text = re.sub(
        r'<meta property="og:title" content="Tous les articles \(1–\d+\)',
        f'<meta property="og:title" content="Tous les articles (1–{max_n})',
        text,
    )
    text = re.sub(
        r'<meta property="og:description" content="Catalogue des \d+ articles',
        f'<meta property="og:description" content="Catalogue des {max_n} articles',
        text,
    )
    text = re.sub(
        r'<meta name="twitter:title" content="Tous les articles \(1–\d+\)',
        f'<meta name="twitter:title" content="Tous les articles (1–{max_n})',
        text,
    )
    text = re.sub(
        r'<meta name="twitter:description" content="Catalogue des \d+ articles',
        f'<meta name="twitter:description" content="Catalogue des {max_n} articles',
        text,
    )
    text = re.sub(
        r'Série numérotée #1 à #\d+',
        f'Série numérotée #1 à #{max_n}',
        text,
    )
    ARTICLES_HTML.write_text(text, encoding="utf-8")


def patch_home_html(max_n):
    text = HOME_HTML.read_text(encoding="utf-8")
    text = re.sub(
        r'(Série thématique — Les articles \()\d+(\))',
        f'\\g<1>{max_n}\\g<2>',
        text,
    )
    text = re.sub(
        r"(#1 à #)\d+",
        f"\\g<1>{max_n}",
        text,
    )
    HOME_HTML.write_text(text, encoding="utf-8")


def patch_carnets_html(max_n):
    text = CARNETS_HTML.read_text(encoding="utf-8")
    text = re.sub(
        r"(Voir les )\d+( articles de la série)",
        f"\\g<1>{max_n}\\g<2>",
        text,
    )
    CARNETS_HTML.write_text(text, encoding="utf-8")


def patch_locales(max_n):
    patterns = [
        (r"(#1 à #)\d+", f"\\g<1>{max_n}"),
        (r"(#1 to #)\d+", f"\\g<1>{max_n}"),
        (r"(#1 a #)\d+", f"\\g<1>{max_n}"),
        (r"(Tous les articles \(1–)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
        (r"(All articles \(1–)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
        (r"(Todos los artículos \(1–)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
        (r"(Série thématique — Les articles \()\d+(\))", f"\\g<1>{max_n}\\g<2>"),
        (r"(Thematic series — Articles \()\d+(\))", f"\\g<1>{max_n}\\g<2>"),
        (r"(Serie temática — Artículos \()\d+(\))", f"\\g<1>{max_n}\\g<2>"),
        (r"(Tous les articles au même endroit\. Série 1 \(#1–#10\) à Série 9 \(#81–#)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
        (r"(All articles in one place\. Series 1 \(#1–#10\) to Series 9 \(#81–#)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
        (r"(Todos los artículos en un solo lugar\. Serie 1 \(#1–#10\) a Serie 9 \(#81–#)\d+(\()", f"\\g<1>{max_n}\\g<2>"),
    ]
    for path in LOCALES:
        text = path.read_text(encoding="utf-8")
        for pat, repl in patterns:
            text = re.sub(pat, repl, text)
        path.write_text(text, encoding="utf-8")


def main():
    catalog = json.loads(CATALOG_PATHS[0].read_text(encoding="utf-8"))
    items = flatten_items(catalog)
    max_n = max(int(str(it["n"])) for it in items)
    catalog["groups"] = rebuild_groups(items)
    catalog["stats"] = {
        "articlesNumbered": max_n,
        "withFeatured": bool(catalog.get("featured")),
        "nextArticle": max_n + 1,
    }
    catalog["introNote"] = (
        f"Tous les articles numérotés du site (#1 à #{max_n} et les prochains) : "
        f"séries de {CHUNK} articles (Série 1 = #1–#{CHUNK}, Série 2 = #{CHUNK + 1}–#{CHUNK * 2}, …). "
        "Mettre à jour via scripts/reorganize-blog-series.py après chaque nouveau numéro."
    )

    for path in CATALOG_PATHS:
        path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    patch_articles_html(catalog, max_n)
    patch_home_html(max_n)
    patch_carnets_html(max_n)
    patch_locales(max_n)

    print(f"Réorganisé en {len(catalog['groups'])} séries, articles 1–{max_n}")
    for g in catalog["groups"]:
        ns = [it["n"] for it in g["items"]]
        print(f"  {g['label']} ({len(ns)} articles)")


if __name__ == "__main__":
    main()
