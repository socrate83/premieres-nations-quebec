/**
 * Génère locales/articles/77-les-techniques-de-peche.json (EN + ES).
 * Usage: node scripts/build-article-77-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateHtml, translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = '77-les-techniques-de-peche';
const file = slug + '.html';
const fp = path.join(root, file);

function extractMainHtml(html) {
  const rootMatch = html.match(/<div id="pn-article-root"[^>]*>([\s\S]*?)<\/div>\s*(?=<nav class="nav-art")/i);
  if (rootMatch) return rootMatch[1].trim();
  throw new Error('pn-article-root not found');
}

function pageTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

const html = fs.readFileSync(fp, 'utf8');
const mainHtml = extractMainHtml(html);
const titleFr = pageTitle(html);

console.log('Translating', slug, mainHtml.length, 'chars…');

const enHtml = await translateHtml(mainHtml, 'en', { delayMs: 100 });
const esHtml = await translateHtml(mainHtml, 'es', { delayMs: 100 });
const enTitle = await translateText(titleFr, 'en');
const esTitle = await translateText(titleFr, 'es');

const doc = {
  slug,
  file,
  en: { title: enTitle, html: enHtml },
  es: { title: esTitle, html: esHtml },
};

const outPath = path.join(root, 'locales', 'articles', slug + '.json');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 0) + '\n', 'utf8');
console.log('Wrote', outPath);
