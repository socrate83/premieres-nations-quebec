/**
 * Audit de couverture i18n de TOUTES les pages HTML servies (racine du dépôt).
 * Pour chaque page : présence du commutateur de langue, mécanisme (article /
 * nation / data-i18n), et — pour les pages d'articles — présence de la traduction
 * EN/ES dans locales/articles/{slug}.json.
 *
 * Usage: node scripts/audit-site-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function visibleTextLen(html) {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return h.length;
}

function articleSlug(html, fname) {
  const m = html.match(/data-pn-article-slug=["']([^"']+)["']/);
  return m ? m[1] : fname.replace(/\.html$/i, '');
}

function locStatus(slug) {
  const p = path.join(root, 'locales', 'articles', slug + '.json');
  if (!fs.existsSync(p)) return 'absent';
  try {
    const j = JSON.parse(read(p));
    const ok = (l) => j[l] && typeof j[l].html === 'string' && j[l].html.length > 50;
    return ok('en') && ok('es') ? 'ok' : 'partiel';
  } catch {
    return 'erreur';
  }
}

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.html'))
  .sort();

const rows = [];
for (const f of files) {
  const html = read(path.join(root, f));
  const isRedirect = /http-equiv=["']refresh["']/i.test(html) || /location\.replace/i.test(html);
  const hasSwitcher = html.includes('lang-switcher.js');
  const isArticle = html.includes('article-i18n.js') && html.includes('pn-article-root');
  const isNation = html.includes('nation-i18n.js');
  const dataI18n = (html.match(/data-i18n=/g) || []).length;
  const textLen = visibleTextLen(html);
  let trans = '-';
  if (isArticle) trans = locStatus(articleSlug(html, f));
  rows.push({ f, isRedirect, hasSwitcher, isArticle, isNation, dataI18n, textLen, trans });
}

// Rapport
const big = rows.filter((r) => !r.isRedirect);
console.log('=== PAGES (hors redirections) :', big.length, '===\n');

const noSwitcher = big.filter((r) => !r.hasSwitcher);
console.log('### Pages SANS commutateur de langue (texte FR non traduisible) :', noSwitcher.length);
noSwitcher.forEach((r) => console.log(`  - ${r.f}  (texte ~${r.textLen} car., data-i18n=${r.dataI18n})`));

const artMissing = big.filter((r) => r.isArticle && r.trans !== 'ok');
console.log('\n### Articles avec corps NON traduit (EN/ES) :', artMissing.length);
artMissing.forEach((r) => console.log(`  - ${r.f}  [${r.trans}]`));

const plainNoData = big.filter(
  (r) => r.hasSwitcher && !r.isArticle && !r.isNation && r.dataI18n < 5 && r.textLen > 800
);
console.log(
  '\n### Pages "autonomes" avec switcher mais PEU de data-i18n (texte FR probablement non traduit) :',
  plainNoData.length
);
plainNoData.forEach((r) => console.log(`  - ${r.f}  (texte ~${r.textLen} car., data-i18n=${r.dataI18n})`));

console.log('\n=== Récap par catégorie ===');
console.log('Articles (corps):', big.filter((r) => r.isArticle).length, '| traduits ok:', big.filter((r) => r.isArticle && r.trans === 'ok').length);
console.log('Pages nation:', big.filter((r) => r.isNation).length);
console.log('Avec switcher:', big.filter((r) => r.hasSwitcher).length, '/ Sans switcher:', noSwitcher.length);
