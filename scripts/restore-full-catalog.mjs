/**
 * Restaure : lecture vocale sur tous les articles, liens Articles.html,
 * redirections article1.html…article72.html, page Articles.html.
 * Usage: node scripts/restore-full-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'pages');
const catalogPath = path.join(pagesDir, 'blog-serie-articles.json');

const SKIP_PAGES = new Set(['Presentation.html', 'BingSiteAuth.xml']);

function catalogItems(catalog) {
  const items = [];
  if (catalog.featured?.file) {
    items.push({ n: '★', ...catalog.featured });
  }
  for (const g of catalog.groups || []) {
    for (const it of g.items || []) items.push(it);
  }
  return items;
}

function fixNavLinks(html) {
  return html
    .replace(/href=["']\.\.\/Home\.html#serie-blog["']/gi, 'href="Articles.html"')
    .replace(/href=["']Home\.html#serie-blog["']/gi, 'href="Articles.html"')
    .replace(/href=["']\.\.\/Articles\.html["']/gi, 'href="Articles.html"')
    .replace(/href=["']\.\.\/Home\.html["']/gi, 'href="Home.html"');
}

function hasEcoute(html) {
  return html.includes('audio-player.js') && html.includes('article-ecoute');
}

function addHead(html) {
  if (html.includes('href="style.css"') || html.includes('href="../style.css"')) return html;
  return html.replace(/<\/head>/i, '  <link rel="stylesheet" href="style.css">\n</head>');
}

function addScript(html) {
  if (html.includes('audio-player.js')) return html;
  return html.replace(/<\/body>/i, '  <script src="audio-player.js" defer></script>\n</body>');
}

function wrapBlogArticle(html) {
  const bodyRe = /<body([^>]*)>([\s\S]*)<\/body>/i;
  const m = html.match(bodyRe);
  if (!m) return html;
  let attrs = m[1];
  let inner = m[2];
  if (inner.includes('<article class="article-ecoute"')) return html;

  const h1Pos = inner.search(/<h1\b/i);
  if (h1Pos < 0) return html;

  const endMarkers = [
    /<div class="nav-art"/i,
    /<div class="footer-sources"/i,
    /<hr\s*\/?>/i,
    /<p class="footer"/i,
    /<div class="tags"/i,
  ];
  let endIdx = -1;
  for (const re of endMarkers) {
    const i = inner.search(re);
    if (i > h1Pos && (endIdx < 0 || i < endIdx)) endIdx = i;
  }

  const before = inner.slice(0, h1Pos);
  const articleBody = endIdx > h1Pos ? inner.slice(h1Pos, endIdx) : inner.slice(h1Pos);
  const after = endIdx > h1Pos ? inner.slice(endIdx) : '';
  inner = before + '<article class="article-ecoute">\n' + articleBody + '\n</article>\n' + after;

  return html.replace(bodyRe, '<body' + attrs + '>\n' + inner + '\n</body>');
}

function processArticleHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;
  html = fixNavLinks(html);
  html = addHead(html);
  html = wrapBlogArticle(html);
  html = addScript(html);
  html = html.replace(/href=["']\.\.\/style\.css["']/gi, 'href="style.css"');
  html = html.replace(/src=["']\.\.\/audio-player\.js["']/gi, 'src="audio-player.js"');
  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  return false;
}

function redirectHtml(n, targetFile) {
  const target = targetFile;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <title>Article #${n} — Premières Nations</title>
  <script>location.replace("${target}");</script>
</head>
<body>
  <p><a href="${target}">Article #${n} — ouvrir l’article</a></p>
</body>
</html>
`;
}

function generateArticlesPage(catalog) {
  const groups = catalog.groups || [];
  const featured = catalog.featured;
  const rows = [];

  if (featured) {
    rows.push(
      `<li class="articles-item articles-item--featured"><a href="${featured.file}"><span class="n">★</span> ${escapeHtml(featured.title)}</a><p>${escapeHtml(featured.teaser || '')}</p></li>`
    );
  }

  for (const g of groups) {
    rows.push(`<li class="articles-group"><h2>${escapeHtml(g.label)}</h2><ol>`);
    for (const it of g.items) {
      const href = `article${it.n}.html`;
      rows.push(
        `<li><a href="${href}"><span class="n">#${it.n}</span> ${escapeHtml(it.title)}</a><p>${escapeHtml(it.teaser || '')}</p></li>`
      );
    }
    rows.push('</ol></li>');
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tous les articles (1–72) — Premières Nations du Québec</title>
  <meta name="description" content="Catalogue des 72 articles de la série : histoire, culture et spiritualité des Premières Nations. Lecture vocale sur chaque page.">
  <link rel="stylesheet" href="style.css">
  <style>
    body { font-family: Georgia, 'Lato', serif; max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem 4rem; background: #0d1118; color: #e8e4dc; line-height: 1.6; }
    h1 { font-size: clamp(1.6rem, 4vw, 2.2rem); color: #e8c96b; margin-bottom: 0.5rem; text-align: center; }
    .intro { text-align: center; color: #9a917a; margin-bottom: 2rem; font-size: 0.95rem; }
    .pn-top { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; }
    .pn-top a { color: #e8c96b; text-decoration: none; font-weight: 700; font-size: 0.85rem; padding: 0.45rem 1rem; border: 1px solid rgba(232,201,107,0.4); border-radius: 50px; }
    .pn-top a:hover { background: #c8920a; color: #000; }
    .articles-group h2 { font-size: 1rem; color: #c9a962; margin: 2rem 0 0.75rem; letter-spacing: 0.05em; }
    .articles-group ol { list-style: none; padding: 0; margin: 0; }
    .articles-group li { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(180,155,105,0.15); }
    .articles-group a { color: #f2ead8; text-decoration: none; font-size: 1.05rem; font-weight: 600; }
    .articles-group a:hover { color: #e8c96b; }
    .articles-group .n { color: #c9a962; margin-right: 0.35rem; }
    .articles-group p { margin: 0.35rem 0 0; font-size: 0.88rem; color: #857b66; }
    .articles-item--featured { list-style: none; margin-bottom: 2rem; padding: 1rem; background: rgba(201,169,98,0.08); border-radius: 8px; border: 1px solid rgba(201,169,98,0.25); }
  </style>
</head>
<body>
  <nav class="pn-top" aria-label="Navigation">
    <a href="Home.html">← Accueil</a>
    <a href="Audio.html">🎧 Audio</a>
  </nav>
  <h1>📚 Tous les articles</h1>
  <p class="intro">Série numérotée #1 à #72 — chaque article propose la lecture vocale (▶ Écouter).</p>
  <ul class="articles-catalog">
${rows.join('\n')}
  </ul>
</body>
</html>
`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ——— 1) pages/*.html ———
let updated = 0;
for (const name of fs.readdirSync(pagesDir)) {
  if (!name.endsWith('.html') || SKIP_PAGES.has(name)) continue;
  if (processArticleHtml(path.join(pagesDir, name))) {
    console.log('écoute+nav:', name);
    updated++;
  }
}

// ——— 2) racine article52–72 + nations ———
for (let n = 52; n <= 72; n++) {
  const p = path.join(root, `article${n}.html`);
  if (fs.existsSync(p) && processArticleHtml(p)) console.log('écoute racine:', `article${n}.html`);
}

const nationLike = fs.readdirSync(root).filter((f) => f.endsWith('.html') && !/^article\d+\.html$/i.test(f) && f !== 'Articles.html' && f !== 'Home.html' && f !== 'index.html');
for (const f of nationLike) {
  const fp = path.join(root, f);
  const html = fs.readFileSync(fp, 'utf8');
  if (html.includes('<h1') && processArticleHtml(fp)) console.log('nav/écoute:', f);
}

// ——— 3) redirections article1–51 ———
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const byN = new Map();
for (const it of catalog.groups.flatMap((g) => g.items)) {
  byN.set(String(it.n), it.file);
}

for (let n = 1; n <= 51; n++) {
  const file = byN.get(String(n));
  if (!file) continue;
  fs.writeFileSync(path.join(root, `article${n}.html`), redirectHtml(n, file), 'utf8');
}
console.log('Redirections article1.html … article51.html créées (52–72 = contenu à la racine).');

// ——— 4) Articles.html ———
fs.writeFileSync(path.join(root, 'Articles.html'), generateArticlesPage(catalog), 'utf8');
console.log('Articles.html généré.');

// ——— 5) remplacer liens série-blog partout ———
function walkReplace(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (name === 'node_modules' || name === '.git') continue;
    const st = fs.statSync(fp);
    if (st.isDirectory()) walkReplace(fp);
    else if (/\.(html|mjs)$/i.test(name)) {
      let t = fs.readFileSync(fp, 'utf8');
      const n = fixNavLinks(t);
      if (n !== t) fs.writeFileSync(fp, n, 'utf8');
    }
  }
}
walkReplace(root);
console.log(`Terminé. ${updated} pages/ mises à jour avec lecture vocale.`);
