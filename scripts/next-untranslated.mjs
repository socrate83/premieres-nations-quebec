/**
 * Affiche les N prochains slugs d'articles NON encore traduits (EN + ES),
 * d'après blog-serie-articles.json et locales/articles/{slug}.json.
 * Sert à alimenter `build-article-translations.mjs --only <slugs>` par lots.
 *
 * Usage: node scripts/next-untranslated.mjs [N]      (N par défaut = 10)
 * Sortie: liste de slugs séparés par des virgules (vide si tout est traduit).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const limit = Math.max(0, parseInt(process.argv[2] || '10', 10) || 10);

const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'blog-serie-articles.json'), 'utf8')
);
const outDir = path.join(root, 'locales', 'articles');

function isTranslated(slug) {
  const p = path.join(outDir, slug + '.json');
  if (!fs.existsSync(p)) return false;
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const ok = (l) => j[l] && typeof j[l].html === 'string' && j[l].html.length > 50;
    return ok('en') && ok('es');
  } catch {
    return false;
  }
}

const missing = [];
for (const g of catalog.groups || []) {
  for (const it of g.items || []) {
    if (!it.file) continue;
    const slug = it.file.replace(/\.html$/i, '');
    if (!isTranslated(slug)) missing.push(slug);
  }
}

process.stdout.write(missing.slice(0, limit).join(','));
