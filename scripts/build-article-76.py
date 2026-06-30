#!/usr/bin/env python3
"""Build article #76 from TRAVAIL source."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "TRAVAIL/a-retravailler/76- Les outils de chasse.html.html"
OUT = ROOT / "76-les-outils-de-chasse.html"
PAGES_OUT = ROOT / "pages/76-les-outils-de-chasse.html"

B44 = "https://media.base44.com/images/public/69f23c5b09417d29099136be"
IMG = {
    "chasseur": f"{B44}/3e6d1ca90_generated_image.png",
    "peche": f"{B44}/95344eab7_generated_image.png",
    "portage": f"{B44}/d496f380b_generated_image.png",
    "canot": f"{B44}/4df202100_generated_image.png",
    "kayak": f"{B44}/707dff608_generated_image.png",
    "construction": f"{B44}/86687604f_generated_image.png",
}

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>#76 — Les Outils et Techniques de Chasse des Premières Nations du Québec</title>
    <meta name="description" content="Arcs, canots, pièges et protocoles du tabac : un reportage de territoire en territoire chez les Innu, Atikamekw, Mi'kmaq, Wendat et les onze nations du Québec.">
    <style>
        body { font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; background-color: #fcfaf7; color: #333; }
        h1 { color: #2c5530; border-bottom: 4px solid #d4a574; padding-bottom: 15px; font-size: 2em; line-height: 1.2; }
        h2 { color: #2c5530; margin-top: 45px; border-left: 6px solid #d4a574; padding-left: 20px; font-size: 1.35em; }
        .meta { color: #666; font-size: 0.95em; margin-bottom: 30px; font-style: italic; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
        .lead { font-size: 1.15em; font-weight: bold; color: #2c5530; border: 2px solid #d4a574; padding: 22px; margin: 35px 0; font-style: italic; background-color: #fff; border-radius: 10px; }
        .highlight { background: #f4ece4; padding: 22px; border-radius: 12px; border-right: 8px solid #2c5530; margin: 30px 0; }
        blockquote.quote { font-style: italic; color: #444; border-left: 4px double #d4a574; padding-left: 25px; margin: 30px 40px; font-size: 1.05em; }
        .hashtags { background: #f0f0f0; padding: 18px; font-size: 0.9em; margin-top: 40px; border-radius: 8px; color: #444; border: 1px solid #ccc; line-height: 2; }
        .img-float-right { float: right; margin: 0 0 20px 25px; width: 270px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .img-center { display: block; margin: 30px auto; width: 100%; max-width: 580px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .img-caption { text-align: center; font-size: 0.85em; color: #888; font-style: italic; margin-top: 6px; margin-bottom: 20px; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 35px 0; }
        .gallery-item { border-radius: 10px; overflow: hidden; border: 1px solid rgba(212,165,116,0.45); }
        .gallery-item img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .gallery-item p { padding: 0.5rem; font-size: 0.78rem; color: #666; text-align: center; font-style: italic; margin: 0; }
        .clearfix::after { content: ""; display: table; clear: both; }
        .nav-art { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; margin: 40px auto; max-width: 820px; padding: 0 20px; align-items: center; }
        .nav-art a { text-decoration: none; background: #2c5530; color: white; padding: 10px 20px; border-radius: 6px; }
        .nav-art a:last-child { justify-self: end; background: #c8920a; color: #000; font-weight: 700; }
        .footer-sources { margin-top: 30px; padding: 20px; background-color: #eee; border-radius: 5px; font-size: 0.9em; color: #555; }
    </style>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="lang-switcher.css">
    <script src="article-i18n.js" defer></script>
    <script src="article-share.js" defer></script>
<script src="lang-switcher.js" defer></script>
</head>
<body data-pn-article-slug="76-les-outils-de-chasse">
<style id="pn-nav-accueil-style">
.pn-nav-accueil{position:sticky;top:0;z-index:500;display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:center;justify-content:center;padding:0.65rem 1rem;background:#141414;border-bottom:2px solid #c8920a;font-family:'Lato',Georgia,system-ui,sans-serif}
.pn-nav-accueil a{color:#e8b020;text-decoration:none;font-weight:700;font-size:0.82rem;padding:0.45rem 1rem;border-radius:50px;border:1px solid rgba(232,176,32,0.4);transition:background .2s,color .2s}
.pn-nav-accueil a:hover{background:#c8920a;color:#000}
.pn-nav-accueil a.pn-nav-accueil__home{background:#c8920a;color:#000;border-color:#c8920a}
.pn-nav-accueil--light{background:#f4efe6;border-bottom:2px solid #8b4513}
.pn-nav-accueil--light a{color:#2c5530;border-color:rgba(44,85,48,0.35)}
.pn-nav-accueil--light a:hover{background:#2c5530;color:#fff}
.pn-nav-accueil--light a.pn-nav-accueil__home{background:#2c5530;color:#fff}
</style>
<nav class="pn-nav-accueil pn-nav-accueil--light" aria-label="Navigation">
  <a class="pn-nav-accueil__home" href="Home.html" data-i18n="nav.backHome">← Retour à l'accueil</a>
  <a href="Articles.html" data-i18n="nav.allArticles">📚 Tous les articles</a>
</nav>

<div id="pn-article-root" data-pn-article-slug="76-les-outils-de-chasse">
<article class="article-ecoute">
"""

