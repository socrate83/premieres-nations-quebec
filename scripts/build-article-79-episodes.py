#!/usr/bin/env python3
"""Build article #79 — 4 parties, texte intégral du brouillon (reportage, pas résumé)."""
import argparse
import json
import shutil
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUEUE_DIR = ROOT / "episodes-queue"
ARTICLE_NUM = 79
TITLE = "L'Hiver sur le territoire"
SLUG = "79-l-hiver-pierre-le-fouineur"
START_DATE = date(2026, 7, 4)
INTERVAL_DAYS = 2

MONTHS_FR = ("janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.")


def fr_date(d: date) -> str:
    return f"{d.day} {MONTHS_FR[d.month - 1]} {d.year}"


def part_date(part: int) -> date:
    return START_DATE + timedelta(days=INTERVAL_DAYS * (part - 1))

# Texte intégral — découpé en 4 parties logiques
PART1_BODY = """
<div class="serie-plan">
<h2>Article #79 en 4 parties</h2>
<p><strong>L'Hiver sur le territoire</strong> — Carnet n° 4 de Pierre le Fouineur. Le reportage complet paraît en <strong>quatre parties</strong>, une tous les deux jours à partir du {d1}.</p>
<table class="serie-table">
<tr><th>Partie</th><th>Sujet</th><th>Publication</th></tr>
<tr><td><strong>1</strong></td><td>C'est quoi l'hiver au Québec — températures, vent, neige, glace</td><td><strong>{d1}</strong></td></tr>
<tr><td>2</td><td>Lire les traces, raquettes, s'habiller contre le froid</td><td>{d2}</td></tr>
<tr><td>3</td><td>Traîneaux, chiens, bois sous la neige (renvois #76 #77 #78)</td><td>{d3}</td></tr>
<tr><td>4</td><td>Abri, rituels, spiritualité, conclusion</td><td>{d4}</td></tr>
</table>
</div>

<div class="highlight">
<p><strong>Carnet n° 4 — Jean-Claude —</strong> Mon ami Pierre m'a confié ce carnet sur <strong>l'hiver au Québec</strong> — le premier d'une série sur les saisons. Printemps, été et automne viendront plus tard. Je te le transmets tel qu'il l'a écrit, avec le concours des savoirs des onze nations — je n'invente rien.</p>
</div>

<div class="pierre-portrait">
<h2>Qui est Pierre le Fouineur ?</h2>
<p>Mon ami Pierre m'a fait part, un jour, de vieux carnets trouvés chez lui — les récits laissés par <strong>son arrière-grand-père</strong>, lui aussi prénommé Pierre. On l'appelait <strong>Pierre le Fouineur</strong>.</p>
<p>Coureur des bois, il marchait le Québec en toutes saisons : portages, cabanes de troc, silence et neige. Il avait déjà laissé des carnets sur la <a href="76-les-outils-de-chasse.html">chasse</a>, la <a href="77-les-techniques-de-peche.html">pêche</a> et le <a href="78-le-feu-pierre-le-fouineur.html">feu</a> — ici il parle <strong>uniquement de l'hiver</strong>.</p>
<p>Je n'invente rien. Je transmets.</p>
</div>

<p><em>Voici le carnet n° 4, remis entre mes mains par Pierre.</em></p>

<div class="lead">« L'hiver au Québec n'est pas une saison qu'on subit en attendant le printemps. C'est une façon d'habiter la terre — lire la neige, nourrir ses chiens, garder le feu vivant. » — Carnet 4, p. 1</div>

<p><em>Février 1927 — Wemotaci. Les doigts engourdis, l'encre qui fige par moments sur le papier. Pierre le Fouineur écrit ce qu'il a vu et entendu : pas pour tout comprendre, mais pour transmettre — comme une rivière qui murmure à celui qui s'arrête.</em></p>

<p>L'hiver au Québec n'est pas une « saison froide » qu'on traverse en attendant le printemps. Pour les Premières Nations, c'est une <strong>façon d'habiter le territoire</strong> : lire la neige, choisir son bois, nourrir ses chiens, garder le feu vivant dans le froid. Ce carnet est le premier sur les saisons ; printemps, été et automne viendront plus tard.</p>

<div class="renvoi"><strong>Pas de doublon :</strong> ce carnet ne raconte pas la chasse (#76), la pêche (#77) ni l'allumage du feu (#78) — seulement <strong>vivre l'hiver</strong> sur le territoire.</div>

<h2>1. C'est quoi l'hiver au Québec — pour ceux qui ne le savent pas</h2>

<p>Avant de parler des nations, il faut dire le climat. Le Québec s'étire du fleuve Saint-Laurent jusqu'au Nunavik arctique : <strong>l'hiver n'est pas le même partout</strong>, mais partout il impose le respect.</p>

<ul>
<li><strong>Les températures.</strong> Dans le sud (Montréal, Québec, Abénakis, Wendat), on peut voir de <strong>−15 °C à −30 °C</strong> en janvier-février, parfois plus avec le vent. Dans le nord (Innu, Cris, Naskapi, Inuit), <strong>−35 °C à −45 °C</strong> n'est pas rare ; le froid « mord » la peau en quelques minutes si elle est exposée.</li>
<li><strong>Le vent.</strong> Il transforme le froid en danger. Un <strong>refroidissement éolien</strong> de −40 ou −50 est possible : la neige poudreuse devient un sable qui vous aveugle, les forêts hurlent, et les anciens disent qu'il faut « écouter le vent avant de sortir » — il annonce la tempête ou la clairière.</li>
<li><strong>L'épaisseur de la neige.</strong> Au sud, <strong>30 cm à 1 m</strong> sur une saison ; en forêt boréale et sur la toundra, <strong>1 à 2 m</strong> ou plus, avec des congères où un homme disparaît jusqu'à la ceinture. La neige n'est pas uniforme : croûte de glace le matin, poudre l'après-midi, neige lourde sur les branches qui tombe en « avalanches » silencieuses.</li>
<li><strong>Les jours courts.</strong> En décembre-janvier, le soleil se lève tard et se couche tôt ; il reste une lueur grise sur la neige. Les gens vivent plus <strong>près du feu</strong>, plus près les uns des autres — c'est la saison des récits.</li>
<li><strong>L'eau qui change d'état.</strong> Rivières et lacs <strong>gelés</strong> : on marche, on perce la glace, on traverse en traîneau là où l'été il fallait un canot. La glace n'est jamais « évidente » : les anciens testent l'épaisseur avec une perche, écoutent les craquements.</li>
</ul>

<p>Pierre note cela en ouverture pour que personne ne lise la suite en croyant que l'hiver québécois ressemble à une « jolie carte postale ». C'est une <strong>saison de vigilance</strong> — et de savoir-faire transmis depuis des millénaires.</p>
"""

