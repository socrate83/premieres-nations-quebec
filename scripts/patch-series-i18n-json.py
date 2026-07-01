#!/usr/bin/env python3
"""Ajoute encadré série Partie 1/2 dans les JSON EN/ES des articles."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "locales" / "articles"

PATCHES = [
    {
        "file": "21-clans-systemes-parente.json",
        "part": 1,
        "series_en": "Clans and Kinship",
        "series_es": "Clanes y parentesco",
        "p2": "31-clans-parente-premieres-nations.html",
        "p2_n": "#31",
        "title_suffix_en": " — Part 1",
        "title_suffix_es": " — Parte 1",
    },
    {
        "file": "31-clans-parente-premieres-nations.json",
        "part": 2,
        "series_en": "Clans and Kinship",
        "series_es": "Clanes y parentesco",
        "p1": "21-clans-systemes-parente.html",
        "p1_n": "#21",
        "title_suffix_en": " — Part 2",
        "title_suffix_es": " — Parte 2",
    },
    {
        "file": "36-route-commerces-sans-monnaie.json",
        "part": 1,
        "series_en": "Trade Without Money",
        "series_es": "Comercio sin moneda",
        "p2": "39-routes-commerciales.html",
        "p2_n": "#39",
        "title_suffix_en": " — Part 1",
        "title_suffix_es": " — Parte 1",
    },
    {
        "file": "39-routes-commerciales.json",
        "part": 2,
        "series_en": "Trade Without Money",
        "series_es": "Comercio sin moneda",
        "p1": "36-route-commerces-sans-monnaie.html",
        "p1_n": "#36",
        "title_suffix_en": " — Part 2",
        "title_suffix_es": " — Parte 2",
    },
]


def box_en(p):
    if p["part"] == 1:
        return (
            f'<div class="highlight-box" style="text-align:center;"><p><strong>Series "{p["series_en"]}" — Part 1 of 2</strong><br>'
            f'Continue: <a href="{p["p2"]}">Part 2 — article {p["p2_n"]}</a></p></div>'
        )
    return (
        f'<div class="highlight-box" style="text-align:center;"><p><strong>Series "{p["series_en"]}" — Part 2 of 2</strong><br>'
        f'<a href="{p["p1"]}">← Part 1 — article {p["p1_n"]}</a></p></div>'
    )


def box_es(p):
    if p["part"] == 1:
        return (
            f'<div class="highlight-box" style="text-align:center;"><p><strong>Serie « {p["series_es"]} » — Parte 1 de 2</strong><br>'
            f'Continúa: <a href="{p["p2"]}">Parte 2 — artículo {p["p2_n"]}</a></p></div>'
        )
    return (
        f'<div class="highlight-box" style="text-align:center;"><p><strong>Serie « {p["series_es"]} » — Parte 2 de 2</strong><br>'
        f'<a href="{p["p1"]}">← Parte 1 — artículo {p["p1_n"]}</a></p></div>'
    )


def inject(html: str, box: str) -> str:
    if "Part 1 of 2" in html or "Parte 1 de 2" in html or "Part 2 of 2" in html or "Parte 2 de 2" in html:
        return html
    needle = "</article>\n<hr>"
    if needle not in html:
        needle = "</article>\r\n<hr>"
    if needle not in html:
        raise ValueError("structure article inattendue")
    return html.replace(needle, f"</article>\n\n    {box}\n<hr>", 1)


def main():
    for p in PATCHES:
        path = ROOT / p["file"]
        if not path.exists():
            print("skip (absent)", p["file"])
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        for lang, suffix, box_fn in (("en", p["title_suffix_en"], box_en), ("es", p["title_suffix_es"], box_es)):
            if lang not in data:
                continue
            t = data[lang].get("title", "")
            if suffix.strip(" —") not in t:
                data[lang]["title"] = t.rstrip() + suffix
            data[lang]["html"] = inject(data[lang]["html"], box_fn(p))
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("OK", p["file"])


if __name__ == "__main__":
    main()