TAIL = """
<blockquote class="quote">
    « La chasse, ce n'est pas prendre — c'est échanger. Nous ne tuons pas l'animal : nous lui demandons la permission, et en retour nous lui offrons du tabac, du respect, et une part de la viande. » — Parole d'un Aîné innu
</blockquote>

<div class="hashtags">
    <strong>Mots-clés :</strong> #PremièresNations #Québec #ChasseTraditionnelle #Innu #Atikamekw #Anishinaabe #MiKmaq #Wendat #Abénakis #Malécites #Mohawks #Algonquins #Inuit #Cris #Territoire #TabacSacré #Réconciliation
</div>

</article>

<div class="footer-sources">
    <strong>Note :</strong> Reportage rédigé avec respect pour les traditions des Premières Nations du Québec. Les techniques varient selon les familles et les territoires ; les nations concernées demeurent les autorités de leurs propres savoirs. Certaines méthodes décrites sont aujourd'hui réglementées ou réservées à la transmission pédagogique.
</div>
</div>

<nav class="nav-art" aria-label="Navigation série">
    <a href="75-l-aigle.html">← #75 L'Aigle</a>
    <a href="Home.html">🏠 Accueil</a>
    <a href="Articles.html">📚 Tous les articles</a>
</nav>
<script src="audio-player.js" defer></script>
</body>
</html>
"""


def fix_inline(text: str) -> str:
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    text = text.replace("usage de.*traps* naturels", "usage de <em>traps</em> naturels")
    text = text.replace("* *« piégeage aérien »*", "« piégeage aérien »")
    text = text.replace("(**aglu*)", "(<em>aglu</em>)")
    text = text.replace("*«ête du Mirliton »*", "« Fête du Mirliton »")
    text = text.replace(
        "Nous encerclon Lorsque le cerf est acculé",
        "Nous encerclons le cerf. Lorsque le cerf est acculé",
    )
    text = text.replace("* *« leurre à caribou »*", "« leurre à caribou »")
    return text


