/**
 * Génère locales/podcasts-i18n.json : traduction (EN + ES) des champs descriptifs
 * (desc, type, schedule) des podcasts/émissions de podcasts/catalog.json.
 * Les noms propres (title, hosts, platforms) ne sont pas traduits.
 *
 * Usage: node scripts/build-podcasts-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'podcasts', 'catalog.json'), 'utf8')
);

const items = [...(catalog.live || []), ...(catalog.podcasts || [])];
const out = { en: {}, es: {} };
let n = 0;

for (const it of items) {
  if (!it.id) continue;
  for (const lang of ['en', 'es']) {
    out[lang][it.id] = {
      desc: it.desc ? await translateText(it.desc, lang) : '',
      type: it.type ? await translateText(it.type, lang) : '',
      schedule: it.schedule ? await translateText(it.schedule, lang) : '',
    };
  }
  n += 1;
  console.log(`podcast ${n}/${items.length} : ${it.id}`);
}

const outPath = path.join(root, 'locales', 'podcasts-i18n.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Écrit ${outPath} — ${n} entrées (EN + ES).`);
