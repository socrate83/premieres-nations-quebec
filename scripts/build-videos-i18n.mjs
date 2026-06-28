/**
 * Génère locales/videos-i18n.json : traduction (EN + ES) du tag, du titre et de
 * la description de chaque vidéo de videos-catalog.json (cartes de Videos.html).
 *
 * Usage: node scripts/build-videos-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'videos-catalog.json'), 'utf8'));

const out = { en: {}, es: {} };
const videos = catalog.videos || [];
let n = 0;

for (const v of videos) {
  if (!v.youtubeId) continue;
  for (const lang of ['en', 'es']) {
    out[lang][v.youtubeId] = {
      tag: v.tag ? await translateText(v.tag, lang) : '',
      title: v.title ? await translateText(v.title, lang) : '',
      description: v.description ? await translateText(v.description, lang) : '',
    };
  }
  n += 1;
  console.log(`vidéo ${n}/${videos.length} : ${v.youtubeId}`);
}

const outPath = path.join(root, 'locales', 'videos-i18n.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Écrit ${outPath} — ${n} vidéos (EN + ES).`);