PART2_BODY = """
<div class="renvoi"><strong>Partie 2 — pas de doublon chasse (#76) :</strong> Pierre décrit ici <strong>la neige et le corps en hiver</strong> — pas les arcs, pièges ni protocoles de capture déjà au carnet chasse.</div>

<h2>2. Lire les traces dans la neige — le langage des pas</h2>

<p>Quand la neige tombe, elle ne couvre pas le sol : elle <strong>écrit</strong>. Chaque empreinte raconte qui est passé, à quelle heure, avec quelle hâte. Les chasseurs s'en servent — voir <a href="76-les-outils-de-chasse.html">#76</a> — mais Pierre note ce que les anciens lui ont dit sur <em>la neige elle-même</em>, en hiver.</p>

<ul>
<li><strong>Les Innu (Montagnais, Naskapi) :</strong> Un pas large et profond ? Souvent un caribou mâle. Des petits pas serrés en ligne ? Une femelle et ses petits. Une trace qui s'arrête net, puis repart en zigzag ? Prudence : ours en hibernation légère ou loup qui surveille. Ils suivent parfois une piste <strong>deux jours et deux nuits</strong> avant de décider — la neige garde la mémoire.</li>
<li><strong>Les Atikamekw :</strong> Ils parlent du <em>langage des pas</em> : direction du vent gravée sur le bord de l'empreinte, neige repoussée d'un côté seulement (l'animal fuyait ou cherchait un abri). Une patte qui traîne ? Bête blessée — signe à lire dans la poudreuse, pas une leçon de chasse.</li>
<li><strong>Les Anishinaabe :</strong> Certaines traces sont des <strong>signes spirituels</strong> : piste d'un loup seul au lever du jour — prière avant de continuer.</li>
<li><strong>Les Mi'kmaq (côte) :</strong> Sur la glace côtière, ils lisent le <strong>phoque</strong> et le renard — pour savoir où la glace est sûre et où la marée a faibli sous le blanc (pas les techniques de pêche d'été — voir <a href="77-les-techniques-de-peche.html">#77</a>).</li>
<li><strong>Les Cris (Eeyou Istchee) :</strong> La piste du caribou en migration hivernale guide parfois tout un campement : on déplace les tentes en suivant le troupeau et le bois mort.</li>
</ul>

<p><em>« La neige ne ment pas »,</em> écrit Pierre. <em>« Elle dit ce que l'homme pressé ne voit pas. »</em></p>

<h2>3. Raquettes — marcher là où l'homme s'enfoncerait</h2>

<p>Sans raquettes, un adulte s'enfonce jusqu'aux genoux dans la poudreuse ; avec, il <strong>flotte</strong> sur la neige et économise une force précieuse. L'hiver, la raquette est aussi importante que le canot en été.</p>

<ul>
<li><strong>Fabrication :</strong> Cadre en frêne ou en bouleau, treillis en babiche (cuir de caribou) ou en lanières de peau. Forme longue et étroite chez les Innu du nord ; plus large chez les Algonquins des Laurentides. On les cire avec de la graisse pour que la neige mouillée ne colle pas.</li>
<li><strong>La marche :</strong> Pas ample, pied légèrement écarté — les novices font ricaner les enfants. On suit les <strong>sentiers de raquettes</strong> tracés depuis des générations entre un lac et un portage.</li>
<li><strong>La croûte :</strong> Après un redoux puis un gel, la surface durcit : on marche dessus sans raquettes <em>si</em> on connaît les zones où la croûte casse — sinon, on tombe dans la neige meuble jusqu'à la taille. Les Atikamekw enseignent aux jeunes à « écouter » la croûte au bâton.</li>
</ul>

<h2>4. Le froid, le vent et le corps — s'habiller pour vivre dehors</h2>

<p>L'hiver tue ceux qui sous-estiment le froid. Les Premières Nations n'avaient pas de « manteaux sport » : ils avaient le <strong>caribou</strong>, le castor, la fourrure de loup et des couches qui transpirent sans geler sur la peau.</p>

<ul>
<li><strong>L'attikamek / parka :</strong> Peau de caribou avec la fourrure vers l'intérieur ou l'extérieur selon l'activité ; capuche qui laisse passer la vapeur de la respiration sans former de glace sur les cils.</li>
<li><strong>Les mitasses et mocassins d'hiver :</strong> Plusieurs paires de chaussettes en laine ou en peau ; jambière attachée à la ceinture pour que la neige ne tombe pas dans le bas.</li>
<li><strong>Le gel et le feu :</strong> Doigts et joues qui « brûlent » puis s'engourdissent — signe qu'il faut rentrer au feu. Les anciens frottent la peau avec de la neige <em>froide</em> ou chauffent lentement, jamais brusquement.</li>
<li><strong>Le vent :</strong> On chemine à l'abri des versants, on évite les lacs ouverts au vent ; parfois on attend <strong>deux jours</strong> dans le camp que la tempête passe — « le territoire te retient », dit un Innu à Pierre.</li>
</ul>
"""

