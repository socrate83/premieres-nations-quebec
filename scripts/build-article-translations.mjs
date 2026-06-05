/**
 * Génère locales/articles/*.json et locales/blog-serie-i18n.json (EN/ES).
 * Usage: node scripts/build-article-translations.mjs
 *        node scripts/build-article-translations.mjs --only article60,01-spiritualite-nature-premieres-nations
 *        node scripts/build-article-translations.mjs --skip-existing
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateHtml, translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'blog-serie-articles.json'), 'utf8'));
const outDir = path.join(root, 'locales', 'articles');
const args = process.argv.slice(2);
const onlyFlag = args.find((a) => a.startsWith('--only='))?.split('=')[1] || (args.includes('--only') ? args[args.indexOf('--only') + 1] : null);
const onlySet = onlyFlag ? new Set(onlyFlag.split(',').map((s) => s.trim())) : null;
const skipExisting = args.includes('--skip-existing');

fs.mkdirSync(outDir, { recursive: true });

function collectItems() {
  const items = [];
  if (catalog.featured?.file) {
    items.push({
      file: catalog.featured.file,
      title: catalog.featured.title,
      teaser: catalog.featured.teaser,
    });
  }
  for (const g of catalog.groups || []) {
    for (const it of g.items || []) {
      items.push({ file: it.file, title: it.title, teaser: it.teaser, label: g.label });
    }
  }
  return items;
}

function extractMainHtml(html) {
  const rootMatch = html.match(/<div id="pn-article-root"[^>]*>([\s\S]*?)<\/div>\s*(?=<script)/i);
  if (rootMatch) return rootMatch[1].trim();

  const navEnd = html.search(/<\/nav>/i);
  const start = navEnd >= 0 ? navEnd + 6 : 0;
  const endRe = /<script[^>]+src="[^"]*audio-player\.js"/i;
  const endRel = html.slice(start).search(endRe);
  const end = endRel >= 0 ? start + endRel : html.length;
  return html.slice(start, end).trim();
}

function pageTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

const blogI18n = { en: {}, es: {} };

async function processItem(item) {
  const slug = item.file.replace(/\.html$/i, '');
  if (onlySet && !onlySet.has(slug) && !onlySet.has(item.file)) return;

  const outPath = path.join(outDir, slug + '.json');
  if (skipExisting && fs.existsSync(outPath)) {
    console.log('skip', slug);
    return;
  }

  const fp = path.join(root, item.file);
  if (!fs.existsSync(fp)) {
    console.warn('missing', item.file);
    return;
  }

  const html = fs.readFileSync(fp, 'utf8');
  const mainHtml = extractMainHtml(html);
  const titleFr = pageTitle(html) || item.title;

  console.log('translate', slug, '(' + mainHtml.length + ' chars)…');

  const enHtml = await translateHtml(mainHtml, 'en', { delayMs: 400 });
  const esHtml = await translateHtml(mainHtml, 'es', { delayMs: 400 });
  const enTitle = await translateText(titleFr, 'en');
  const esTitle = await translateText(titleFr, 'es');

  const enTeaser = item.teaser ? await translateText(item.teaser, 'en') : '';
  const esTeaser = item.teaser ? await translateText(item.teaser, 'es') : '';

  blogI18n.en[item.file] = { title: item.title ? await translateText(item.title, 'en') : enTitle, teaser: enTeaser };
  blogI18n.es[item.file] = { title: item.title ? await translateText(item.title, 'es') : esTitle, teaser: esTeaser };

  const doc = {
    slug,
    file: item.file,
    en: { title: enTitle, html: enHtml },
    es: { title: esTitle, html: esHtml },
  };
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 0) + '\n', 'utf8');
  console.log('  →', outPath);
}

const items = collectItems();
for (const item of items) {
  await processItem(item);
}

const blogPath = path.join(root, 'locales', 'blog-serie-i18n.json');
if (!onlySet) {
  fs.writeFileSync(blogPath, JSON.stringify(blogI18n, null, 2) + '\n', 'utf8');
  console.log('blog-serie-i18n.json écrit.');
}
console.log('Terminé —', items.length, 'articles dans le catalogue.');
