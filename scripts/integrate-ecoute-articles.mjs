/**
 * Ajoute <article>, style.css et audio-player.js aux pages d'articles.
 * Usage: node scripts/integrate-ecoute-articles.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const NATION_PAGES = [
  'Abenaquis.html',
  'abenaquis.html',
  'Algonquins.html',
  'Atikamekw.html',
  'Cris.html',
  'HuronsWendat.html',
  'Innus.html',
  'Inuits.html',
  'Malecites.html',
  'Micmacs.html',
  'Mohawks.html',
  'Naskapis.html',
];

const THEMATIC_PAGES = [
  'FemmesAutochtones.html',
  'FemmesAutochtones2.html',
  'PensionnatsIndiens.html',
  'LanguesAutochtones.html',
  'BijouxPremieresNations.html',
];

const HEAD_LINK = '  <link rel="stylesheet" href="style.css">\n';
const SCRIPT_TAG = '  <script src="audio-player.js" defer></script>\n';

function hasEcoute(html) {
  return html.includes('audio-player.js') && html.includes('article-ecoute');
}

function addHead(html) {
  if (html.includes('href="style.css"')) return html;
  return html.replace(/<\/head>/i, HEAD_LINK + '</head>');
}

function addScript(html) {
  if (html.includes('audio-player.js')) return html;
  return html.replace(/<\/body>/i, SCRIPT_TAG + '</body>');
}

/** Série blog : tout le corps à partir du premier h1 */
function wrapBlogArticle(html) {
  const bodyRe = /<body([^>]*)>([\s\S]*)<\/body>/i;
  const m = html.match(bodyRe);
  if (!m) return html;

  let attrs = m[1];
  let inner = m[2].trim();
  if (inner.includes('<article class="article-ecoute"')) return html;

  const h1Pos = inner.search(/<h1\b/i);
  if (h1Pos < 0) return html;

  const endMarkers = [/<div class="nav-art"/i, /<div class="footer-sources"/i];
  let endIdx = -1;
  for (const re of endMarkers) {
    const i = inner.search(re);
    if (i >= 0 && (endIdx < 0 || i < endIdx)) endIdx = i;
  }

  const before = inner.slice(0, h1Pos);
  const articleBody = endIdx > h1Pos ? inner.slice(h1Pos, endIdx) : inner.slice(h1Pos);
  const after = endIdx > h1Pos ? inner.slice(endIdx) : '';
  inner = before + '<article class="article-ecoute">\n' + articleBody + '\n</article>\n' + after;

  return html.replace(bodyRe, '<body' + attrs + '>\n' + inner + '\n</body>');
}

/** Pages nation : intro + toutes les sections dans <article> */
function wrapNationPage(html) {
  if (html.includes('<article class="article-ecoute"')) return html;

  const introWrap = html.search(/<div class="intro-wrap"/i);
  const introSection = html.search(/<section class="intro-section"/i);
  const firstSection = html.search(/<section class="section"/i);
  const startIdx =
    introWrap >= 0 ? introWrap : introSection >= 0 ? introSection : firstSection;
  if (startIdx < 0) return wrapBlogArticle(html);

  const footerIdx = html.search(/<footer[\s>]/i);
  const shareIdx = html.search(/<div class="share-footer"/i);
  const endIdx = footerIdx >= 0 ? footerIdx : shareIdx >= 0 ? shareIdx : -1;
  if (endIdx < 0 || endIdx <= startIdx) return html;

  const open = '<article class="article-ecoute">\n';
  const close = '\n</article>\n';

  return html.slice(0, startIdx) + open + html.slice(startIdx, endIdx) + close + html.slice(endIdx);
}

/** Pages .container (Femmes, Pensionnats…) */
function wrapContainerPage(html) {
  if (html.includes('<article class="article-ecoute"')) return html;

  const cOpen = html.search(/<div class="container"/i);
  if (cOpen < 0) return html;

  const footerIdx = html.search(/<footer[\s>]/i);
  const shareIdx = html.search(/<div class="share-section"/i);
  const endIdx = shareIdx >= 0 ? shareIdx : footerIdx >= 0 ? footerIdx : -1;
  if (endIdx < 0) return html;

  const open = '<article class="article-ecoute">\n';
  const close = '\n</article>\n';

  return html.slice(0, cOpen) + open + html.slice(cOpen, endIdx) + close + html.slice(endIdx);
}

function processFile(filePath, wrapFn) {
  let html = fs.readFileSync(filePath, 'utf8');
  if (hasEcoute(html)) {
    console.log('skip (déjà intégré):', path.basename(filePath));
    return;
  }
  html = addHead(html);
  html = wrapFn(html);
  html = addScript(html);
  if (html.includes('background:#0a0a0a') || html.includes('background: #0a0a0a')) {
    html = html.replace(/<body([^>]*)>/i, function (m, a) {
      if (a.includes('ecoute-sombre')) return m;
      return '<body' + a + ' class="ecoute-sombre">';
    });
    html = html.replace(/<body class="/, '<body class="ecoute-sombre ');
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('OK:', path.basename(filePath));
}

const articleFiles = fs.readdirSync(root).filter((f) => /^article\d+\.html$/i.test(f));

for (const f of articleFiles) {
  processFile(path.join(root, f), wrapBlogArticle);
}
for (const f of NATION_PAGES) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) processFile(p, wrapNationPage);
}
for (const f of THEMATIC_PAGES) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) processFile(p, wrapContainerPage);
}

console.log('Terminé.');