PART3_BODY = """
<div class="renvoi"><strong>Partie 3 — pas de doublon :</strong> <a href="78-le-feu-pierre-le-fouineur.html">#78</a> = <em>comment</em> allumer le feu. <a href="76-les-outils-de-chasse.html">#76</a> / <a href="77-les-techniques-de-peche.html">#77</a> = chasse et pêche en détail. Ici : <strong>transport, bois en hiver, ce qui change sous la glace</strong> seulement.</div>

<h2>5. Transport dans la neige — traîneaux, chiens, portages</h2>

<p>En hiver, tout se déplace différemment : le canot est remisé ; le <strong>traîneau</strong> et les <strong>chiens</strong> prennent le relais.</p>

<ul>
<li><strong>Traîneau à chiens (Innu, Naskapi, Cris) :</strong> Attelage en éventail ou en ligne ; chiens entraînés dès leurs premiers mois à écouter la voix du meneur. On charge peaux, viande séchée, enfants, parfois le vieux qui ne marche plus assez vite. Pierre assiste à un départ à Schefferville : <em>« Vingt pattes, une seule intention — suivre la piste et le vent. »</em></li>
<li><strong>Traîneau tiré à la main :</strong> Planche courbée, corde sur la poitrine ; pour le bois, les enfants, les provisions quand il n'y a pas assez de chiens.</li>
<li><strong>Le komatik (Inuit, nord) :</strong> Traîneau bas sur patins, adapté à la glace et à la neige dure ; motoneige ancienne avant l'ère des moteurs.</li>
<li><strong>Portage sur neige :</strong> Là où l'été on portait le canot sur les épaules, l'hiver on ouvre un <strong>sentier de raquettes</strong> et on y tire le chargement — parfois en plusieurs voyages. Les Atikamekw marquent les arbres pour retrouver le chemin au retour du blizzard.</li>
</ul>

<h2>6. Chercher le bois — nourrir le feu quand tout semble mouillé</h2>

<p>Pierre ne répète pas la liturgie de l'allumage (<a href="78-le-feu-pierre-le-fouineur.html">#78</a>). Il dit <strong>où trouver le bois</strong> quand la forêt est ensevelie :</p>

<ul>
<li><strong>Bois mort debout :</strong> Épinettes et sapins secs encore sur pied — on les coupe, on les fend ; le cœur est sec même si l'écorce est givrée.</li>
<li><strong>Sous la neige :</strong> Tas de branches mortes au pied des bouleaux ; on creuse parfois <strong>un trou dans la neige</strong> jusqu'au sol pour un petit feu de survie à l'abri du vent.</li>
<li><strong>Écorce de bouleau :</strong> Brûle vite — pour <strong>entretenir</strong> un feu déjà allumé, pas pour l'allumer (voir #78).</li>
<li><strong>La veille du feu :</strong> La nuit, quelqu'un se lève pour ajouter une bûche ; le feu qui meurt en hiver peut coûter des vies. Les familles dorment en cercle, le bois empilé à portée de main.</li>
</ul>

<p><em>Renvoi :</em> pour l'allumage sacré (friction, tabac, prière), voir le <strong>Carnet n° 3 — Le Feu sans allumettes</strong> (<a href="78-le-feu-pierre-le-fouineur.html">article #78</a>).</p>

<img src="images/articles/79-feu-bois-hiver.png" alt="Feu et bois sec en hiver" class="img-center">
<p class="img-caption">Bois sec et feu vivant : survivre la nuit québécoise.</p>

<h2>7. Sous la glace et dans la poudreuse — ce qui change en hiver</h2>

<div class="renvoi">Reportages complets : <a href="76-les-outils-de-chasse.html">#76 Chasse</a> · <a href="77-les-techniques-de-peche.html">#77 Pêche</a>. En hiver seulement :</div>

<ul>
<li><strong>Innu :</strong> Caribou en harde sur raquettes ; castor au trou dans la glace.</li>
<li><strong>Atikamekw :</strong> Orignal en forêt profonde ; viande partagée au camp avant qu'elle ne gèle dehors.</li>
<li><strong>Mi'kmaq :</strong> Phoque sur la glace côtière — silence absolu.</li>
<li><strong>Hurons-Wendat :</strong> Réserves de viande et poisson séchés ; complément quand la clairière le permet.</li>
<li><strong>Inuit :</strong> Trou dans la glace ; iglou ; cycle alimentaire par le froid.</li>
<li><strong>Cris :</strong> Caribou migrateur ; hareng sous la glace.</li>
</ul>

<p>Tabac, prière, partage — l'hiver rend le protocole plus urgent, sans le réexpliquer ici.</p>
"""

