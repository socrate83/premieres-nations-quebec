#!/usr/bin/env python3
"""Build article #77 from TRAVAIL source."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "TRAVAIL/a-retravailler/77-les-techniques-de-peche.html.html"
OUT = ROOT / "77-les-techniques-de-peche.html"
PAGES_OUT = ROOT / "pages/77-les-techniques-de-peche.html"

IMG = {
    "saumon": "images/articles/77-saumon-harpon.png",
    "canot": "images/articles/77-canot-peche.png",
    "nasse": "images/articles/77-nasse-ecorce.png",
    "glace": "images/articles/77-peche-glace.png",
}

HEAD = """<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>#77 — Les Techniques de Pêche des Premières Nations du Québec</title>
    <meta name="description" content="Harpons, nasses, filets et protocoles du tabac : un carnet de Pierre le Fouineur sur la pêche chez les onze nations du Québec.">
    <style>
        body { font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; background-color: #fcfaf7; color: #333; }
        h1 { color: #2c5530; border-bottom: 4px solid #d4a574; padding-bottom: 15px; font-size: 2em; line-height: 1.2; }
        h2 { color: #2c5530; margin-top: 45px; border-left: 6px solid #d4a574; padding-left: 20px; font-size: 1.35em; }
        .meta { color: #666; font-size: 0.95em; margin-bottom: 30px; font-style: italic; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
        .lead { font-size: 1.15em; font-weight: bold; color: #2c5530; border: 2px solid #d4a574; padding: 22px; margin: 35px 0; font-style: italic; background-color: #fff; border-radius: 10px; }
        .highlight { background: #f4ece4; padding: 22px; border-radius: 12px; border-right: 8px solid #2c5530; margin: 30px 0; }
        .pierre-portrait { background: #fff; border: 2px solid rgba(212,165,116,0.85); border-radius: 12px; padding: 22px 26px; margin: 28px 0; box-shadow: 0 2px 8px rgba(44,85,48,0.08); }
        .pierre-portrait h2 { color: #2c5530; margin: 0 0 16px; font-size: 1.2em; border-left: 5px solid #d4a574; padding-left: 14px; }
        .pierre-portrait p { margin: 0 0 14px; }
        .pierre-portrait p:last-child { margin-bottom: 0; }
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
<body data-pn-article-slug="77-les-techniques-de-peche">
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

<div id="pn-article-root" data-pn-article-slug="77-les-techniques-de-peche">
<article class="article-ecoute">
"""

TAIL = """
<blockquote class="quote">
    « On ne possède pas la rivière. Elle nous prête ses poissons. Nous devons la remercier, la nourrir, et lui rendre ce qu'elle nous donne. » — Pierre le Fouineur
</blockquote>

<div class="hashtags">
    <strong>Mots-clés :</strong> #PremièresNations #Québec #PêcheTraditionnelle #Innu #Atikamekw #Anishinaabe #MiKmaq #Wendat #Abénakis #Malécites #Mohawks #Algonquins #Inuit #Cris #Saumon #TabacSacré #CarnetsDePierre
</div>

</article>

<div class="footer-sources">
    <strong>Note :</strong> Texte ancien rédigé par l'arrière-grand-père de mon ami Pierre — Pierre le Fouineur, coureur des bois — avec le concours des savoirs des nations, et non par les Premières Nations elles-mêmes. Jean-Claude le transmet tel qu'il l'a reçu, en respect de ces écrits et des traditions qu'ils décrivent. Les techniques varient selon les familles et les territoires ; les nations concernées demeurent les autorités de leurs propres savoirs. Certaines méthodes décrites sont aujourd'hui réglementées ou réservées à la transmission pédagogique.
</div>
</div>

<nav class="nav-art" aria-label="Navigation série">
    <a href="76-les-outils-de-chasse.html">← #76 Chasse</a>
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
    return text


def convert_body(raw: str) -> str:
    raw = raw.replace("\r\n", "\n")
    raw = re.sub(r"\n---+\n", "\n", raw)
    parts = []
    blocks = re.split(r"(<h2[^>]*>.*?</h2>)", raw, flags=re.S)
    intro = blocks[0]
    intro = fix_inline(intro.strip())

    header = """<h1>🎣 #77 — Les Techniques de Pêche des 11 Premières Nations du Québec<br><span style="font-size:0.65em;color:#d4a574;">Carnets de Pierre le Fouineur — Carnet n° 2</span></h1>

<div class="meta">
    Série <em>Peuples Autochtones du Québec</em> — Article #77<br>
    Groupe Facebook : <a href="https://www.facebook.com/groups/1451283625021958" target="_blank">Les Premières Nations au Québec</a>
</div>

<div class="highlight">
<p><strong>Carnet n° 2 — Jean-Claude —</strong> Mon ami Pierre m'a fait part des carnets de récits laissés par son arrière-grand-père, rédigés il y a longtemps : un carnet de route à travers les onze nations du Québec, composé avec le concours de leurs savoirs. Je te le transmets tel qu'il l'a écrit — je n'invente rien.</p>
</div>

<div class="pierre-portrait">
<h2>Qui est Pierre le Fouineur ?</h2>
<p>Mon ami Pierre m'a fait part, un jour, de vieux carnets trouvés chez lui — les récits laissés par <strong>son arrière-grand-père</strong>, lui aussi prénommé Pierre. On l'appelait <strong>Pierre le Fouineur</strong>.</p>
<p>Ce n'était pas une moquerie, c'était un compliment. Coureur des bois, il marchait le Québec : portages, cabanes de troc où l'on échangeait farine, pelteries, histoires et silence. Il écoutait. Il notait. Nuit après nuit, dans des carnets de cuir usé, il couvait des mots — chasse, pêche, plantes, cérémonies. Les onze nations du territoire québécois y passent, chacune avec sa voix : il était le témoin qui écrit ; ils étaient ceux qui savaient.</p>
<p>Les carnets dormirent longtemps — grenier, malles, oubli. Puis Pierre, son arrière-petit-fils, les retrouva par hasard, comme on découvre une flèche coincée dans l'écorce d'un bouleau, et m'en confia la lecture.</p>
<p>Ce qu'il m'a remis n'est pas de l'or jaune. C'est mieux : une <strong>mine de récits vivants</strong>, au milieu des différentes nations du Québec — des textes anciens, respectueux, écrits avec le concours de ceux qui partageaient leur savoir. Je n'invente rien. Je transmets.</p>
</div>

<p><em>Voici l'un de ces carnets, remis entre mes mains par Pierre.</em></p>

<div class="lead">
    « La pêche innue, c'est comme entrer dans la maison d'un invité : on se lave les mains avant d'approcher le poisson. Pas de couteau avant qu'on ne t'ait offert de l'eau. » — Carnet 2, p. 13
</div>

<img src="{saumon}" alt="Pêche au saumon sur une rivière du Québec — harpon et respect du protocole" class="img-center">
<p class="img-caption">Rivières, lacs et marées : la pêche comme dialogue avec l'eau — onze nations du Québec.</p>
""".format(**IMG)

    parts.append(header)
    parts.append(intro)

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
                f'    <img src="{IMG["nasse"]}" alt="Nasse en écorce de bouleau — pêche traditionnelle" class="img-float-right">\n'
                f'    {content}\n</div>'
            )
        elif section_num == 4:
            content = (
                f'<img src="{IMG["canot"]}" alt="Canot de pêche sur rivière québécoise" class="img-center">\n'
                f'<p class="img-caption">Canots d\'écorce et marées : la pêche mi\'kmaq entre terre et mer.</p>\n'
                f'{content}'
            )
        elif section_num == 7:
            content = (
                f'<div class="clearfix">\n'
                f'    <img src="{IMG["glace"]}" alt="Pêche sous la glace — techniques inuit et nordiques" class="img-float-right">\n'
                f'    {content}\n</div>'
            )
        elif "Épilogue" in h2:
            thanks = (
                "<p><em>Merci à Pierre pour ce carnet, et aux nations dont les savoirs l'ont nourri.</em> — Jean-Claude</p>"
            )
            content = re.sub(
                r"<p><em>Merci à Pierre.*?</em> — Jean-Claude</p>\s*",
                "",
                content,
                flags=re.S,
            )
            gallery = f"""
<div class="gallery">
    <div class="gallery-item">
        <img src="{IMG['saumon']}" alt="Pêche au saumon" />
        <p>Harpon et saumon</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['nasse']}" alt="Nasse en écorce" />
        <p>Nasses et filets</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['canot']}" alt="Canot de pêche" />
        <p>Canot et rivière</p>
    </div>
    <div class="gallery-item">
        <img src="{IMG['glace']}" alt="Pêche sous la glace" />
        <p>Glace et Nunavik</p>
    </div>
</div>
"""
            content = content + gallery + thanks

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
