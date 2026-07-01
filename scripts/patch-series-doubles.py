#!/usr/bin/env python3
"""Marque des paires d'articles comme Partie 1 / Partie 2 (HTML root + pages/)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SERIES = [
    {
        "name": "Les Clans et la Parenté",
        "name_en": "Clans and Kinship",
        "name_es": "Clanes y parentesco",
        "p1": {
            "file": "21-clans-systemes-parente.html",
            "subtitle_end": "quand la famille s'étend bien au-delà de ce que nous imaginons</p>",
            "prev": ("20-art-rupestre.html", "#20 L'Art Rupestre"),
            "p2": ("31-clans-parente-premieres-nations.html", "#31"),
            "nav_before": '<p class="footer">Article rédigé avec respect',
        },
        "p2": {
            "file": "31-clans-parente-premieres-nations.html",
            "subtitle_end": "des peuples autochtones du Nord-Est de l'Amérique</p>",
            "prev": ("21-clans-systemes-parente.html", "Partie 1 — #21"),
            "next": ("32-epidemies-avant-cartier.html", "#32 Les Épidémies Avant Cartier"),
            "nav_before": '<p><em>Article rédigé avec respect',
        },
    },
    {
        "name": "Le Commerce sans monnaie",
        "name_en": "Trade Without Money",
        "name_es": "Comercio sin moneda",
        "p1": {
            "file": "36-route-commerces-sans-monnaie.html",
            "subtitle_end": "sans même une pièce de monnaie ?</p>",
            "prev": ("35-navigateurs-foret.html", "#35 Les Navigateurs de la Forêt"),
            "p2": ("39-routes-commerciales.html", "#39"),
            "nav_before": "    <hr>\n\n    <h3>Sources</h3>",
        },
        "p2": {
            "file": "39-routes-commerciales.html",
            "subtitle_end": "reliait l'Atlantique aux Rocheuses...</p>",
            "prev": ("36-route-commerces-sans-monnaie.html", "Partie 1 — #36"),
            "next": ("40-feu-sans-allumettes.html", "#40 Le Feu (Carnet #78)"),
            "nav_before": "    <hr>\n\n    <h3>Sources</h3>",
        },
    },
]

BOX_P1 = """    <div class="highlight-box" style="text-align:center;">
    <p><strong>Série « {name} » — Partie 1 sur 2</strong><br>
    Suite : <a href="{p2_href}">Partie 2 — article {p2_n}</a></p>
    </div>
"""
BOX_P2 = """    <div class="highlight-box" style="text-align:center;">
    <p><strong>Série « {name} » — Partie 2 sur 2</strong><br>
    <a href="{p1_href}">← Partie 1 — article {p1_n}</a></p>
    </div>
"""

NAV_P1 = """    <nav aria-label="Navigation série" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:2rem 0;padding:1rem 1.25rem;background:#f4efe6;border-radius:8px;border:1px solid #d4a574;">
      <a href="{prev_href}" style="color:#2c5530;text-decoration:none;">← {prev_label}</a>
      <a href="{p2_href}" style="color:#2c5530;text-decoration:none;font-weight:bold;">Partie 2 — {p2_label} →</a>
    </nav>

"""

NAV_P2 = """    <nav aria-label="Navigation série" style="display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;margin:2rem 0;padding:1rem 1.25rem;background:#f4efe6;border-radius:8px;border:1px solid #d4a574;">
      <a href="{prev_href}" style="color:#2c5530;text-decoration:none;font-weight:bold;">← {prev_label}</a>
      <a href="{next_href}" style="color:#2c5530;text-decoration:none;">{next_label} →</a>
    </nav>

"""


def patch_html(path: Path, part: str, cfg: dict, series: dict) -> None:
    text = path.read_text(encoding="utf-8")
    marker = f"Partie 1 sur 2" if part == "p1" else "Partie 2 sur 2"
    if marker in text:
        return

    sub = cfg["subtitle_end"]
    if part == "p1":
        box = BOX_P1.format(
            name=series["name"],
            p2_href=cfg["p2"][0],
            p2_n=cfg["p2"][1],
        )
        nav = NAV_P1.format(
            prev_href=cfg["prev"][0],
            prev_label=cfg["prev"][1],
            p2_href=cfg["p2"][0],
            p2_label=cfg["p2"][1],
        )
    else:
        p1_n = series["p1"]["file"].split("-")[0]
        box = BOX_P2.format(
            name=series["name"],
            p1_href=cfg["prev"][0],
            p1_n=p1_n if p1_n.isdigit() else "#" + series["p1"]["file"][:2],
        )
        # fix p1_n from file prefix
        p1_num = series["p1"]["file"].split("-")[0]
        box = BOX_P2.format(
            name=series["name"],
            p1_href=cfg["prev"][0],
            p1_n="#" + p1_num,
        )
        nav = NAV_P2.format(
            prev_href=cfg["prev"][0],
            prev_label=cfg["prev"][1],
            next_href=cfg["next"][0],
            next_label=cfg["next"][1],
        )

    if sub not in text:
        raise SystemExit(f"subtitle introuvable dans {path}")
    text = text.replace(sub, sub + "\n\n" + box, 1)

    before = cfg["nav_before"]
    if before not in text:
        raise SystemExit(f"ancre nav introuvable dans {path}")
    text = text.replace(before, nav + before, 1)
    path.write_text(text, encoding="utf-8")
    print("OK", path.relative_to(ROOT))


def main():
    for series in SERIES:
        for part_key in ("p1", "p2"):
            cfg = series[part_key]
            for rel in (cfg["file"], f"pages/{cfg['file']}"):
                patch_html(ROOT / rel, part_key, cfg, series)


if __name__ == "__main__":
    main()
