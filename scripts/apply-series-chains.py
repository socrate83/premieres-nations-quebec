#!/usr/bin/env python3
"""Regroupe des articles proches en séries Partie 1…N (catalogue + HTML + i18n)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CHAINS = [
    {
        "name_fr": "La Médecine traditionnelle",
        "name_en": "Traditional Medicine",
        "name_es": "Medicina tradicional",
        "parts": [
            {
                "file": "05-medecine-traditionnelle.html",
                "title_base_fr": "Médecine Traditionnelle",
                "teaser_fr": "Pharmacopée et savoirs de guérison : partie 1 sur 3 (suite : #24, #56).",
                "insert_after": "sans jamais citer leurs sources</p>",
                "nav_before": '<p class="footer">Article rédigé',
                "prev_out": ("04-iroquois-democratie.html", "#4 La Démocratie Iroquoise"),
            },
            {
                "file": "24-chamanes-medecine.html",
                "title_base_fr": "Les Chamanes et les Hommes/Femmes Médecine",
                "teaser_fr": "Guérisseurs et médecine spirituelle : partie 2 sur 3 (suite : #56).",
                "insert_after": "qui guérissent entre deux mondes</p>",
                "nav_before": '<p class="footer">Article rédigé',
            },
            {
                "file": "article56.html",
                "title_base_fr": "La Médecine Traditionnelle Autochtone — Plantes et Guérisseurs",
                "teaser_fr": "Plantes médicinales et guérisseurs : partie 3 sur 3 (suite des articles #5 et #24).",
                "insert_after": '        <div class="btn-row">',
                "nav_before": '<div class="nav-art">',
                "next_out": ("article57.html", "#57 La Sexualité sans Culpabilité"),
            },
        ],
    },
    {
        "name_fr": "L'alimentation traditionnelle",
        "name_en": "Traditional Food",
        "name_es": "Alimentación tradicional",
        "parts": [
            {
                "file": "14-cuisine-traditionnelle.html",
                "title_base_fr": "La Cuisine Traditionnelle Autochtone",
                "teaser_fr": "Saveurs du territoire : partie 1 sur 4 (suite : #60, #66, #72).",
                "insert_after": "qui ont nourri des civilisations</p>",
                "nav_before": '<p class="footer">Article rédigé',
                "prev_out": ("13-mythes-et-legendes.html", "#13 Les Conteurs et leurs Histoires"),
            },
            {
                "file": "article60.html",
                "title_base_fr": "La Nourriture sans Supermarché",
                "teaser_fr": "Gastronomie ancestrale : partie 2 sur 4 (suite : #66, #72).",
                "insert_after": '        Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958"',
                "nav_before": "    <div class=\"hashtags\">",
            },
            {
                "file": "article66.html",
                "title_base_fr": "De la bannique au saumon fumé",
                "teaser_fr": "Cuisine autochtone tradition et modernité : partie 3 sur 4 (suite : #72).",
                "insert_after": '    Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958"',
                "nav_before": "<div class=\"hashtags\">",
            },
            {
                "file": "article72.html",
                "title_base_fr": "L'Alimentation Traditionnelle Autochtone du Québec",
                "teaser_fr": "Territoire, mémoire et renaissance culinaire : partie 4 sur 4 (suite des articles #14, #60, #66).",
                "insert_after": '    Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958"',
                "nav_before": "<div class=\"hashtags\">",
                "next_out": ("73-l-ours-gardien-des-mondes.html", "#73 L'Ours, Gardien des Mondes"),
            },
        ],
    },
    {
        "name_fr": "Les Langues autochtones",
        "name_en": "Indigenous Languages",
        "name_es": "Lenguas indígenas",
        "parts": [
            {
                "file": "12-langues-autochtones.html",
                "title_base_fr": "Les Langues Autochtones",
                "teaser_fr": "Trésors linguistiques menacés : partie 1 sur 2 (suite : #64).",
                "insert_after": "il n'en restera peut-être plus que 10.</p>",
                "nav_before": '<p class="footer">Article rédigé',
                "prev_out": ("11-qui-sont-les-metis.html", "#11 Qui sont les Métis ?"),
            },
            {
                "file": "article64.html",
                "title_base_fr": "Langues vivantes, langues menacées",
                "teaser_fr": "Panorama linguistique des nations du Québec : partie 2 sur 2 (suite de l'article #12).",
                "insert_after": '    Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958"',
                "nav_before": "<div class=\"hashtags\">",
                "next_out": ("article65.html", "#65 Artisanat au cœur du territoire"),
            },
        ],
    },
]

I18N_TEASERS = {
    "05-medecine-traditionnelle.html": {
        "en": ("Traditional Medicine — Part 1", "Pharmacy and healing knowledge: part 1 of 3 (continues in #24, #56)."),
        "es": ("Medicina tradicional — Parte 1", "Farmacopea y saberes curativos: parte 1 de 3 (continúa en #24, #56)."),
    },
    "24-chamanes-medecine.html": {
        "en": ("Shamans and Medicine People — Part 2", "Healers and spiritual medicine: part 2 of 3 (continues in #56)."),
        "es": ("Chamanes y personas medicina — Parte 2", "Curanderos y medicina espiritual: parte 2 de 3 (continúa en #56)."),
    },
    "article56.html": {
        "en": ("Traditional Indigenous Medicine — Plants and Healers — Part 3", "Medicinal plants and healers: part 3 of 3 (follows #5 and #24)."),
        "es": ("Medicina tradicional indígena — Plantas y curanderos — Parte 3", "Plantas medicinales y curanderos: parte 3 de 3 (continúa #5 y #24)."),
    },
    "14-cuisine-traditionnelle.html": {
        "en": ("Traditional Indigenous Cuisine — Part 1", "Flavors of the land: part 1 of 4 (continues in #60, #66, #72)."),
        "es": ("Cocina tradicional indígena — Parte 1", "Sabores del territorio: parte 1 de 4 (continúa en #60, #66, #72)."),
    },
    "article60.html": {
        "en": ("Food Without Supermarkets — Part 2", "Ancestral gastronomy: part 2 of 4 (continues in #66, #72)."),
        "es": ("Alimentación sin supermercados — Parte 2", "Gastronomía ancestral: parte 2 de 4 (continúa en #66, #72)."),
    },
    "article66.html": {
        "en": ("From Bannock to Smoked Salmon — Part 3", "Indigenous cuisine past and present: part 3 of 4 (continues in #72)."),
        "es": ("De la bannique al salmón ahumado — Parte 3", "Cocina indígena tradición y modernidad: parte 3 de 4 (continúa en #72)."),
    },
    "article72.html": {
        "en": ("Traditional Indigenous Food in Quebec — Part 4", "Land, memory and culinary renaissance: part 4 of 4 (follows #14, #60, #66)."),
        "es": ("Alimentación tradicional indígena en Quebec — Parte 4", "Territorio, memoria y renacimiento culinario: parte 4 de 4 (continúa #14, #60, #66)."),
    },
    "12-langues-autochtones.html": {
        "en": ("Indigenous Languages — Part 1", "Endangered linguistic treasures: part 1 of 2 (continues in #64)."),
        "es": ("Lenguas indígenas — Parte 1", "Tesoros lingüísticos amenazados: parte 1 de 2 (continúa en #64)."),
    },
    "article64.html": {
        "en": ("Living Languages, Endangered Languages — Part 2", "Linguistic panorama of Quebec nations: part 2 of 2 (follows article #12)."),
        "es": ("Lenguas vivas, lenguas amenazadas — Parte 2", "Panorama lingüístico de las naciones de Quebec: parte 2 de 2 (continúa el artículo #12)."),
    },
}


def part_label(i: int, n: int) -> str:
    return f"Partie {i} sur {n}"


def series_box_fr(name: str, i: int, n: int, parts: list[dict]) -> str:
    lines = [f'<strong>Série « {name} » — {part_label(i, n)}</strong>']
    links = []
    if i > 1:
        p = parts[i - 2]
        num = re.match(r"(\d+)", p["file"]) or re.search(r"article(\d+)", p["file"])
        nprev = num.group(1) if num else "?"
        links.append(f'<a href="{p["file"]}">← Partie {i - 1} — article #{nprev}</a>')
    if i < n:
        p = parts[i]
        num = re.match(r"(\d+)", p["file"]) or re.search(r"article(\d+)", p["file"])
        nnext = num.group(1) if num else "?"
        links.append(f'<a href="{p["file"]}">Partie {i + 1} — article #{nnext} →</a>')
    body = "<br>\n    ".join(links) if links else ""
    return f"""    <div class="highlight-box" style="text-align:center;">
    <p>{lines[0]}<br>
    {body}</p>
    </div>
