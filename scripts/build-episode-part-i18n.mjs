/**
 * Traduit une ou plusieurs pages HTML (parties #79+) → locales/articles/{slug}.json
 * Usage: node scripts/build-episode-part-i18n.mjs 79-l-hiver-pierre-le-fouineur
 *        node scripts/build-episode-part-i18n.mjs --only slug1,slug2
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateHtml, translateText } from './lib/translate-chunks.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'locales', 'articles');
const args = process.argv.slice(2);
const onlyFlag =
  args.find((a) => a.startsWith('--only='))?.split('=')[1] ||
  (args.includes('--only') ? args[args.indexOf('--only') + 1] : null);
const slugs = onlyFlag
  ? onlyFlag.split(',').map((s) => s.trim().replace(/\.html$/i, ''))
  : args.filter((a) => !a.startsWith('--')).map((s) => s.replace(/\.html$/i, ''));

if (!slugs.length) {
  console.error('Usage: node scripts/build-episode-part-i18n.mjs <slug> [slug2…]');
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

function extractMainHtml(html) {
  const rootMatch = html.match(/<article[^>]*id="pn-article-root"[^>]*>([\s\S]*?)<\/article>/i);
  if (rootMatch) return rootMatch[1].trim();
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) return articleMatch[1].trim();
  return '';
}

function pageTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

async function translateSlug(slug) {
  const file = slug + '.html';
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    console.warn('missing', file);
    return;
  }
  const html = fs.readFileSync(fp, 'utf8');
  const mainHtml = extractMainHtml(html);
  if (!mainHtml) {
    console.warn('no article body in', file);
    return;
  }
  const titleFr = pageTitle(html);
  console.log('translate', slug, '(' + mainHtml.length + ' chars)…');
  const enHtml = await translateHtml(mainHtml, 'en', { delayMs: 400 });
  const esHtml = await translateHtml(mainHtml, 'es', { delayMs: 400 });
  const enTitle = await translateText(titleFr, 'en');
  const esTitle = await translateText(titleFr, 'es');
  const doc = {
    slug,
    file,
    en: { title: enTitle, html: enHtml },
    es: { title: esTitle, html: esHtml },
  };
  const outPath = path.join(outDir, slug + '.json');
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 0) + '\n', 'utf8');
  console.log('  →', outPath);

  if (slug === '79-l-hiver-pierre-le-fouineur') {
    const blogPath = path.join(root, 'locales', 'blog-serie-i18n.json');
    const blog = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
    const teaserFr =
      "C'est quoi l'hiver au Québec : neige, glace, froid et vigilance sur le territoire — le carnet n° 4 de Pierre le Fouineur, publié en quatre parties.";
    blog.en = blog.en || {};
    blog.es = blog.es || {};
    blog.en[file] = {
      title: await translateText("L'Hiver sur le territoire — Partie 1 (Carnet n° 4)", 'en'),
      teaser: await translateText(teaserFr, 'en'),
    };
    blog.es[file] = {
      title: await translateText("L'Hiver sur le territoire — Partie 1 (Carnet n° 4)", 'es'),
      teaser: await translateText(teaserFr, 'es'),
    };
    fs.writeFileSync(blogPath, JSON.stringify(blog, null, 2) + '\n', 'utf8');
    console.log('  → blog-serie-i18n.json (#79 partie 1)');
  }
}

for (const slug of slugs) {
  await translateSlug(slug);
}
console.log('Terminé —', slugs.length, 'partie(s).');
