#!/usr/bin/env python3
"""Publie sur le groupe Facebook les episodes deja en ligne sur GitHub — ordre strict 1,2,3,4.

Appele apres publish-next-episode.mjs (GitHub Actions ou local).
Config : FB_ACCESS_TOKEN + FB_GROUP_ID (env ou memoire-agent/facebook-config.json)
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
MEM = Path(r"C:\Users\socra\.cursor\socrate\premieres-nations-quebec")
MANIFEST = SITE / "episodes-queue" / "episodes-queue.json"
FB_SCRIPT_SITE = SITE / "episodes-queue" / "facebook-scripts" / "79-hiver-script-facebook.txt"
FB_SCRIPT_MEM = MEM / "publication-groupe" / "79-hiver-script-facebook.txt"
FB_CONFIG = MEM / "memoire-agent" / "facebook-config.json"
LOG = MEM / "memoire-agent" / "facebook-publish-log.txt"
GRAPH = "https://graph.facebook.com/v21.0"
SITE_BASE = "https://socrate83.github.io/premieres-nations-quebec"


def page_live(slug_file: str) -> bool:
    url = f"{SITE_BASE}/{slug_file}"
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Socrate-fb/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status == 200
    except Exception:
        return False


def log(msg: str) -> None:
    line = f"{datetime.now().strftime('%Y-%m-%d %H:%M')} — {msg}\n"
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(line)
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode("ascii", errors="replace").decode("ascii"))


def load_config() -> tuple[str, str]:
    token = os.environ.get("FB_ACCESS_TOKEN", "").strip()
    group = os.environ.get("FB_GROUP_ID", "").strip()
    if FB_CONFIG.exists():
        cfg = json.loads(FB_CONFIG.read_text(encoding="utf-8"))
        token = token or cfg.get("access_token", "").strip()
        group = group or str(cfg.get("group_id", "")).strip()
    if not group:
        group = "1451283625021958"
    return token, group


def load_script() -> str:
    for p in (FB_SCRIPT_SITE, FB_SCRIPT_MEM):
        if p.exists():
            return p.read_text(encoding="utf-8")
    raise FileNotFoundError("Script FB #79 introuvable")


def parse_episodes(text: str) -> dict[int, dict]:
    """Parse JOUR N blocks."""
    out: dict[int, dict] = {}
    blocks = re.split(r"─── JOUR (\d+) —", text)
    # blocks[0] = header, then pairs (num, content)
    i = 1
    while i + 1 < len(blocks):
        n = int(blocks[i])
        body = blocks[i + 1]
        img = ""
        m = re.search(r"📎 IMAGE\s*:\s*(https?://\S+)", body)
        if m:
            img = m.group(1).strip()
        link = ""
        m = re.search(r"🔗 LIEN COMMENTAIRE\s*:\s*(https?://\S+)", body)
        if m:
            link = m.group(1).strip()
        # message = body without image line and link line and warnings
        msg_lines = []
        for line in body.splitlines():
            if line.strip().startswith("📎 IMAGE"):
                continue
            if line.strip().startswith("🔗 LIEN"):
                continue
            if "Pas de lien dans ce post" in line:
                continue
            msg_lines.append(line)
        message = "\n".join(msg_lines).strip()
        out[n] = {"message": message, "image": img, "link": link}
        i += 2
    return out


def graph_post(path: str, data: dict, token: str) -> dict:
    data = {**data, "access_token": token}
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(f"{GRAPH}/{path}", data=body, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def post_to_group(group_id: str, token: str, ep: dict) -> str:
    if ep.get("image"):
        res = graph_post(
            f"{group_id}/photos",
            {"url": ep["image"], "message": ep["message"]},
            token,
        )
        post_id = res.get("post_id") or res.get("id", "")
    else:
        res = graph_post(f"{group_id}/feed", {"message": ep["message"]}, token)
        post_id = res.get("id", "")
    if ep.get("link") and post_id:
        try:
            graph_post(f"{post_id}/comments", {"message": ep["link"]}, token)
        except urllib.error.HTTPError as e:
            log(f"Commentaire lien echoue ({e.code}) — post publie quand meme")
    return post_id


def next_part_to_post(data: dict) -> tuple[dict, dict, int] | None:
    for series in data.get("series", []):
        parts = sorted(series.get("parts", []), key=lambda p: p.get("part", 0))
        for p in parts:
            if p.get("status") != "published":
                continue
            if p.get("fb_status") == "done":
                continue
            # ordre strict : parties precedentes publiees sur FB d'abord
            for prev in parts:
                if prev["part"] < p["part"] and prev.get("status") == "published" and prev.get("fb_status") != "done":
                    return series, prev, prev["part"]
            return series, p, p["part"]
    return None


def save_manifest(data: dict) -> None:
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    if not MANIFEST.exists():
        log("Pas de manifest episodes-queue")
        return 0

    token, group_id = load_config()
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    scripts = parse_episodes(load_script())
    posted_any = False

    while True:
        nxt = next_part_to_post(data)
        if not nxt:
            break
        series, part, num = nxt
        if num not in scripts:
            log(f"Script FB manquant pour partie {num}")
            return 1

        if not page_live(part.get("file", "")):
            log(f"Site pas pret (404?) — FB reporte : {part.get('file')}")
            break

        if not token:
            log(f"FB_ACCESS_TOKEN absent — a publier manuellement : episode {num}/4")
            log(scripts[num]["message"][:200] + "...")
            pending = MEM / "publication-groupe" / "FB-A-PUBLIER-MAINTENANT.txt"
            pending.write_text(
                f"Episode {num}/4 — coller token dans memoire-agent/facebook-config.json\n\n"
                + scripts[num]["message"]
                + f"\n\nLien commentaire:\n{scripts[num]['link']}\n",
                encoding="utf-8",
            )
            return 2

        try:
            post_id = post_to_group(group_id, token, scripts[num])
            part["fb_status"] = "done"
            part["fb_published_on"] = datetime.now(UTC).date().isoformat()
            part["fb_post_id"] = post_id
            save_manifest(data)
            log(f"Facebook OK — #79 partie {num}/4 (post {post_id})")
            posted_any = True
        except urllib.error.HTTPError as e:
            err = e.read().decode() if e.fp else str(e)
            log(f"Facebook ECHEC partie {num}: {e.code} {err[:300]}")
            return 1

    if not posted_any:
        log("Facebook : rien a publier (deja a jour ou site pas pret)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
