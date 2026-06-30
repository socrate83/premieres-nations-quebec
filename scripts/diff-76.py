import re
from pathlib import Path

src = Path("TRAVAIL/a-retravailler/76- Les outils de chasse.html.html").read_text(encoding="utf-8")
art = Path("76-les-outils-de-chasse.html").read_text(encoding="utf-8")
m = re.search(r'<article class="article-ecoute">(.*)</article>', art, re.S)
body = m.group(1) if m else ""

h1 = re.search(r"<h1>(.*?)</h1>", src, re.S).group(1)
print("H1:", h1)
print("Immortelles in article:", "Immortelles" in art)
print("Mikinakw in article:", "Mikinakw" in art)

src_clean = re.sub(r"<h1>.*?</h1>\s*", "", src, flags=re.S)
src_clean = re.sub(r"\n---+\n", "\n", src_clean)

for tag in ["p", "h2", "li"]:
    for block in re.findall(rf"<{tag}[^>]*>(.*?)</{tag}>", src_clean, re.S):
        text = " ".join(re.sub(r"<[^>]+>", "", block).split())
        if len(text) < 20:
            continue
        if text not in body and text.replace("'", "'") not in body:
            print(f"MISSING [{tag}]:", text[:120])
