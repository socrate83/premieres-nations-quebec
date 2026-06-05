/**
 * Encadre le contenu des pages nations dans #pn-nation-root.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
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

for (const file of FILES) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) continue;
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('id="pn-nation-root"')) {
    console.log('skip', file);
    continue;
  }
  const m = html.match(/(<article class="article-ecoute">)([\s\S]*?)(<\/article>)/i);
  if (!m) {
    console.warn('no article-ecoute', file);
    continue;
  }
  const wrapped =
    m[1] + '\n<div id="pn-nation-root">\n' + m[2].trim() + '\n</div>\n' + m[3];
  html = html.replace(m[0], wrapped);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('wrapped', file);
}