PART4_BODY = """
<div class="renvoi"><strong>Partie 4 — pas de doublon :</strong> pas de techniques d'allumage (#78) ni de danses d'été — ici : <strong>abri hivernal, rituels de saison froide, vie en commun</strong>.</div>

<h2>8. Abri, tente et vie autour du feu</h2>

<ul>
<li><strong>Wigwam ou tipi d'hiver :</strong> Peau épaisse, double paroi ; chaleur au centre (le feu est déjà allumé — voir #78 pour naître). Paroi de neige entassée autour.</li>
<li><strong>Igloo (Inuit) :</strong> Blocs de neige taillés au couteau ; intérieur fond légèrement en cupule — la chaleur du corps et de la lampe à graisse fait fondre un film de glace qui scelle l'air.</li>
<li><strong>Soirées :</strong> Récits, réparation des raquettes, tannage, chants. Pierre écrit : <em>« L'hiver oblige à rester ensemble ; c'est là que les jeunes apprennent qui ils sont. »</em></li>
<li><strong>Partage :</strong> Viande, fourrure, bois, nouvelles des familles voisines — un campement qui refuse de partager ne survit pas longtemps.</li>
</ul>

<h2>9. Rituels et spiritualité de l'hiver</h2>

<p>L'hiver n'est pas « vide » de cérémonie. Ce n'est pas la saison de toutes les danses — beaucoup ont lieu au printemps ou en été — mais c'est le temps de la <strong>purification intérieure</strong> et du lien aux esprits du froid et du caribou.</p>

<ul>
<li>Purification au tabac et à l'écorce de bouleau avant une longue traite.</li>
<li>Remerciement au premier animal de l'hiver, au premier poisson sous la glace.</li>
<li>Veillées où les aînés racontent les origines du monde — « quand la terre était encore jeune et la neige plus haute ».</li>
<li>Guérisseurs : plantes séchées, chants — le feu du camp comme lieu de prière, pas la friction du #78.</li>
</ul>

<h2>10. L'hiver comme temps de préparation</h2>

<p>L'hiver n'est pas une fin : c'est le moment où l'on <strong>répare, transmet, économise</strong> — viande séchée, outils, histoires — en vue du dégel. Pierre le Fouineur écrit ces lignes pour que ceux qui lisent depuis des villes chauffées comprennent : ici, l'hiver était une <strong>maîtrise</strong>, pas un malheur subi.</p>

<p><em>« Les cèdres portent encore la neige ce matin. Les chiens tournent en rond près des traîneaux. Les Premières Nations vivent — pas malgré l'hiver, mais avec lui. Les autres saisons, je les confierai à d'autres pages. »</em></p>

<p>— Pierre le Fouineur</p>

<div class="gallery">
<div class="gallery-item"><img src="images/articles/79-hiver-territoire.png" alt="Territoire hivernal" /><p>Neige et forêt</p></div>
<div class="gallery-item"><img src="images/articles/79-raquettes-traces.png" alt="Raquettes" /><p>Raquettes et traces</p></div>
<div class="gallery-item"><img src="images/articles/79-traineau-chiens.png" alt="Traîneau" /><p>Traîneau à chiens</p></div>
<div class="gallery-item"><img src="images/articles/79-feu-bois-hiver.png" alt="Feu d'hiver" /><p>Bois et feu</p></div>
</div>

<p><em>Merci à Pierre pour ce carnet, et aux nations dont les savoirs l'ont nourri.</em> — Jean-Claude</p>

<blockquote class="quote">« Pas malgré l'hiver, mais avec lui. » — Pierre le Fouineur</blockquote>

<div class="hashtags"><strong>Mots-clés :</strong> #PremièresNations #Québec #Hiver #Neige #Raquettes #Traîneau #CarnetsDePierre #Innu #Atikamekw #Inuit #Cris</div>
"""

