#!/usr/bin/env python3
"""Generate locales/articles/77-les-techniques-de-peche.json (EN + ES)."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = "77-les-techniques-de-peche"
HTML_FILE = ROOT / f"{SLUG}.html"
OUT = ROOT / "locales" / "articles" / f"{SLUG}.json"


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
    m = re.search(
        r'<div id="pn-article-root"[^>]*>([\s\S]*?)</div>\s*(?=<nav class="nav-art")',
        html,
        re.I,
    )
    if not m:
        raise SystemExit("pn-article-root not found")
    return m.group(1).strip()


def page_title(html: str) -> str:
    m = re.search(r"<title>([^<]*)</title>", html, re.I)
    return m.group(1).strip() if m else ""


def main():
    html = HTML_FILE.read_text(encoding="utf-8")
    main_html = extract_main_html(html)
    title_fr = page_title(html)
    print(f"Translating {SLUG} ({len(main_html)} chars)...")
    en_html = translate_html(main_html, "en")
    print("EN done, ES starting...")
    es_html = translate_html(main_html, "es")
    doc = {
        "slug": SLUG,
        "file": f"{SLUG}.html",
        "en": {"title": google_translate(title_fr, "en"), "html": en_html},
        "es": {"title": google_translate(title_fr, "es"), "html": es_html},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
