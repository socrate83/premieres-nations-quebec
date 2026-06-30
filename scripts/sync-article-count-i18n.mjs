/**
 * Met à jour les libellés « Articles 1–N » dans locales/*.json
 * à partir de blog-serie-articles.json → stats.articlesNumbered.
 *
 * À lancer après chaque nouvel article publié :
 *   node scripts/sync-article-count-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'blog-serie-articles.json');

function loadCount() {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const n = data.stats?.articlesNumbered;
  if (typeof n !== 'number' || n < 1) {
    throw new Error('stats.articlesNumbered manquant dans blog-serie-articles.json');
  }
  return n;
}

function patchLocale(file, n) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const lang = path.basename(file, '.json');

  if (lang === 'fr') {
    data.nav.articles = `📚 Articles 1–${n}`;
    data.nav.allArticles = `📚 Tous les articles (1–${n})`;
    data.home.serieTitle = `Série thématique — Les articles (${n})`;
    data.home.serieSub = `Neuf sous-séries de #1 à #${n} : spiritualité, histoire, savoir-faire québécois, Sagesse Oubliée, culture vivante… Chaque carte ouvre l'article complet.`;
    data.home.serieNotice = `Tous les articles au même endroit. Fiches #1–#51, puis #52–#${n} sur le Québec — lecture vocale sur chaque page.`;
    data.home.seeAllArticles = `📚 Voir tous les articles (#1 à #${n}) →`;
    data.articlesPage.intro = `Série numérotée #1 à #${n} — chaque article propose la lecture vocale (▶ Écouter).`;
    data.articlesPage.metaTitle = `Tous les articles (1–${n}) — Premières Nations du Québec`;
  } else if (lang === 'en') {
    data.nav.articles = `📚 Articles 1–${n}`;
    data.nav.allArticles = `📚 All articles (1–${n})`;
    data.home.serieTitle = `Thematic series — Articles (${n})`;
    data.home.serieSub = `Nine sub-series from #1 to #${n}: spirituality, history, Quebec know-how, forgotten wisdom, living culture… Each card opens the full article.`;
    data.home.serieNotice = `All articles in one place. Entries #1–#51, then #52–#${n} on Quebec — listen button (▶ Listen) on each page.`;
    data.home.seeAllArticles = `📚 See all articles (#1 to #${n}) →`;
    data.articlesPage.intro = `Numbered series #1 to #${n} — each article includes read-aloud (▶ Listen).`;
    data.articlesPage.metaTitle = `All articles (1–${n}) — First Nations of Quebec`;
  } else if (lang === 'es') {
    data.nav.articles = `📚 Artículos 1–${n}`;
    data.nav.allArticles = `📚 Todos los artículos (1–${n})`;
    data.home.serieTitle = `Serie temática — Artículos (${n})`;
    data.home.serieSub = `Nueve subseries del #1 al #${n}: espiritualidad, historia, saberes de Québec, sabiduría olvidada, cultura viva… Cada tarjeta abre el artículo completo.`;
    data.home.serieNotice = `Todos los artículos en un solo lugar. Fichas #1–#51, luego #52–#${n} sobre Québec — lectura en voz alta (▶ Escuchar) en cada página.`;
    data.home.seeAllArticles = `📚 Ver todos los artículos (#1 a #${n}) →`;
    data.articlesPage.intro = `Serie numerada #1 a #${n} — cada artículo incluye lectura en voz alta (▶ Escuchar).`;
    data.articlesPage.metaTitle = `Todos los artículos (1–${n}) — Primeras Naciones de Québec`;
  } else {
    return false;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return true;
}

function patchHtmlFallbacks(n) {
  const homePath = path.join(root, 'Home.html');
  let home = fs.readFileSync(homePath, 'utf8');
  home = home
    .replace(/data-i18n="nav\.articles">📚 Articles 1–\d+/g, `data-i18n="nav.articles">📚 Articles 1–${n}`)
    .replace(/Neuf sous-séries de #1 à #\d+/g, `Neuf sous-séries de #1 à #${n}`)
    .replace(/Fiches #1–#51, puis #52–#\d+/g, `Fiches #1–#51, puis #52–#${n}`)
    .replace(/Voir tous les articles \(#1 à #\d+\)/g, `Voir tous les articles (#1 à #${n})`);
  fs.writeFileSync(homePath, home, 'utf8');

  const articlesPath = path.join(root, 'Articles.html');
  let articles = fs.readFileSync(articlesPath, 'utf8');
  articles = articles
    .replace(/<title>Tous les articles \(1–\d+\)/, `<title>Tous les articles (1–${n})`)
    .replace(/Série numérotée #1 à #\d+/, `Série numérotée #1 à #${n}`);
  fs.writeFileSync(articlesPath, articles, 'utf8');
}

const n = loadCount();
for (const lang of ['fr', 'en', 'es']) {
  const file = path.join(root, 'locales', `${lang}.json`);
  if (patchLocale(file, n)) console.log('locales/' + lang + '.json → 1–' + n);
}
patchHtmlFallbacks(n);
console.log('Home.html + Articles.html fallbacks → 1–' + n);
console.log('Source: blog-serie-articles.json stats.articlesNumbered =', n);
