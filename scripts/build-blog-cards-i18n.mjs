/**
 * Génère locales/blog-serie-i18n.json : traduction (EN + ES) des TITRES et
 * TEASERS des cartes d'articles (#1 à #72 + featured) affichées sur Home.html.
 * Léger : ne traduit que titre + teaser (pas les corps d'articles).
 *
 * Usage: node scripts/build-blog-cards-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'blog-serie-articles.json'), 'utf8')
);

function collectItems() {
  const items = [];
  const seen = new Set();
  const add = (it) => {
    if (!it || !it.file || seen.has(it.file)) return;
    seen.add(it.file);
    items.push(it);
  };
  if (catalog.featured) add(catalog.featured);
  for (const g of catalog.groups || []) {
    for (const it of g.items || []) add(it);
  }
  return items;
}

const out = { en: {}, es: {} };
const items = collectItems();
let n = 0;

for (const it of items) {
  const title = it.title || '';
  const teaser = it.teaser || '';
  out.en[it.file] = {
    title: title ? await translateText(title, 'en') : '',
    teaser: teaser ? await translateText(teaser, 'en') : '',
  };
  out.es[it.file] = {
    title: title ? await translateText(title, 'es') : '',
    teaser: teaser ? await translateText(teaser, 'es') : '',
  };
  n += 1;
  console.log(`carte ${n}/${items.length} : ${it.file}`);
}

const outPath = path.join(root, 'locales', 'blog-serie-i18n.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Écrit ${outPath} — ${items.length} cartes (EN + ES).`);
