/**
 * Étend <article class="article-ecoute"> sur tout le contenu des pages nations
 * (intro + sections), pour la lecture vocale complète.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const NATION_PAGES = [
  'Abenaquis.html',
  'Algonquins.html',
  'Atikamekw.html',
  'Cris.html',
  'HuronsWendat.html',
  'Innus.html',
  'Malecites.html',
  'Micmacs.html',
  'Mohawks.html',
  'Naskapis.html',
  'Inuits.html',
];

const HEAD_LINK = '  <link rel="stylesheet" href="style.css">\n';
const SCRIPT_TAG = '  <script src="audio-player.js" defer></script>\n';

function stripArticleTags(html) {
  return html
    .replace(/<article\s+class="article-ecoute"\s*>\s*/gi, '')
    .replace(/\s*<\/article>\s*(?=\s*<(?:footer|div class="share-footer"))/gi, '\n');
}

function findWrapStart(html) {
  const markers = [
    /<div class="intro-wrap"/i,
    /<section class="intro-section"/i,
    /<section class="section"/i,
  ];
  for (const re of markers) {
    const i = html.search(re);
    if (i >= 0) return i;
  }
  return -1;
}

function findWrapEnd(html, startIdx) {
  const shareIdx = html.search(/<div class="share-footer"/i);
  const footerIdx = html.search(/<footer[\s>]/i);
  let endIdx = -1;
  if (shareIdx >= 0) endIdx = shareIdx;
  if (footerIdx >= 0 && (endIdx < 0 || footerIdx < endIdx)) endIdx = footerIdx;
  return endIdx > startIdx ? endIdx : -1;
}

function ensureAssets(html) {
  if (!html.includes('href="style.css"')) {
    html = html.replace(/<\/head>/i, HEAD_LINK + '</head>');
  }
  if (!html.includes('audio-player.js')) {
    html = html.replace(/<\/body>/i, SCRIPT_TAG + '</body>');
  }
  return html;
}

function fixFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  html = ensureAssets(html);

  const startIdx = findWrapStart(html);
  const endIdx = findWrapEnd(html, startIdx);
  if (startIdx < 0 || endIdx < 0) {
    console.log('SKIP (structure):', path.basename(filePath));
    return;
  }

  const before = html.slice(0, startIdx);
  const body = html.slice(startIdx, endIdx);
  const after = html.slice(endIdx);

  if (before.includes('article-ecoute') || body.includes('<article')) {
    html = stripArticleTags(html);
  }

  const startIdx2 = findWrapStart(html);
  const endIdx2 = findWrapEnd(html, startIdx2);
  if (startIdx2 < 0 || endIdx2 < 0) {
    console.log('SKIP (après strip):', path.basename(filePath));
    return;
  }

  const out =
    html.slice(0, startIdx2) +
    '<article class="article-ecoute">\n' +
    html.slice(startIdx2, endIdx2) +
    '\n</article>\n' +
    html.slice(endIdx2);

  fs.writeFileSync(filePath, out, 'utf8');
  console.log('OK:', path.basename(filePath));
}

for (const f of NATION_PAGES) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) fixFile(p);
}

console.log('Terminé.');
