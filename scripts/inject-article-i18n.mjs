/**
 * Ajoute article-i18n.js sur les pages articles du catalogue.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'blog-serie-articles.json'), 'utf8'));

function files() {
  const s = new Set();
  if (catalog.featured?.file) s.add(catalog.featured.file);
  for (const g of catalog.groups || []) {
    for (const it of g.items || []) s.add(it.file);
  }
  return [...s];
}

for (const file of files()) {
  for (const base of [root, path.join(root, 'pages')]) {
    const fp = path.join(base, file);
    if (!fs.existsSync(fp)) continue;
    let html = fs.readFileSync(fp, 'utf8');
    const pre = base === root ? '' : '../';
    if (html.includes('article-i18n.js')) continue;
    const tag = `  <script src="${pre}article-i18n.js" defer></script>\n`;
    if (html.includes('lang-switcher.js')) {
      html = html.replace(
        /<script src="[^"]*lang-switcher\.js" defer><\/script>/i,
        tag + `  <script src="${pre}lang-switcher.js" defer></script>`
      );
    } else if (html.includes('</head>')) {
      html = html.replace(/<\/head>/i, tag + '</head>');
    }
    fs.writeFileSync(fp, html, 'utf8');
    console.log('inject', path.relative(root, fp));
  }
}
