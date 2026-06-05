/**
 * Traduit le corps complet des 11 pages nations → locales/nations-bodies/{id}.json
 * Usage: node scripts/build-nation-body-translations.mjs
 *        node scripts/build-nation-body-translations.mjs --only abenaquis,algonquins
 *        node scripts/build-nation-body-translations.mjs --skip-existing
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateHtml } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'locales', 'nations-bodies');

const NATIONS = [
  { id: 'abenaquis', file: 'Abenaquis.html' },
  { id: 'algonquins', file: 'Algonquins.html' },
  { id: 'atikamekw', file: 'Atikamekw.html' },
  { id: 'cris', file: 'Cris.html' },
  { id: 'huronswendat', file: 'HuronsWendat.html' },
  { id: 'innus', file: 'Innus.html' },
  { id: 'malecites', file: 'Malecites.html' },
  { id: 'micmacs', file: 'Micmacs.html' },
  { id: 'mohawks', file: 'Mohawks.html' },
  { id: 'naskapis', file: 'Naskapis.html' },
  { id: 'inuit', file: 'Inuits.html' },
];

const args = process.argv.slice(2);
const onlyFlag =
  args.find((a) => a.startsWith('--only='))?.split('=')[1] ||
  (args.includes('--only') ? args[args.indexOf('--only') + 1] : null);
const onlySet = onlyFlag ? new Set(onlyFlag.split(',').map((s) => s.trim().toLowerCase())) : null;
const skipExisting = args.includes('--skip-existing');

fs.mkdirSync(outDir, { recursive: true });

function extractNationBody(html) {
  const rootM = html.match(/<div id="pn-nation-root"[^>]*>([\s\S]*?)<\/div>\s*<\/article>/i);
  if (rootM) return rootM[1].trim();
  const artM = html.match(/<article class="article-ecoute">([\s\S]*?)<\/article>/i);
  return artM ? artM[1].trim() : '';
}

function extractNationTail(html) {
  const tailM = html.match(/<div id="pn-nation-tail"[^>]*>([\s\S]*?)<\/div>\s*(?=<script\b)/i);
  return tailM ? tailM[1].trim() : '';
}

for (const nation of NATIONS) {
  if (onlySet && !onlySet.has(nation.id)) continue;

  const outPath = path.join(outDir, nation.id + '.json');
  if (skipExisting && fs.existsSync(outPath)) {
    console.log('skip', nation.id);
    continue;
  }

  const fp = path.join(root, nation.file);
  if (!fs.existsSync(fp)) {
    console.warn('missing', nation.file);
    continue;
  }

  const html = fs.readFileSync(fp, 'utf8');
  const body = extractNationBody(html);
  const tail = extractNationTail(html);
  if (!body || body.length < 100) {
    console.warn('empty body', nation.id);
    continue;
  }

  console.log('translate', nation.id, 'body', body.length, 'tail', tail.length, '…');
  const enHtml = await translateHtml(body, 'en', { delayMs: 100 });
  const esHtml = await translateHtml(body, 'es', { delayMs: 100 });
  const enTail = tail ? await translateHtml(tail, 'en', { delayMs: 100 }) : '';
  const esTail = tail ? await translateHtml(tail, 'es', { delayMs: 100 }) : '';

  const doc = {
    id: nation.id,
    file: nation.file,
    en: { html: enHtml, tail: enTail },
    es: { html: esHtml, tail: esTail },
  };
  fs.writeFileSync(outPath, JSON.stringify(doc) + '\n', 'utf8');
  console.log('  →', outPath);
}

console.log('Terminé — 11 nations.');