PARTS = [
    {"part": 1, "file": f"{SLUG}.html", "subtitle": "C'est quoi l'hiver au Québec",
     "img": "79-hiver-territoire.png", "img_alt": "Forêt québécoise en hiver",
     "img_caption": "L'hiver : neige, froid et territoire — une saison de vigilance.",
     "body": PART1_BODY},
    {"part": 2, "file": f"{SLUG}-partie-2.html", "subtitle": "Traces, raquettes et le froid",
     "img": "79-raquettes-traces.png", "img_alt": "Raquettes et traces dans la neige",
     "img_caption": "Lire la neige : chaque empreinte raconte une histoire.",
     "body": PART2_BODY},
    {"part": 3, "file": f"{SLUG}-partie-3.html", "subtitle": "Transport, bois et nourriture d'hiver",
     "img": "79-traineau-chiens.png", "img_alt": "Traîneau à chiens sur la neige",
     "img_caption": "Traîneaux, chiens et glace : l'hiver change toutes les routes.",
     "body": PART3_BODY},
    {"part": 4, "file": f"{SLUG}-partie-4.html", "subtitle": "Abri, rituels et renouveau",
     "img": "79-feu-bois-hiver.png", "img_alt": "Camp d'hiver et feu",
     "img_caption": "Autour du feu : récits, partage et préparation du printemps.",
     "body": PART4_BODY, "no_top_img": True},
]

