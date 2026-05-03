export default function Malecites() {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Les Malécites — Wolastoqiyik, Peuple de la belle rivière</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
    :root{
      --foret:#1A3520;
      --foret-moyen:#2E5C38;
      --foret-accent:#4A8C5A;
      --ambre:#9A6A08;
      --ambre-clair:#C88A18;
      --beige:#F4EDD6;
      --creme:#F3F8F4;
      --blanc:#FFFFFF;
      --texte:#1E1E1E;
      --texte-doux:#3A3A3A;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{scroll-behavior:smooth;height:100%;overflow-y:auto}
    body{font-family:'Lato',sans-serif;background:var(--creme);color:var(--texte);line-height:1.8}
    .hero{position:relative;width:100%;height:92vh;min-height:520px;overflow:hidden;display:flex;align-items:center;justify-content:center}
    .hero img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.45)}
    .hero-content{position:relative;z-index:2;text-align:center;padding:2rem;max-width:900px}
    .hero-nation{font-size:0.85rem;letter-spacing:5px;text-transform:uppercase;color:var(--ambre-clair);font-weight:700;margin-bottom:0.75rem}
    .hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,6vw,5.5rem);font-weight:900;color:#fff;text-shadow:2px 4px 24px rgba(0,0,0,0.7);line-height:1.1;margin-bottom:1.2rem}
    .hero-sub{font-family:'Playfair Display',serif;font-size:1.25rem;color:rgba(255,255,255,0.9);font-style:italic}
    .scroll-hint{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.6);font-size:0.78rem;letter-spacing:2px;text-transform:uppercase;animation:bob 2s infinite}
    @keyframes bob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}
    .nav{background:var(--foret);padding:0.9rem 2rem;position:sticky;top:0;z-index:1000;display:flex;gap:1.4rem;justify-content:center;flex-wrap:wrap}
    .nav a{color:#FFFFFF;text-decoration:none;font-size:0.82rem;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;transition:color 0.2s;cursor:pointer}
    .nav a:hover{color:var(--ambre-clair)}
    .container{max-width:900px;margin:0 auto;padding:0 2rem}
    .section{padding:5rem 2rem}
    .section:nth-child(odd){background:var(--blanc)}
    .section:nth-child(even){background:var(--beige)}
    .sec-label{font-size:0.73rem;letter-spacing:4px;text-transform:uppercase;color:var(--foret-moyen);font-weight:700;margin-bottom:0.6rem;text-align:center}
    .sec-title{font-family:'Playfair Display',serif;font-size:clamp(1.9rem,3.5vw,2.8rem);color:var(--foret);text-align:center;line-height:1.2}
    .divider{width:56px;height:4px;background:linear-gradient(to right,var(--foret-moyen),var(--ambre));margin:1.4rem auto 2.8rem;border-radius:2px}
    p{font-size:1.04rem;line-height:1.9;color:var(--texte-doux);max-width:820px;margin:0 auto 1.5rem}
    .intro-wrap{background:var(--blanc);padding:4rem 2rem}
    .intro-card{background:linear-gradient(135deg,var(--foret),var(--foret-moyen));color:#fff;border-radius:18px;padding:3rem;text-align:center;max-width:820px;margin:0 auto;box-shadow:0 20px 60px rgba(26,53,32,0.3)}
    .intro-kword{font-family:'Playfair Display',serif;font-size:3rem;color:var(--ambre-clair);margin-bottom:0.4rem}
    .intro-card p{font-size:1.1rem;color:#fff;margin-bottom:0;line-height:1.9}
    .stats{display:flex;justify-content:center;gap:2.5rem;margin-top:2.5rem;flex-wrap:wrap}
    .stat-n{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:900;color:var(--ambre-clair)}
    .stat-l{font-size:0.78rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.75)}
    .highlight{background:#F0FAF2;border:2px solid var(--foret-moyen);border-radius:14px;padding:2rem;max-width:820px;margin:2rem auto}
    .highlight h3{font-family:'Playfair Display',serif;color:var(--foret);font-size:1.25rem;margin-bottom:1rem}
    .highlight ul{list-style:none;padding:0}
    .highlight ul li{padding:0.45rem 0 0.45rem 2rem;position:relative;font-size:0.97rem;color:var(--texte-doux)}
    .highlight ul li::before{content:'◆';position:absolute;left:0;color:var(--foret-accent);font-size:0.68rem;top:0.72rem}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;max-width:860px;margin:2.5rem auto}
    .card{background:var(--blanc);border-radius:14px;padding:1.8rem 1.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.08);border-top:4px solid var(--foret-moyen);transition:transform 0.2s,box-shadow 0.2s}
    .card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,0.13)}
    .card-icon{font-size:2.1rem;margin-bottom:0.9rem}
    .card h3{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--foret);margin-bottom:0.7rem}
    .card p{font-size:0.93rem;margin:0;color:#444;line-height:1.7}
    .img-wide{width:100%;max-width:860px;margin:2rem auto;display:block;border-radius:16px;box-shadow:0 10px 36px rgba(0,0,0,0.14)}
    .img-cap{text-align:center;font-style:italic;font-size:0.85rem;color:#777;margin-top:0.6rem}
    .quote-sec{background:linear-gradient(135deg,#1A3520,#2A4A30);padding:5rem 2rem;text-align:center}
    .quote-sec blockquote{font-family:'Playfair Display',serif;font-size:clamp(1.3rem,3vw,1.9rem);color:#fff;font-style:italic;max-width:720px;margin:0 auto;line-height:1.65}
    .quote-src{color:rgba(255,255,255,0.6);font-size:0.85rem;margin-top:1.5rem;letter-spacing:2px;text-transform:uppercase}
    footer{background:var(--foret);color:var(--beige);text-align:center;padding:3rem 2rem}
    footer h3{font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--ambre-clair);margin-bottom:1rem}
    footer p{font-size:0.88rem;color:rgba(244,237,214,0.82);max-width:600px;margin:0 auto 0.5rem;line-height:1.7}
    footer .sources{margin-top:2rem;font-size:0.78rem;color:rgba(244,237,214,0.5)}
    footer .sources a{color:var(--ambre-clair);text-decoration:none}
    @media(max-width:640px){.nav{gap:0.8rem}}

    /* SHARE FOOTER */
    .share-footer{background:#f5f0e8;border-top:3px solid var(--ocre);padding:3rem 2rem;text-align:center}
    .share-footer h4{font-family:'Playfair Display',serif;font-size:1.4rem;color:#5a3a1a;margin-bottom:0.5rem}
    .share-footer p{font-size:0.95rem;color:#5a3a1a;margin-bottom:1.8rem}
    .share-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:0.9rem}
    .share-btns a,.share-btns button{display:inline-flex;align-items:center;gap:0.5rem;padding:0.85rem 1.6rem;border-radius:50px;font-size:0.95rem;font-weight:700;text-decoration:none;cursor:pointer;border:none;transition:transform 0.2s,opacity 0.2s;letter-spacing:0.5px}
    .share-btns a:hover,.share-btns button:hover{transform:translateY(-2px);opacity:0.9}
    .btn-fb-big{background:#1877F2;color:#fff}
    .btn-group-big{background:#145dbf;color:#fff}
    .btn-messenger-big{background:#0084FF;color:#fff}
    .btn-whatsapp-big{background:#25D366;color:#000}
    .btn-email-big{background:#555;color:#fff}
    .btn-copy-big{background:var(--ocre);color:#000}
  </style>
</head>
<body>
  <section class="hero">
    <img src="https://media.base44.com/images/public/69f23c5b09417d29099136be/a00687526_generated_image.png" alt="Rivière Wolastoq — territoire malécite" />
    <div class="hero-content">
      <p class="hero-nation">Premières Nations du Québec</p>
      <h1>Les Malécites</h1>
      <p class="hero-sub">Wolastoqiyik — « Peuple de la belle rivière »</p>
    </div>
    <div class="scroll-hint">↓ Découvrir</div>
  </section>

  <nav class="nav" id="navbar">
    <a onclick="goTo('origines')">Origines</a>
    <a onclick="goTo('territoire')">Wolastoq</a>
    <a onclick="goTo('culture')">Culture</a>
    <a onclick="goTo('wapanaki')">Confédération</a>
    <a onclick="goTo('histoire')">Histoire</a>
    <a onclick="goTo('viger')">Viger</a>
    <a onclick="goTo('aujourd-hui')">Aujourd'hui</a>
  </nav>

  <div class="intro-wrap">
    <div class="intro-card">
      <div class="intro-kword">Wolastoqiyik !</div>
      <p>Les <strong>Malécites</strong> — ou <em>Wolastoqiyik</em> (« peuple de la belle rivière brillante ») dans leur langue — sont la plus petite nation autochtone du Québec, mais l'une des plus attachantes par son histoire et sa résilience. Gardiens de la rivière <strong>Wolastoq</strong> (le fleuve Saint-Jean) et du Bas-Saint-Laurent québécois, ils ont maintenu leur identité à travers des siècles de difficultés, de déplacements et de marginalisation. Aujourd'hui, la communauté de <strong>Viger</strong> est en pleine renaissance — un peuple qui refuse de disparaître.</p>
      <div class="stats">
        <div><div class="stat-n">~1 500</div><div class="stat-l">Malécites au Québec (2024)</div></div>
        <div><div class="stat-n">1</div><div class="stat-l">Communauté officielle : Viger</div></div>
        <div><div class="stat-n">Wolastoq</div><div class="stat-l">« La belle rivière brillante »</div></div>
      </div>
    </div>
  </div>

  <section class="section" id="origines">
    <div class="container">
      <div class="sec-label">Aux racines du monde</div>
      <h2 class="sec-title">Origines et identité</h2>
      <div class="divider"></div>
      <p>Les Malécites appartiennent à la grande famille linguistique <strong>algonquienne</strong>. Leur langue, le <strong>Wolastoqey</strong> (ou maliseet), est étroitement apparentée au passama­quoddy, avec lequel elle forme souvent une seule entité linguistique. Les Malécites et les Passamaquoddy se désignent collectivement comme les <em>Wolastoqiyik</em> — « peuple de la belle rivière brillante ».</p>
      <p>Le terme <strong>Malécite</strong> est d'origine mi'kmaq — il signifierait <em>« celui qui parle mal »</em> ou <em>« étranger dont la langue est imparfaite »</em>. C'est une appellation imposée par leurs voisins mi'kmaq, que les Malécites préfèrent aujourd'hui remplacer par leur vrai nom : <strong>Wolastoqiyik</strong>.</p>
      <p>Leur territoire traditionnel s'étend de part et d'autre de l'actuelle frontière canado-américaine — la <strong>rivière Wolastoq</strong> (fleuve Saint-Jean, au Nouveau-Brunswick) étant leur axe vital. Au Québec, ils occupaient le <strong>Bas-Saint-Laurent</strong> et la région de Kamouraska, d'où leur nom de <em>Malécites du Québec</em> ou <em>Malécites de Viger</em>.</p>
      <div class="highlight">
        <h3>🌌 Vision du monde malécite</h3>
        <ul>
          <li><strong>Koluskap</strong> (Glooscap) est le héros culturel et transformateur partagé avec les Mi'kmaq. Il a façonné le paysage, enseigné la chasse et protège son peuple des forces maléfiques.</li>
          <li>La <strong>rivière Wolastoq</strong> (fleuve Saint-Jean) n'est pas un simple cours d'eau — c'est l'être vivant central de la cosmologie malécite, source de vie, de nourriture et de spiritualité.</li>
          <li>Les <strong>quatre directions</strong> structurent la vision du monde malécite : chaque direction est associée à un esprit, une saison et un aspect de la vie.</li>
          <li>La philosophie du <strong>partage et de la réciprocité</strong> est centrale — une communauté malécite ne laisse jamais un de ses membres dans le besoin.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section" id="territoire">
    <div class="container">
      <div class="sec-label">La Belle Rivière</div>
      <h2 class="sec-title">Le territoire — Wolastoq</h2>
      <div class="divider"></div>
      <p>Le territoire ancestral des Malécites est centré sur la <strong>rivière Wolastoq</strong> — le fleuve Saint-Jean — qui coule du Maine au Nouveau-Brunswick. En Québec, leur territoire s'étend dans le <strong>Bas-Saint-Laurent</strong>, notamment dans la région de Kamouraska, Rivière-du-Loup et la vallée de la rivière Madawaska.</p>
      <p>La rivière Wolastoq était l'axe vital de leur mode de vie — source de saumons, d'anguilles et de gibier aquatique, mais aussi route de commerce et de diplomatie reliant les communautés malécites du Maine, du Nouveau-Brunswick et du Québec. Sa beauté légendaire lui a valu son nom : <em>« la belle rivière brillante »</em>.</p>
      <img src="https://media.base44.com/images/public/69f23c5b09417d29099136be/a00687526_generated_image.png" alt="Territoire malécite — forêt et rivière" class="img-wide"/>
      <p class="img-cap">Forêts et rivières du Bas-Saint-Laurent — territoire ancestral des Wolastoqiyik</p>
    </div>
  </section>

  <section class="section" id="culture">
    <div class="container">
      <div class="sec-label">Traditions vivantes</div>
      <h2 class="sec-title">Culture, langue et traditions</h2>
      <div class="divider"></div>
      <div class="cards">
        <div class="card"><div class="card-icon">🗣️</div><h3>Le Wolastoqey</h3><p>La langue malécite est en danger critique — très peu de locuteurs fluents au Québec. Des efforts de revitalisation sont menés à Viger en partenariat avec les communautés malécites du Nouveau-Brunswick, où la langue est plus vivante.</p></div>
        <div class="card"><div class="card-icon">🧺</div><h3>Vannerie de frêne</h3><p>Comme leurs voisins mi'kmaq, les Malécites excellent dans la fabrication de paniers tressés en frêne (ash splint). Leur artisanat — paniers, mocassins brodés, objets décoratifs — est reconnu pour sa finesse et ses motifs géométriques caractéristiques.</p></div>
        <div class="card"><div class="card-icon">🐟</div><h3>Pêche à l'anguille</h3><p>La pêche à l'anguille (katahkomiq) est une tradition millénaire des Malécites du Saint-Laurent. L'anguille argentée migrant vers l'Atlantique était capturée à l'automne dans des nasses — une pratique encore vivante et source de revenus pour certaines familles.</p></div>
        <div class="card"><div class="card-icon">🌿</div><h3>Médecine des forêts</h3><p>Les Malécites possèdent une connaissance profonde des plantes médicinales du Bas-Saint-Laurent. Leurs remèdes à base de plantes locales — écorces, racines, baies — étaient reconnus et appréciés par les colonisateurs français et anglais.</p></div>
        <div class="card"><div class="card-icon">🏹</div><h3>Chasse et trappage</h3><p>La chasse à l'orignal, au caribou (autrefois), au castor et au renard rythmait l'année malécite. L'arc et la flèche, la trappe et le filet étaient les outils d'une économie de subsistance parfaitement adaptée au territoire du Bas-Saint-Laurent.</p></div>
        <div class="card"><div class="card-icon">🤝</div><h3>Confédération Wapanaki</h3><p>Les Malécites font partie de la <em>Confédération Wapanaki</em> (« Peuple de l'aube ») aux côtés des Mi'kmaq, Abénaquis, Passamaquoddy et Penobscot — une alliance diplomatique et militaire qui a résisté à la colonisation anglaise pendant deux siècles.</p></div>
      </div>
    </div>
  </section>

  <section class="section" id="wapanaki">
    <div class="container">
      <div class="sec-label">Alliance des nations</div>
      <h2 class="sec-title">La Confédération Wapanaki</h2>
      <div class="divider"></div>
      <p>Les Malécites font partie de la <strong>Confédération Wapanaki</strong> (aussi appelée Wabanaki) — une alliance de cinq nations algonquiennes de l'est : <strong>Mi'kmaq, Malécites (Wolastoqiyik), Abénaquis, Passamaquoddy et Penobscot</strong>. Le nom <em>Wapanaki</em> signifie <em>« peuple de l'aube »</em> ou <em>« peuple des terres de l'est »</em> — une référence à leur position géographique à l'est du continent.</p>
      <p>Cette confédération, dont les origines précoloniales sont attestées, a joué un rôle crucial dans la résistance aux colonisateurs anglais au 17e et 18e siècle. Alliés des Français, les nations wapanaki ont mené une guerre de résistance tenace contre l'expansion britannique en Nouvelle-Angleterre et en Acadie.</p>
      <div class="highlight">
        <h3>🤝 Les 5 nations Wapanaki</h3>
        <ul>
          <li><strong>Mi'kmaq</strong> — Gardiens des côtes maritimes et de la Gaspésie.</li>
          <li><strong>Wolastoqiyik (Malécites)</strong> — Gardiens de la belle rivière Wolastoq.</li>
          <li><strong>Abénaquis (Wapanakis)</strong> — Gardiens de la vallée du Richelieu et de la Yamaska.</li>
          <li><strong>Passamaquoddy</strong> — Gardiens de la baie de Passamaquoddy (Maine/N.-B.).</li>
          <li><strong>Penobscot</strong> — Gardiens de la rivière Penobscot (Maine).</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="quote-sec">
    <blockquote>« Wolastoq — la belle rivière brillante — nous a nourris, guidés et protégés depuis la nuit des temps. Elle coule en nous comme elle coule vers la mer. »</blockquote>
    <p class="quote-src">— Tradition orale malécite</p>
  </section>

  <section class="section" id="histoire">
    <div class="container">
      <div class="sec-label">Histoire</div>
      <h2 class="sec-title">Une histoire de résistance</h2>
      <div class="divider"></div>
      <p>Les Malécites ont été parmi les <strong>premiers alliés des Français</strong> en Acadie, dès le début du 17e siècle. Leur position géographique — à la frontière entre la Nouvelle-France et la Nouvelle-Angleterre — en faisait des acteurs stratégiques dans les guerres coloniales franco-anglaises. Les guerres des 17e et 18e siècles ont profondément affecté leur population et leur territoire.</p>
      <p>Après la <strong>Conquête britannique</strong> (1763) et la fin de leurs alliances avec les Français, les Malécites du Québec ont été progressivement marginalisés. Sans territoire de réserve fixe pendant longtemps, les familles malécites vivaient en marge des villages québécois du Bas-Saint-Laurent, maintenant leurs traditions de façon discrète mais tenace.</p>
      <p>La création officielle de la <strong>Première Nation Malécite de Viger</strong> en 1989 marque un tournant — la reconnaissance gouvernementale d'une communauté qui avait résisté à l'oubli pendant deux siècles sans statut officiel.</p>
    </div>
  </section>

  <section class="section" id="viger">
    <div class="container">
      <div class="sec-label">La communauté</div>
      <h2 class="sec-title">Viger — Une renaissance</h2>
      <div class="divider"></div>
      <p>La <strong>Première Nation Malécite de Viger</strong> est reconnue officiellement depuis <strong>1989</strong> — une reconnaissance tardive pour une communauté dont l'existence était connue depuis des siècles. Contrairement à la plupart des autres nations, les Malécites de Viger <strong>n'ont pas de réserve territoriale</strong> contiguë — leurs membres sont dispersés dans plusieurs municipalités du Bas-Saint-Laurent.</p>
      <p>Cette situation particulière a rendu la cohésion communautaire plus difficile, mais n'a pas empêché les Malécites de Viger de reconstruire leurs institutions. Le Conseil de la Première Nation Malécite de Viger, basé à <strong>Cacouna</strong> (dans le Bas-Saint-Laurent), travaille depuis les années 1990 à rassembler les membres dispersés, revitaliser la langue et la culture, et négocier des droits territoriaux.</p>
      <div class="highlight">
        <h3>🌟 La Première Nation Malécite de Viger</h3>
        <ul>
          <li>Reconnue officiellement en <strong>1989</strong> après des décennies sans statut officiel.</li>
          <li>Conseil basé à <strong>Cacouna</strong>, dans le Bas-Saint-Laurent.</li>
          <li>Environ <strong>1 500 membres inscrits</strong>, dispersés dans plusieurs régions du Québec.</li>
          <li>Revendications territoriales en cours dans le <strong>Bas-Saint-Laurent et la région de Kamouraska</strong>.</li>
          <li>Partenariats culturels avec les communautés malécites du <strong>Nouveau-Brunswick</strong> pour la revitalisation linguistique.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section" id="aujourd-hui">
    <div class="container">
      <div class="sec-label">XXIe siècle</div>
      <h2 class="sec-title">Les Malécites aujourd'hui</h2>
      <div class="divider"></div>
      <p>Les Malécites de Viger sont une communauté en <strong>reconstruction active</strong>. Malgré leur petite taille et l'absence de réserve territoriale compacte, ils ont développé leurs institutions, leurs programmes culturels et leurs revendications territoriales avec une détermination remarquable. Le Conseil de Viger gère des programmes d'éducation, de santé et de développement culturel pour ses membres dispersés.</p>
      <p>La <strong>revitalisation de la langue wolastoqey</strong> est une priorité. En partenariat avec les communautés malécites du Nouveau-Brunswick (notamment Tobique et Kingsclear), où la langue est plus vivante, des programmes d'apprentissage sont développés pour les membres du Québec.</p>
      <p>Les Malécites participent activement aux <strong>négociations de la Confédération Wapanaki</strong> avec les gouvernements fédéral et provincial, revendiquant la reconnaissance de leurs droits territoriaux ancestraux dans le Bas-Saint-Laurent — une région où leur présence précède de loin la colonisation française.</p>
      <div class="cards">
        <div class="card"><div class="card-icon">🌱</div><h3>Renaissance culturelle</h3><p>Malgré leur dispersion, les Malécites de Viger organisent des rassemblements culturels annuels, des ateliers d'artisanat traditionnel (vannerie, mocassins) et des activités de transmission culturelle pour les jeunes membres de la communauté.</p></div>
        <div class="card"><div class="card-icon">⚖️</div><h3>Revendications territoriales</h3><p>Le Conseil de Viger négocie la reconnaissance de droits territoriaux dans le Bas-Saint-Laurent — territoire ancestral wolastoqiyik non cédé. Ces négociations portent sur les droits de chasse, de pêche et sur l'utilisation des ressources naturelles.</p></div>
        <div class="card"><div class="card-icon">🤝</div><h3>Réseau Wapanaki</h3><p>Les Malécites de Viger maintiennent des liens étroits avec les autres nations de la Confédération Wapanaki — Mi'kmaq, Abénaquis, Passamaquoddy — partageant ressources culturelles et stratégies politiques communes.</p></div>
      </div>
      <p style="margin-top:2.5rem;font-style:italic;text-align:center;color:#555;">« Les Wolastoqiyik du Québec sont la preuve que même la plus petite des nations peut maintenir sa flamme identitaire à travers les siècles. Leur renaissance est inspirante. »</p>
    </div>
  </section>

  <div class="share-footer">
    <h4>📢 Partager cet article</h4>
    <p>Vous avez aimé ? Faites découvrir les Malécites à votre entourage !</p>
    <div class="share-btns">
      <a class="btn-fb-big" href="https://www.facebook.com/sharer/sharer.php?u=https://lucie-app-5fea0268.base44.app/Malecites" target="_blank">📘 Facebook</a>
      <a class="btn-group-big" href="https://www.facebook.com/groups/1451283625021958" target="_blank">👥 Groupe FB</a>
      <a class="btn-messenger-big" href="https://www.facebook.com/dialog/send?link=https://lucie-app-5fea0268.base44.app/Malecites&app_id=291494419107518&redirect_uri=https://lucie-app-5fea0268.base44.app/Malecites" target="_blank">💬 Messenger</a>
      <a class="btn-whatsapp-big" href="https://api.whatsapp.com/send?text=D%C3%A9couvre+cet+article+sur+les+Malécites+%3A+https://lucie-app-5fea0268.base44.app/Malecites" target="_blank">🟢 WhatsApp</a>
      <a class="btn-email-big" href="mailto:?subject=Article+sur+les+Malécites&body=Je+te+partage+cet+article+sur+les+Malécites+%3A+https://lucie-app-5fea0268.base44.app/Malecites" target="_blank">📧 Courriel</a>
      <button class="btn-copy-big" onclick="navigator.clipboard.writeText('https://lucie-app-5fea0268.base44.app/Malecites').then(function(){var t=document.getElementById('toast-share');t.style.opacity='1';t.style.transform='translateX(-50%) translateY(0)';setTimeout(function(){t.style.opacity='0';t.style.transform='translateX(-50%) translateY(20px)';},2500);})">🔗 Copier le lien</button>
    </div>
  </div>
  <div id="toast-share" style="position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);background:#C8920A;color:#000;font-weight:700;font-size:0.9rem;padding:0.7rem 2rem;border-radius:30px;opacity:0;transition:all 0.3s;z-index:9999;pointer-events:none">✅ Lien copié !</div>

  <footer>
    <h3>Wolastoqiyik — Le Peuple de la Belle Rivière</h3>
    <p>Cet article a été rédigé avec respect pour la Première Nation Malécite de Viger — la plus petite nation du Québec, mais l'une des plus résilientes.</p>
    <p>🌐 <a href="https://tourismeautochtone.com" target="_blank">tourismeautochtone.com</a></p>
    <div class="sources"><strong>Sources :</strong> Gouvernement du Québec (2025) • Encyclopédie canadienne • Première Nation Malécite de Viger • Confédération Wapanaki</div>
  </footer>

  <script>
    function goTo(id){var el=document.getElementById(id);if(!el)return;var nav=document.getElementById('navbar');var navH=nav?nav.offsetHeight:0;var top=el.getBoundingClientRect().top+document.documentElement.scrollTop-navH-10;document.documentElement.scrollTop=top;document.body.scrollTop=top;}
  </script>
</body>
</html>`;
  return <iframe srcDoc={html} style={{width:'100%',height:'100vh',border:'none'}} title="Les Malécites — Wolastoqiyik"/>;
}
