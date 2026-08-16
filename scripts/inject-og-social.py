#!/usr/bin/env python3
"""Injecte Open Graph sur pages articles. Usage: python scripts/inject-og-social.py"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://socrate83.github.io/premieres-nations-quebec"
DEFAULT_IMG = f"{BASE}/images/articles/78-friction-feu.png"
LANDING = {"Carnets.html", "Articles.html", "Home.html"}


def meta_content(html: str, name: str) -> str:
    for pat in (
        rf'<meta[^>]+name=["\']{name}["\'][^>]+content=["\']([^"\']*)["\']',
        rf'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']{name}["\']',
    ):
        m = re.search(pat, html, re.I)
        if m:
            return m.group(1)
    return ""


def first_image(html: str) -> str:
    m = re.search(r'src=["\']images/articles/([^"\']+)["\']', html, re.I)
    return f"images/articles/{m.group(1)}" if m else ""


def strip_og(html: str) -> str:
    html = re.sub(r'\s*<meta property="og:[^"]+"[^>]*>\s*', "", html, flags=re.I)
    html = re.sub(r'\s*<meta name="twitter:(?!site)[^"]+"[^>]*>\s*', "", html, flags=re.I)
    return html


def esc(s: str) -> str:
    return s.replace('"', "&quot;")


def main():
    n = 0
    for fp in sorted(ROOT.glob("*.html")):
        html = fp.read_text(encoding="utf-8")
        if "pn-article-root" not in html and "article-ecoute" not in html and fp.name not in LANDING:
            continue
        title_m = re.search(r"<title>([^<]*)</title>", html, re.I)
        title = title_m.group(1).strip() if title_m else fp.name
        desc = meta_content(html, "description") or title
        img = first_image(html)
        img_abs = f"{BASE}/{img}" if img else DEFAULT_IMG
        url = f"{BASE}/{fp.name}"

        html = strip_og(html)
        block = f"""
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="{img_abs}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{esc(title)}">
  <meta name="twitter:description" content="{esc(desc)}">
  <meta name="twitter:image" content="{img_abs}">"""

        if "</head>" in html:
            html = html.replace("</head>", block + "\n</head>", 1)
            fp.write_text(html, encoding="utf-8")
            n += 1
            print(f"og: {fp.name}")
    print(f"Terminé — {n} pages.")


if __name__ == "__main__":
    main()