"""


def series_nav(i: int, n: int, parts: list[dict], part: dict) -> str:
    if i == 1:
        prev_h, prev_l = part.get("prev_out", ("Home.html", "🏠 Accueil"))
        nxt = parts[1]
        num = re.search(r"(\d+)", nxt["file"])
        nn = num.group(1) if num else str(i + 1)
        return f"""    <nav aria-label="Navigation série" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:2rem 0;padding:1rem 1.25rem;background:#f4efe6;border-radius:8px;border:1px solid #d4a574;">
      <a href="{prev_h}" style="color:#2c5530;text-decoration:none;">← {prev_l}</a>
      <a href="{nxt['file']}" style="color:#2c5530;text-decoration:none;font-weight:bold;">Partie {i + 1} — #{nn} →</a>
    </nav>

"""
    if i == n:
        prev_p = parts[i - 2]
        num = re.search(r"(\d+)", prev_p["file"])
        pn = num.group(1) if num else str(i - 1)
        nxt_h, nxt_l = part.get("next_out", ("Articles.html", "📚 Tous les articles"))
        return f"""    <nav aria-label="Navigation série" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:2rem 0;padding:1rem 1.25rem;background:#f4efe6;border-radius:8px;border:1px solid #d4a574;">
      <a href="{prev_p['file']}" style="color:#2c5530;text-decoration:none;font-weight:bold;">← Partie {i - 1} — #{pn}</a>
      <a href="{nxt_h}" style="color:#2c5530;text-decoration:none;">{nxt_l} →</a>
    </nav>

