/**
 * Injecte <script src="article-share.js"> sur toutes les pages d'articles
 * (celles contenant #pn-article-root), avant lang-switcher.js. Idempotent.
 * Couvre les articles #1–72, les pages autonomes câblées, et toute future page
 * possédant #pn-article-root.
 *
 * Usage: node scripts/inject-article-share.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let n = 0;
for (const name of fs.readdirSync(root)) {
  if (!name.endsWith('.html')) continue;
  const fp = path.join(root, name);
  let html = fs.readFileSync(fp, 'utf8');
  if (!html.includes('pn-article-root')) continue;
  if (html.includes('article-share.js')) continue;

  const tag = '  <script src="article-share.js" defer></script>\n';
  if (/<script src="[^"]*lang-switcher\.js" defer><\/script>/i.test(html)) {
    html = html.replace(
      /(<script src="[^"]*lang-switcher\.js" defer><\/script>)/i,
      tag + '$1'
    );
  } else if (html.includes('</body>')) {
    html = html.replace(/<\/body>/i, tag + '</body>');
  } else {
    continue;
  }
  fs.writeFileSync(fp, html, 'utf8');
  n += 1;
  console.log('inject share:', name);
}
console.log('Terminé —', n, 'pages mises à jour.');
