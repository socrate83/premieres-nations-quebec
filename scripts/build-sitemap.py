#!/usr/bin/env python3
"""Régénère sitemap.xml. Usage: python scripts/build-sitemap.py"""
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://socrate83.github.io/premieres-nations-quebec"
TODAY = date.today().isoformat()

STATIC = [
    ("Home.html", "1.0", "weekly"),
    ("Carnets.html", "0.95", "weekly"),
    ("Articles.html", "0.95", "weekly"),
    ("Videos.html", "0.7", "weekly"),
    ("Audio.html", "0.7", "weekly"),
    ("famille-premieres-nations.html", "0.85", "monthly"),
]

NATIONS = [
    "Abenaquis", "Algonquins", "Atikamekw", "Cris", "HuronsWendat", "Innus", "Inuits",
    "Malecites", "Micmacs", "Mohawks", "Naskapis",
]


def article_urls():
    for name in ("blog-serie-articles.json", "pages/blog-serie-articles.json"):
        fp = ROOT / name
        if fp.exists():
            data = json.loads(fp.read_text(encoding="utf-8"))
            files = set()
            featured = data.get("featured")
            if featured and featured.get("file"):
                files.add(featured["file"])
            for block in data.get("groups", data.get("series", [])):
                for item in block.get("items", []):
                    f = item.get("file", "")
                    if f and not f.startswith("http"):
                        files.add(f)
            carnets = ("76-", "77-", "78-", "79-")
            return sorted(files, key=lambda x: (0 if any(x.startswith(c) for c in carnets) else 1, x))
    return []


def main():
    entries = []
    for loc, pri, freq in STATIC:
        entries.append((loc, pri, freq))
    for n in NATIONS:
        entries.append((f"{n}.html", "0.85", "monthly"))
    for f in article_urls():
        pri = "0.9" if any(f.startswith(c) for c in ("76-", "77-", "78-", "79-")) else "0.75"
        entries.append((f, pri, "monthly"))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, pri, freq in entries:
        lines.append("  <url>")
        lines.append(f"    <loc>{BASE}/{loc}</loc>")
        lines.append(f"    <lastmod>{TODAY}</lastmod>")
        lines.append(f"    <changefreq>{freq}</changefreq>")
        lines.append(f"    <priority>{pri}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"sitemap.xml — {len(entries)} URLs")


if __name__ == "__main__":
    main()