HEAD_STYLE = """
body{font-family:Georgia,serif;max-width:820px;margin:0 auto;padding:40px 20px;line-height:1.8;background:#fcfaf7;color:#333}
h1{color:#2c5530;border-bottom:4px solid #d4a574;padding-bottom:15px;font-size:2em;line-height:1.2}
h2{color:#2c5530;margin-top:45px;border-left:6px solid #d4a574;padding-left:20px;font-size:1.35em}
.meta{color:#666;font-size:.95em;margin-bottom:30px;font-style:italic;border-bottom:1px solid #ddd;padding-bottom:15px}
.preview-banner{background:#c8920a;color:#000;text-align:center;padding:12px;font-weight:700;border-radius:8px;margin-bottom:24px}
.part-badge{display:inline-block;background:#2c5530;color:#fff;padding:4px 14px;border-radius:20px;font-size:.5em;vertical-align:middle;margin-left:6px}
.lead{font-size:1.15em;font-weight:bold;color:#2c5530;border:2px solid #d4a574;padding:22px;margin:35px 0;font-style:italic;background:#fff;border-radius:10px}
.highlight{background:#f4ece4;padding:22px;border-radius:12px;border-right:8px solid #2c5530;margin:30px 0}
.serie-plan{background:#fff;border:2px solid #2c5530;border-radius:12px;padding:22px;margin:28px 0}
.serie-plan h2{margin-top:0;border:none;padding:0;font-size:1.2em}
.serie-table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.92em}
.serie-table th,.serie-table td{border:1px solid #ccc;padding:8px 10px;text-align:left}
.serie-table th{background:#eef5ee}
.pierre-portrait{background:#fff;border:2px solid rgba(212,165,116,.85);border-radius:12px;padding:22px;margin:28px 0}
.pierre-portrait h2{margin:0 0 16px;font-size:1.2em;border-left:5px solid #d4a574;padding-left:14px}
.pierre-portrait p{margin:0 0 14px}
blockquote.quote{font-style:italic;color:#444;border-left:4px double #d4a574;padding-left:25px;margin:30px 40px;font-size:1.05em}
.hashtags{background:#f0f0f0;padding:18px;font-size:.9em;margin-top:40px;border-radius:8px;border:1px solid #ccc;line-height:2}
.img-center{display:block;margin:30px auto;width:100%;max-width:580px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,.2)}
.img-caption{text-align:center;font-size:.85em;color:#888;font-style:italic;margin-top:6px;margin-bottom:20px}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin:35px 0}
.gallery-item{border-radius:10px;overflow:hidden;border:1px solid rgba(212,165,116,.45)}
.gallery-item img{width:100%;height:160px;object-fit:cover;display:block}
.gallery-item p{padding:.5rem;font-size:.78rem;color:#666;text-align:center;font-style:italic;margin:0}
.nav-art{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;margin:40px auto;max-width:820px;padding:0 20px}
.nav-art a{text-decoration:none;background:#2c5530;color:#fff;padding:10px 20px;border-radius:6px;font-size:.9em}
.nav-art a.nav-next{justify-self:end;background:#c8920a;color:#000;font-weight:700}
.footer-sources{margin-top:30px;padding:20px;background:#eee;border-radius:5px;font-size:.9em;color:#555}
.renvoi{background:#eef5ee;border-left:4px solid #2c5530;padding:14px 18px;margin:24px 0;font-size:.95em}
"""

def nav(i, production=False):
    prev_f = "78-le-feu-pierre-le-fouineur.html" if i == 0 else PARTS[i - 1]["file"]
    prev_t = "← #78 Feu" if i == 0 else f"← Partie {PARTS[i-1]['part']}"
    if i < len(PARTS) - 1:
        nxt_f, nxt_t = PARTS[i + 1]["file"], f"Partie {PARTS[i+1]['part']} →"
    else:
        nxt_f, nxt_t = "Carnets.html", "Carnets →"
    hub = "Carnets.html" if production else "preview-serie-79.html"
    hub_label = "📜 Carnets" if production else "📋 #79 · 4 parties"
    return (
        f'<nav class="nav-art"><a href="{prev_f}">{prev_t}</a>'
        f'<a href="{hub}">{hub_label}</a>'
        f'<a class="nav-next" href="{nxt_f}">{nxt_t}</a></nav>'
    )


