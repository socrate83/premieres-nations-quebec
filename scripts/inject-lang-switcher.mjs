/**
 * Ajoute lang-switcher.css/js sur toutes les pages HTML.
 * Usage: node scripts/inject-lang-switcher.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = 'lang-switcher.js';

const SKIP = new Set(['BingSiteAuth.xml']);

function prefixFor(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  if (rel.startsWith('podcasts/')) return '..';
  if (rel.startsWith('pages/')) return '../';
  return '';
}

function inject(filePath) {
  if (!filePath.endsWith('.html') || SKIP.has(path.basename(filePath))) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes(MARKER)) return false;

  const pre = prefixFor(filePath);

  html = html.replace(
    /<a class="pn-nav-accueil__home" href="([^"]+)">← Retour à l'accueil<\/a>/g,
    `<a class="pn-nav-accueil__home" href="$1" data-i18n="nav.backHome">← Retour à l'accueil</a>`
  );
  html = html.replace(
    /<a href="([^"]*Articles\.html)">📚 Tous les articles \(1–72\)<\/a>/g,
    `<a href="$1" data-i18n="nav.allArticles">📚 Tous les articles (1–72)</a>`
  );
  html = html.replace(
    /<a href="([^"]*Articles\.html)">📚 Tous les articles<\/a>/g,
    `<a href="$1" data-i18n="nav.allArticles">📚 Tous les articles</a>`
  );

  const block =
    `  <link rel="stylesheet" href="${pre}lang-switcher.css">\n` +
    `  <script src="${pre}lang-switcher.js" defer></script>\n`;

  if (html.includes('</head>')) {
    html = html.replace(/<\/head>/i, block + '</head>');
  } else {
    return false;
  }

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

function walk(dir) {
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    if (name === '.git' || name === 'node_modules' || name === 'locales') continue;
    const st = fs.statSync(fp);
    if (st.isDirectory()) n += walk(fp);
    else if (name.endsWith('.html') && inject(fp)) {
      console.log('i18n:', path.relative(root, fp));
      n++;
    }
  }
  return n;
}

const count = walk(root);
console.log('Terminé —', count, 'fichiers mis à jour.');