"""
    prev_p = parts[i - 2]
    nxt_p = parts[i]
    pn = re.search(r"(\d+)", prev_p["file"]).group(1)
    nn = re.search(r"(\d+)", nxt_p["file"]).group(1)
    return f"""    <nav aria-label="Navigation série" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:2rem 0;padding:1rem 1.25rem;background:#f4efe6;border-radius:8px;border:1px solid #d4a574;">
      <a href="{prev_p['file']}" style="color:#2c5530;text-decoration:none;font-weight:bold;">← Partie {i - 1} — #{pn}</a>
      <a href="{nxt_p['file']}" style="color:#2c5530;text-decoration:none;font-weight:bold;">Partie {i + 1} — #{nn} →</a>
    </nav>

"""


def patch_html(path: Path, chain: dict, idx: int) -> None:
    parts = chain["parts"]
    part = parts[idx]
    n = len(parts)
    i = idx + 1
    text = path.read_text(encoding="utf-8")
    if part_label(i, n) in text:
        return
    box = series_box_fr(chain["name_fr"], i, n, parts)
    if part["insert_after"] not in text:
        raise SystemExit(f"insert_after introuvable dans {path}")
    text = text.replace(part["insert_after"], part["insert_after"] + "\n\n" + box, 1)
    nav = series_nav(i, n, parts, part)
    if part["nav_before"] not in text:
        raise SystemExit(f"nav_before introuvable dans {path}")
    text = text.replace(part["nav_before"], nav + part["nav_before"], 1)
    path.write_text(text, encoding="utf-8")
    print("HTML", path.relative_to(ROOT))


def update_catalog(catalog: dict) -> None:
    for chain in CHAINS:
        n = len(chain["parts"])
        for idx, part in enumerate(chain["parts"]):
            i = idx + 1
            title = f"{part['title_base_fr']} — Partie {i}"
            teaser = part["teaser_fr"]
            for g in catalog.get("groups", []):
                for it in g.get("items", []):
                    if it.get("file") == part["file"]:
                        it["title"] = title
                        it["teaser"] = teaser


def update_articles_html(html: str) -> str:
    for chain in CHAINS:
        for idx, part in enumerate(chain["parts"]):
            i = idx + 1
            title = f"{part['title_base_fr']} — Partie {i}"
            teaser = part["teaser_fr"].replace("'", "&#x27;")
            pat = rf'(<li data-pn-article-file="{re.escape(part["file"])}"><a href="{re.escape(part["file"])}"><span class="n">#\d+</span> <span class="pn-catalog-title">)(.*?)(</span></a><p class="pn-catalog-teaser">)(.*?)(</p></li>)'
            repl = rf"\1{title}\3{teaser}\5"
            html2 = re.sub(pat, repl, html, count=1)
            if html2 == html:
                print("WARN Articles.html pas trouvé:", part["file"])
            html = html2
    return html


def update_blog_i18n(data: dict) -> None:
    for lang in ("en", "es"):
        block = data.get(lang, {})
        for part in sum((c["parts"] for c in CHAINS), []):
            key = part["file"]
            if key not in block:
                continue
            t, te = I18N_TEASERS[key][lang]
            block[key] = {"title": t, "teaser": te}


def patch_article_json(slug_file: str, chain: dict, idx: int) -> None:
    slug = slug_file.replace(".html", "")
    path = ROOT / "locales" / "articles" / f"{slug}.json"
    if not path.exists():
        print("skip JSON", slug)
        return
    parts = chain["parts"]
    n = len(parts)
    i = idx + 1
    data = json.loads(path.read_text(encoding="utf-8"))
    for lang, key in (("en", "name_en"), ("es", "name_es")):
        if lang not in data:
            continue
        t_base, _ = I18N_TEASERS[slug_file][lang]
        if "Part" not in data[lang].get("title", "") and "Parte" not in data[lang].get("title", ""):
            data[lang]["title"] = t_base
        html = data[lang]["html"]
        if "Part 1 of" in html or "Parte 1 de" in html or "Part 2 of" in html or "Part 3 of" in html or "Part 4 of" in html:
            continue
        name = chain[key]
        if i == 1 and n > 1:
            nxt = parts[1]["file"]
            nn = re.search(r"(\d+)", nxt).group(1)
            if lang == "en":
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Series "{name}" — Part {i} of {n}</strong><br>Continue: <a href="{nxt}">Part {i+1} — article #{nn}</a></p></div>'
            else:
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Serie « {name} » — Parte {i} de {n}</strong><br>Continúa: <a href="{nxt}">Parte {i+1} — artículo #{nn}</a></p></div>'
        elif i == n and n > 1:
            prv = parts[i - 2]["file"]
            pn = re.search(r"(\d+)", prv).group(1)
            if lang == "en":
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Series "{name}" — Part {i} of {n}</strong><br><a href="{prv}">← Part {i-1} — article #{pn}</a></p></div>'
            else:
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Serie « {name} » — Parte {i} de {n}</strong><br><a href="{prv}">← Parte {i-1} — artículo #{pn}</a></p></div>'
        elif n > 2:
            prv = parts[i - 2]["file"]
            nxt = parts[i]["file"]
            pn = re.search(r"(\d+)", prv).group(1)
            nn = re.search(r"(\d+)", nxt).group(1)
            if lang == "en":
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Series "{name}" — Part {i} of {n}</strong><br><a href="{prv}">← Part {i-1} — #{pn}</a> · <a href="{nxt}">Part {i+1} — #{nn} →</a></p></div>'
            else:
                box = f'<div class="highlight-box" style="text-align:center;"><p><strong>Serie « {name} » — Parte {i} de {n}</strong><br><a href="{prv}">← Parte {i-1} — #{pn}</a> · <a href="{nxt}">Parte {i+1} — #{nn} →</a></p></div>'
        else:
            continue
        for needle in ("</article>\n<hr>", "</article>\r\n<hr>"):
            if needle in html:
                html = html.replace(needle, f"</article>\n\n    {box}\n<hr>", 1)
                break
        else:
            # article52-style: after subtitle in article block
            m = re.search(r"(<p class=\"subtitle\">[^<]*</p>)", html)
            if m:
                html = html.replace(m.group(1), m.group(1) + f"\n\n    {box}", 1)
        data[lang]["html"] = html
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("JSON", path.name)


def main() -> None:
    for chain in CHAINS:
        for idx, part in enumerate(chain["parts"]):
            for rel in (part["file"], f"pages/{part['file']}"):
                p = ROOT / rel
                if p.exists():
                    patch_html(p, chain, idx)
            patch_article_json(part["file"], chain, idx)

    for rel in ("blog-serie-articles.json", "pages/blog-serie-articles.json"):
        p = ROOT / rel
        cat = json.loads(p.read_text(encoding="utf-8"))
        update_catalog(cat)
        p.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("catalog", rel)

    ap = ROOT / "Articles.html"
    ap.write_text(update_articles_html(ap.read_text(encoding="utf-8")), encoding="utf-8")
    print("Articles.html")

    bi = ROOT / "locales" / "blog-serie-i18n.json"
    data = json.loads(bi.read_text(encoding="utf-8"))
    update_blog_i18n(data)
    bi.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("blog-serie-i18n.json")


if __name__ == "__main__":
    main()