PROD_HEAD_EXTRA = """
<link rel="stylesheet" href="lang-switcher.css">
<script src="article-i18n.js" defer></script>
<script src="article-share.js" defer></script>
<script src="lang-switcher.js" defer></script>
<meta property="og:type" content="article">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
"""

PROD_NAV = """
<style id="pn-nav-accueil-style">
.pn-nav-accueil{position:sticky;top:0;z-index:500;display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:center;justify-content:center;padding:0.65rem 1rem;background:#f4efe6;border-bottom:2px solid #8b4513;font-family:'Lato',Georgia,system-ui,sans-serif}
.pn-nav-accueil a{color:#2c5530;text-decoration:none;font-weight:700;font-size:0.82rem;padding:0.45rem 1rem;border-radius:50px;border:1px solid rgba(44,85,48,0.35)}
.pn-nav-accueil a:hover{background:#2c5530;color:#fff}
.pn-nav-accueil a.pn-nav-accueil__home{background:#2c5530;color:#fff}
</style>
<nav class="pn-nav-accueil" aria-label="Navigation">
  <a class="pn-nav-accueil__home" href="Home.html">← Accueil</a>
  <a href="Carnets.html">📜 Carnets</a>
  <a href="Articles.html">📚 Articles</a>
</nav>
"""


def prod_head_meta(p):
    slug_file = p["file"]
    base = "https://socrate83.github.io/premieres-nations-quebec"
    img = p.get("img") or "79-hiver-territoire.png"
    return f"""
<meta name="description" content="#79 — {TITLE} — Partie {p['part']}/4 — Carnet n° 4 de Pierre le Fouineur.">
<meta property="og:title" content="#79 — {TITLE} — Partie {p['part']}">
<meta property="og:description" content="{p['subtitle']} — Carnet n° 4 de Pierre le Fouineur.">
<meta property="og:url" content="{base}/{slug_file}">
<meta property="og:image" content="{base}/images/articles/{img}">
"""


