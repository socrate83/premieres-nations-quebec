/**
 * Prochains slugs d'articles NON traduits (EN + ES), dans l'ordre numérique (#1, #2… #72).
 * Usage: node scripts/next-untranslated.mjs [N]   (N par défaut = 1)
 * Sortie: slugs séparés par des virgules (vide si tout est traduit).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const limit = Math.max(0, parseInt(process.argv[2] || '5', 10) || 5);

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

/** Numéro d'article pour tri (#15 avant #16). ★ / sans numéro → fin de file. */
function articleNum(it) {
  if (it.n != null && /^\d+$/.test(String(it.n))) return parseInt(String(it.n), 10);
  const m = (it.file || '').match(/^(\d+)-/);
  return m ? parseInt(m[1], 10) : 99999;
}

const items = [];
if (catalog.featured?.file) {
  items.push({
    file: catalog.featured.file,
    n: catalog.featured.n,
  });
}
for (const g of catalog.groups || []) {
  for (const it of g.items || []) {
    if (it.file) items.push(it);
  }
}

items.sort((a, b) => articleNum(a) - articleNum(b));

const missing = [];
for (const it of items) {
  const slug = it.file.replace(/\.html$/i, '');
  if (!isTranslated(slug)) missing.push(slug);
}

process.stdout.write(missing.slice(0, limit).join(','));
