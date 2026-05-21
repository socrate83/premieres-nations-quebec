/**
 * Étend le catalogue blog (1–71+) et copie article52…articleNN dans pages/.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'pages');
const catalogPath = path.join(pagesDir, 'blog-serie-articles.json');

const QUEBEC_GROUPS = [
  {
    label: 'Série 6 — articles 52 à 56',
    range: [52, 56],
    note: 'Peuples Autochtones du Québec — savoir-faire et territoire',
  },
  {
    label: 'Série 7 — articles 57 à 62',
    range: [57, 62],
    note: 'La Sagesse Oubliée',
  },
  {
    label: 'Série 8 — articles 63 à 71',
    range: [63, 71],
    note: 'Peuples Autochtones du Québec — culture et enjeux',
  },
  {
    label: 'Série 9 — article 72 et suivants',
    range: [72, 72],
    note: 'Derniers numéros publiés — compléter ici les prochains',
  },
];

function parseArticleHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const titleM = html.match(/<title>([^<]+)<\/title>/i);
  const descM = html.match(
    /<meta\s+name=["']description["']\s+content=(["'])((?:\\\1|(?!\1).)*)\1/i
  );
  const teaserRaw = descM?.[2] || '';
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let title = (titleM?.[1] || '').replace(/\s*#\d+\s*[-–—]\s*/i, '').trim();
  if (!title && h1M) {
    title = h1M[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    title = title.replace(/^#\d+\s*[—–-]\s*/i, '').split('\n')[0].trim();
  }
  const teaser = (teaserRaw || title).trim();
  return { title, teaser };
}

function copyArticle(n) {
  const name = `article${n}.html`;
  const src = path.join(root, name);
  const dest = path.join(pagesDir, name);
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function buildItem(n) {
  const file = `article${n}.html`;
  const src = path.join(root, file);
  if (!fs.existsSync(src)) return null;
  copyArticle(n);
  const { title, teaser } = parseArticleHtml(src);
  return { n: String(n), title, teaser, file };
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Conserver séries 1–5 (articles 1–51)
const baseGroups = catalog.groups.filter((g) => {
  const max = Math.max(
    ...g.items.map((it) => parseInt(String(it.n), 10)).filter((x) => !isNaN(x)),
    0
  );
  return max <= 51;
});

const newGroups = QUEBEC_GROUPS.map(({ label, range }) => {
  const items = [];
  for (let n = range[0]; n <= range[1]; n++) {
    const item = buildItem(n);
    if (item) items.push(item);
  }
  return { label, items };
}).filter((g) => g.items.length > 0);

catalog.groups = [...baseGroups, ...newGroups];

const allNums = catalog.groups.flatMap((g) =>
  g.items.map((it) => parseInt(String(it.n), 10)).filter((n) => !isNaN(n))
);
const maxPublished = Math.max(...allNums, 0);

catalog.stats = {
  articlesNumbered: maxPublished,
  withFeatured: !!catalog.featured,
  nextArticle: maxPublished + 1,
};
catalog.introNote =
  'Tous les articles numérotés du site (#1 à #' +
  maxPublished +
  ' et les prochains) : une seule grille. Les nouveaux numéros s’ajoutent dans pages/blog-serie-articles.json et pages/articleNN.html.';
catalog.baseUrl = 'pages/';

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Catalogue:', maxPublished, 'articles, groupes:', catalog.groups.length);