def page(p, i, production=False):
    slug_name = p["file"].replace(".html", "")
    top_img = ""
    if not p.get("no_top_img"):
        top_img = f'<img src="images/articles/{p["img"]}" alt="{p["img_alt"]}" class="img-center"><p class="img-caption">{p["img_caption"]}</p>'
    body = p["body"]
    if p["part"] == 1:
        body = body.format(
            d1=fr_date(part_date(1)),
            d2=fr_date(part_date(2)),
            d3=fr_date(part_date(3)),
            d4=fr_date(part_date(4)),
        )
    preview = "" if production else f'<div class="preview-banner">APERÇU — Article #{ARTICLE_NUM} · Partie {p["part"]}/4</div>\n'
    title_suffix = "" if production else " (aperçu)"
    footer = (
        "<div class=\"footer-sources\"><strong>Sources :</strong> Carnet de Pierre le Fouineur, transmis par Jean-Claude.</div>"
        if production
        else "<div class=\"footer-sources\"><strong>Note :</strong> Texte de Pierre le Fouineur, transmis par Jean-Claude. Aperçu local.</div>"
    )
    prod_head = (PROD_HEAD_EXTRA + prod_head_meta(p)) if production else ""
    prod_nav = PROD_NAV if production else (
        '<nav style="display:flex;gap:1rem;justify-content:center;padding:.7rem;background:#f4efe6;border-bottom:2px solid #8b4513">'
        '<a href="Home.html" style="color:#2c5530;font-weight:700;text-decoration:none">← Accueil</a>'
        '<a href="preview-serie-79.html" style="color:#2c5530;font-weight:700;text-decoration:none">📋 #79 · 4 parties</a>'
        "</nav>"
    )
    body_attr = f' data-pn-article-slug="{slug_name}"' if production else ""
    article_id = ' id="pn-article-root"' if production else ""
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>#{ARTICLE_NUM} — {TITLE} — Partie {p["part"]}{title_suffix}</title>
{prod_head}<style>{HEAD_STYLE}</style>
<link rel="stylesheet" href="style.css">
</head>
<body{body_attr}>
{prod_nav}
<article{article_id} style="max-width:820px;margin:0 auto;padding:20px">
{preview}<h1>❄️ #{ARTICLE_NUM} — {TITLE}<span class="part-badge">Partie {p["part"]} / 4</span><br><span style="font-size:.55em;color:#d4a574">{p["subtitle"]}</span></h1>
<div class="meta">Article #{ARTICLE_NUM} — Carnet n° 4 de Pierre le Fouineur · Partie {p["part"]} sur 4</div>
{top_img}
{body}
{footer}
</article>
{nav(i, production)}
</body>
</html>"""

HUB = f"""<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Article #79 — 4 parties</title>
<style>
body{{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:20px;background:#fcfaf7;line-height:1.7}}
h1{{color:#2c5530;border-bottom:4px solid #d4a574;padding-bottom:12px}}
.banner{{background:#c8920a;padding:12px;text-align:center;font-weight:700;border-radius:8px;margin-bottom:20px}}
.ep{{display:block;background:#fff;border:2px solid #2c5530;border-radius:10px;padding:18px;margin:12px 0;text-decoration:none;color:#333}}
.ep strong{{color:#2c5530;font-size:1.1em;display:block;margin-bottom:6px}}
.ep span{{color:#666;font-size:.9em}}
</style></head><body>
<div class="banner">APERÇU — Article #79 · reportage complet en 4 parties</div>
<h1>❄️ #{ARTICLE_NUM} — L'Hiver sur le territoire</h1>
<p>Carnet n° 4 de Pierre le Fouineur — <strong>texte intégral</strong>, découpé en quatre parties.</p>
<a class="ep" href="{SLUG}.html"><strong>Partie 1</strong><span>C'est quoi l'hiver au Québec — températures, vent, neige, glace, jours courts (reportage complet)</span></a>
<a class="ep" href="{SLUG}-partie-2.html"><strong>Partie 2</strong><span>Traces dans la neige (11 nations), raquettes, s'habiller contre le froid</span></a>
<a class="ep" href="{SLUG}-partie-3.html"><strong>Partie 3</strong><span>Traîneaux, chiens, komatik, bois pour le feu, chasse et pêche d'hiver</span></a>
<a class="ep" href="{SLUG}-partie-4.html"><strong>Partie 4</strong><span>Abri, iglou, rituels, spiritualité, conclusion — galerie</span></a>
<p><a href="Home.html">← Accueil</a></p>
</body></html>"""

def write_queue_manifest():
    parts = []
    for p in PARTS:
        entry = {
            "part": p["part"],
            "file": p["file"],
            "publish_date": part_date(p["part"]).isoformat(),
            "status": "published" if p["part"] == 1 else "queued",
        }
        if p["part"] > 1:
            entry["queue_file"] = f"episodes-queue/{p['file']}"
            if p.get("img"):
                entry["image"] = p["img"]
        parts.append(entry)
    manifest = {
        "version": 1,
        "series": [
            {
                "article": str(ARTICLE_NUM),
                "title": TITLE,
                "start_date": START_DATE.isoformat(),
                "interval_days": INTERVAL_DAYS,
                "parts": parts,
            }
        ],
    }
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    (QUEUE_DIR / "episodes-queue.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("wrote episodes-queue/episodes-queue.json")


def publish_step1():
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    img_queue = QUEUE_DIR / "images"
    img_queue.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(PARTS):
        html = page(p, i, production=True)
        if p["part"] == 1:
            (ROOT / p["file"]).write_text(html, encoding="utf-8")
            print("published", p["file"])
            if p.get("img"):
                src = ROOT / "images" / "articles" / p["img"]
                if src.exists():
                    print("image ok", p["img"])
        else:
            root_copy = ROOT / p["file"]
            if root_copy.exists():
                root_copy.unlink()
                print("removed preview", p["file"])
            (QUEUE_DIR / p["file"]).write_text(html, encoding="utf-8")
            print("queued", p["file"])
            if p.get("img"):
                src = ROOT / "images" / "articles" / p["img"]
                if src.exists():
                    shutil.copy2(src, img_queue / p["img"])
                    print("queued image", p["img"])
    write_queue_manifest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--publish-step1", action="store_true", help="Partie 1 en ligne, 2-4 en file d'attente")
    args = parser.parse_args()
    if args.publish_step1:
        publish_step1()
        return
    for i, p in enumerate(PARTS):
        out = ROOT / p["file"]
        out.write_text(page(p, i, production=False), encoding="utf-8")
        print("wrote", out.name, "—", len(p["body"]), "chars")
    (ROOT / "preview-serie-79.html").write_text(HUB, encoding="utf-8")
    print("wrote preview-serie-79.html")

if __name__ == "__main__":
    main()