def convert_body(raw: str) -> str:
    raw = raw.replace("\r\n", "\n")
    raw = re.sub(r"\n---+\n", "\n", raw)
    parts = []
    blocks = re.split(r"(<h2[^>]*>.*?</h2>)", raw, flags=re.S)
    # First block before any h2
    intro = blocks[0]
    intro = re.sub(r"<h1>.*?</h1>\s*", "", intro, flags=re.S)
    intro = fix_inline(intro.strip())

    header = """<h1>🏹 #76 — Les Techniques de Chasse des 11 Premières Nations du Québec<br><span style="font-size:0.65em;color:#d4a574;">Un Reportage Vivant, des Traditions Immortelles</span></h1>

<div class="meta">
    Série <em>Peuples Autochtones du Québec</em> — Article #76<br>
    Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958" target="_blank">Les Premières Nations au Québec</a>
</div>

<div class="lead">
    « La chasse, ce n'est pas prendre, c'est échanger. Nous ne tuons pas l'animal — nous lui demandons la permission, et en retour nous lui offrons du tabac, du respect, et une part de la viande. » — Tshenap, chasseur innu
</div>

<img src="{chasseur}" alt="Chasseur innu en forêt boréale québécoise" class="img-center">
<p class="img-caption">La chasse comme relation sacrée avec la terre et ses créatures — forêts et toundra du Québec.</p>
""".format(**IMG)

    parts.append(header)
    parts.append(intro)

    # Pair h2 with following content
    i = 1
    section_num = 0
    while i < len(blocks):
        h2 = blocks[i]
        content = blocks[i + 1] if i + 1 < len(blocks) else ""
        h2 = fix_inline(h2)
        content = fix_inline(content.strip())
        section_num += 1

        if section_num == 2:
            content = (
                f'<div class="clearfix">\n'
                f'    <img src="{IMG["portage"]}" alt="Portage du canot en forêt — déplacement traditionnel" class="img-float-right">\n'
                f'    {content}\n</div>'
            )
        elif section_num == 4:
            content = (
                f'<img src="{IMG["peche"]}" alt="Pêche traditionnelle au filet sur une rivière du Québec" class="img-center">\n'
                f'<p class="img-caption">Rivières et marées : la chasse se mêle à la pêche sur le territoire québécois.</p>\n'
                f'{content}'
            )
        elif section_num == 7:
            content = (
                f'<div class="clearfix">\n'
                f'    <img src="{IMG["kayak"]}" alt="Kayak inuit arctique — chasse en mer et sur la glace" class="img-float-right">\n'
                f'    {content}\n</div>'
            )
        elif section_num == 10:
            content = (
                f'<img src="{IMG["canot"]}" alt="Canot sur rivière au coucher du soleil" class="img-center">\n'
                f'<p class="img-caption">Canots, traîneaux et portages : la mobilité au cœur des techniques de chasse.</p>\n'
                f'{content}'
            )
        elif "Conclusion" in h2:
            gallery = f"""
<div class="gallery">
    <div class="gallery-item">
        <img src="{IMG['chasseur']}" alt="Chasseur innu en forêt boréale" />
        <p>Traque et respect du gibier</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['construction']}" alt="Construction de canot d'écorce" />
        <p>Canot et portage</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['peche']}" alt="Pêche traditionnelle au filet" />
        <p>Rivières et réciprocité</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['kayak']}" alt="Kayak inuit arctique" />
        <p>Chasse en milieu polaire</p>
    </div>
</div>
"""
            thanks_plain = (
                "<p>Je remercie mon ami Pierre qui, avec le concours des 11 nations, "
                "a pu réaliser ce reportage pour le diffuser sur mon site. — Jean-Claude</p>"
            )
            thanks_styled = (
                "<p><em>Je remercie mon ami Pierre qui, avec le concours des 11 nations, "
                "a pu réaliser ce reportage pour le diffuser sur mon site.</em> — Jean-Claude</p>"
            )
            content = content.replace(thanks_plain, thanks_styled)
            content = content + gallery

        parts.append(h2)
        parts.append(content)
        i += 2

    return "\n\n".join(parts)


def main():
    raw = SRC.read_text(encoding="utf-8")
    body = convert_body(raw)
    html = HEAD + body + TAIL
    OUT.write_text(html, encoding="utf-8")
    PAGES_OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT} ({len(html)} chars)")


if __name__ == "__main__":
    main()
