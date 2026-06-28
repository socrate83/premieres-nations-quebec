/**
 * Traduit (EN + ES) le corps des pages HORS catalogue déjà câblées avec
 * <div id="pn-article-root" data-pn-article-slug="SLUG"> (voir wire-standalone-i18n.mjs).
 * Écrit locales/articles/{slug}.json.
 *
 * Usage: node scripts/translate-extra-pages.mjs [--skip-existing]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateHtml, translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const skipExisting = process.argv.includes('--skip-existing');
const outDir = path.join(root, 'locales', 'articles');
fs.mkdirSync(outDir, { recursive: true });

const FILES = [
  '52-les-architectes-du-silence.html',
  'BijouxPremieresNations.html',
  'FemmesAutochtones.html',
  'FemmesAutochtones2.html',
  'LanguesAutochtones.html',
  'PensionnatsIndiens.html',
];

function extractRootInner(html) {
  // pn-article-root enveloppe exactement l'unique <article class="article-ecoute">…</article>.
  // (Le comptage de <div> serait peu fiable : le HTML hérité a des <div> déséquilibrés.)
  if (!html.includes('pn-article-root')) return null;
  const m = html.match(/<article class="article-ecoute"[\s\S]*<\/article>/i);
  return m ? m[0].trim() : null;
}

function pageTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

for (const file of FILES) {
  const slug = file.replace(/\.html$/i, '');
  const outPath = path.join(outDir, slug + '.json');
  if (skipExisting && fs.existsSync(outPath)) {
    console.log('skip', slug);
    continue;
  }
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    console.warn('absent:', file);
    continue;
  }
  const html = fs.readFileSync(fp, 'utf8');
  const inner = extractRootInner(html);
  if (!inner) {
    console.warn('pas de pn-article-root dans', file, '(lancer wire-standalone-i18n.mjs d\'abord)');
    continue;
  }
  const titleFr = pageTitle(html);
  console.log('translate', slug, '(' + inner.length + ' chars)…');
  const en = await translateHtml(inner, 'en', { delayMs: 400 });
  const es = await translateHtml(inner, 'es', { delayMs: 400 });
  const enTitle = titleFr ? await translateText(titleFr, 'en') : '';
  const esTitle = titleFr ? await translateText(titleFr, 'es') : '';
  const doc = { slug, file, en: { title: enTitle, html: en }, es: { title: esTitle, html: es } };
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 0) + '\n', 'utf8');
  console.log('  →', outPath);
}
console.log('Terminé.');
