#!/usr/bin/env python3
"""Traduit une ou plusieurs parties HTML (#79+) → locales/articles/{slug}.json (EN + ES)."""
import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "locales" / "articles"
PART1_SLUG = "79-l-hiver-pierre-le-fouineur"


def google_translate(text: str, target: str) -> str:
    if not text or not text.strip():
        return text
    tl = "es" if target == "es" else "en"
    max_len = 4200
    parts = []
    rest = text.strip()
    while rest:
        if len(rest) <= max_len:
            parts.append(rest)
            break
        cut = rest.rfind(". ", 0, max_len)
        if cut < 100:
            cut = rest.rfind(" ", 0, max_len)
        if cut < 100:
            cut = max_len
        parts.append(rest[: cut + 1].strip())
        rest = rest[cut + 1 :].strip()
    out = []
    for p in parts:
        url = (
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl="
            + tl
            + "&dt=t&q="
            + urllib.parse.quote(p)
        )
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read().decode())
        tr = "".join(x[0] for x in data[0] if x[0])
        out.append(tr or p)
        time.sleep(0.15)
    return "".join(out)


def strip_tags(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip()


def has_block_nesting(inner: str) -> bool:
    return bool(re.search(r"<(p|div|h[1-6]|ul|ol|li|table|section|article|blockquote)\b", inner, re.I))


def normalize_emphasis_spacing(s: str) -> str:
    s = re.sub(r"([A-Za-zÀ-ÿ0-9])(<(?:strong|em|b|i|a)\b)", r"\1 \2", s)
    return re.sub(r"(</(?:strong|em|b|i|a)>)([A-Za-zÀ-ÿ0-9])", r"\1 \2", s)


def translate_inline(inner: str, target: str) -> str:
    if not inner or not inner.strip():
        return inner
    if "<" not in inner:
        return google_translate(inner, target)
    tokens = re.split(r"(<[^>]+>)", inner)
    out = []
    for tok in tokens:
        if not tok:
            continue
        if tok.startswith("<") or not tok.strip():
            out.append(tok)
            continue
        lead = tok[: len(tok) - len(tok.lstrip())]
        trail = tok[len(tok.rstrip()) :]
        core = tok.strip()
        if not core:
            out.append(tok)
            continue
        out.append(lead + google_translate(core, target) + trail)
    return normalize_emphasis_spacing("".join(out))


def collect_matches(html: str, pattern: str, group: int, *, allow_inline=False, skip_block=False):
    jobs = []
    for m in re.finditer(pattern, html, re.I | re.S):
        inner = m.group(group)
        if skip_block and has_block_nesting(inner):
            continue
        plain = strip_tags(inner) if allow_inline else inner.strip()
        if len(plain) < 2:
            continue
        jobs.append({"index": m.start(), "len": len(m.group(0)), "raw": m.group(0)})
    return jobs


def translate_html(html: str, target: str) -> str:
    collectors = [
        (r"<(h[1-4])([^>]*)>([^<]+)</\1>", 3, {}),
        (r'<p class="img-caption"([^>]*)>([^<]*)</p>', 2, {}),
        (r"<th([^>]*)>([^<]*)</th>", 2, {}),
        (r"<td([^>]*)>([^<]*)</td>", 2, {}),
        (r"<li([^>]*)>([\s\S]*?)</li>", 2, {"allow_inline": True}),
        (r"<p([^>]*)>([\s\S]*?)</p>", 2, {"allow_inline": True, "skip_block": True}),
        (r"<blockquote([^>]*)>([^<]+)</blockquote>", 2, {}),
        (r"<strong>([^<]+)</strong>", 1, {}),
    ]
    jobs = []
    for pat, gi, opts in collectors:
        jobs.extend(collect_matches(html, pat, gi, **opts))
    jobs.sort(key=lambda j: (j["index"], -j["len"]))
    kept = []
    last_end = -1
    for j in jobs:
        if j["index"] >= last_end:
            kept.append(j)
            last_end = j["index"] + j["len"]
    kept.sort(key=lambda j: j["index"], reverse=True)
    result = html
    for job in kept:
        raw = job["raw"]
        open_tag = raw[: raw.index(">") + 1]
        close_tag = raw[raw.rfind("<") :]
        inner = raw[len(open_tag) : len(raw) - len(close_tag)]
        repl = open_tag + translate_inline(inner, target) + close_tag
        i, ln = job["index"], job["len"]
        result = result[:i] + repl + result[i + ln :]
        time.sleep(0.08)
    return result


def extract_main_html(html: str) -> str:
    m = re.search(r'<article[^>]*id="pn-article-root"[^>]*>([\s\S]*?)</article>', html, re.I)
    if m:
        return m.group(1).strip()
    m = re.search(r"<article[^>]*>([\s\S]*?)</article>", html, re.I)
    if m:
        return m.group(1).strip()
    raise SystemExit("article body not found")


def page_title(html: str) -> str:
    m = re.search(r"<title>([^<]*)</title>", html, re.I)
    return m.group(1).strip() if m else ""


def patch_blog_serie_part1():
    blog_path = ROOT / "locales" / "blog-serie-i18n.json"
    data = json.loads(blog_path.read_text(encoding="utf-8"))
    file = f"{PART1_SLUG}.html"
    teaser_fr = (
        "C'est quoi l'hiver au Québec : neige, glace, froid et vigilance sur le territoire — "
        "le carnet n° 4 de Pierre le Fouineur, publié en quatre parties."
    )
    title_fr = "L'Hiver sur le territoire — Partie 1 (Carnet n° 4)"
    data.setdefault("en", {})[file] = {
        "title": google_translate(title_fr, "en"),
        "teaser": google_translate(teaser_fr, "en"),
    }
    data.setdefault("es", {})[file] = {
        "title": google_translate(title_fr, "es"),
        "teaser": google_translate(teaser_fr, "es"),
    }
    blog_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("patched blog-serie-i18n.json (#79 partie 1)")


def translate_slug(slug: str) -> None:
    html_file = ROOT / f"{slug}.html"
    if not html_file.exists():
        print("missing", html_file.name)
        return
    html = html_file.read_text(encoding="utf-8")
    main_html = extract_main_html(html)
    title_fr = page_title(html)
    print(f"Translating {slug} ({len(main_html)} chars)...")
    en_html = translate_html(main_html, "en")
    print("EN done, ES starting...")
    es_html = translate_html(main_html, "es")
    doc = {
        "slug": slug,
        "file": f"{slug}.html",
        "en": {"title": google_translate(title_fr, "en"), "html": en_html},
        "es": {"title": google_translate(title_fr, "es"), "html": es_html},
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{slug}.json"
    out.write_text(json.dumps(doc, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")
    if slug == PART1_SLUG:
        patch_blog_serie_part1()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slugs", nargs="*", help="slug(s) sans .html")
    parser.add_argument("--only", help="slugs séparés par des virgules")
    args = parser.parse_args()
    raw = list(args.slugs)
    if args.only:
        raw.extend(s.strip() for s in args.only.split(","))
    slugs = [s.replace(".html", "") for s in raw if s.strip()]
    if not slugs:
        parser.error("indiquer au moins un slug")
    for slug in slugs:
        translate_slug(slug)
    print("Terminé —", len(slugs), "partie(s).")


if __name__ == "__main__":
    main()
