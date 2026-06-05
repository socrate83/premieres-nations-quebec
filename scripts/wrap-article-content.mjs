/**
 * Encadre le corps des articles dans #pn-article-root pour l'i18n.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'blog-serie-articles.json'), 'utf8'));

function collectFiles() {
  const files = new Set();
  if (catalog.featured?.file) files.add(catalog.featured.file);
  for (const g of catalog.groups || []) {
    for (const it of g.items || []) files.add(it.file);
  }
  return [...files];
}

function wrapHtml(html, slug) {
  if (html.includes('id="pn-article-root"')) return html;

  const navRe = /<\/nav>\s*/i;
  const navM = html.match(navRe);
  if (!navM) return html;
  const start = navM.index + navM[0].length;

  const endMarkers = [
    /<script[^>]+src="[^"]*audio-player\.js"/i,
    /<script[^>]+src="[^"]*\.\.\/audio-player\.js"/i,
  ];
  let end = html.length;
  for (const re of endMarkers) {
    const m = html.slice(start).search(re);
    if (m >= 0) end = Math.min(end, start + m);
  }

  const before = html.slice(0, start);
  const middle = html.slice(start, end).trim();
  const after = html.slice(end);

  if (!middle || middle.length < 40) return html;

  const wrapped =
    before +
    `\n<div id="pn-article-root" data-pn-article-slug="${slug}">\n` +
    middle +
    `\n</div>\n` +
    after;

  return wrapped.replace(
    /<body([^>]*)>/i,
    (m, attrs) => (attrs.includes('data-pn-article-slug') ? m : `<body${attrs} data-pn-article-slug="${slug}">`)
  );
}

let n = 0;
for (const file of collectFiles()) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    console.warn('missing', file);
    continue;
  }
  const slug = file.replace(/\.html$/i, '');
  const html = fs.readFileSync(fp, 'utf8');
  const next = wrapHtml(html, slug);
  if (next !== html) {
    fs.writeFileSync(fp, next, 'utf8');
    n++;
    console.log('wrapped', file);
  }
}
console.log('Done —', n, 'fichiers modifiés.');
