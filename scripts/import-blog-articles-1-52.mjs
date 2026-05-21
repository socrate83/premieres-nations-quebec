/**
 * Importe les articles numérotés 1–52 depuis le blog archive
 * https://socrate83.github.io/Premieres-Nations/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pagesDir = path.join(root, 'pages');
const catalogPath = path.join(pagesDir, 'blog-serie-articles.json');
const SOURCE = 'https://socrate83.github.io/Premieres-Nations/';

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
catalog.baseUrl = '';
catalog.introNote =
  'Série thématique sur les Premières Nations (thèmes nord-américains et canadiens). Chaque carte ouvre l’article complet sur ce site.';

const allItems = catalog.groups.flatMap((g) => g.items);
const maxN = 52;
const toFetch = new Map();

if (catalog.featured?.file) {
  toFetch.set(catalog.featured.file, { n: '★', title: catalog.featured.title });
}
for (const it of allItems) {
  const n = parseInt(String(it.n), 10);
  if (!isNaN(n) && n <= maxN) toFetch.set(it.file, it);
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          get(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode !== 200) reject(new Error(`${res.statusCode} ${url}`));
          else resolve(body);
        });
      })
      .on('error', reject);
  });
}

fs.mkdirSync(pagesDir, { recursive: true });

let ok = 0;
let fail = 0;

for (const [file, meta] of toFetch) {
  const dest = path.join(pagesDir, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
    console.log('skip', file);
    ok++;
    continue;
  }
  const url = SOURCE + encodeURI(file);
  try {
    const html = await get(url);
    fs.writeFileSync(dest, html, 'utf8');
    console.log('ok', meta.n, file);
    ok++;
  } catch (e) {
    console.warn('fail', meta.n, file, e.message);
    fail++;
  }
}

// Article 51 : version locale (vent / ciel) si absente du blog archive
const art51 = '51-le-vent-le-ciel-et-le-souffle.html';
const art51Path = path.join(pagesDir, art51);
if (!fs.existsSync(art51Path) || fs.statSync(art51Path).size < 2000) {
  const { execSync } = await import('child_process');
  try {
    const html = execSync(`git show 9bec38a:pages/${art51}`, {
      cwd: root,
      encoding: 'utf8',
    });
    fs.writeFileSync(art51Path, html, 'utf8');
    console.log('ok 51 from git', art51);
    ok++;
  } catch (e) {
    console.warn('fail 51 git', e.message);
  }
}

// Catalogue limité à 52 pour l’accueil
catalog.groups = catalog.groups
  .map((g) => {
    const items = g.items.filter((it) => {
      const n = parseInt(String(it.n), 10);
      return isNaN(n) || n <= maxN;
    });
    if (!items.length) return null;
    const nums = items.map((it) => parseInt(String(it.n), 10)).filter((n) => !isNaN(n));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return {
      ...g,
      label: g.label.replace(/\d+\s*à\s*\d+/, `${min} à ${max}`),
      items,
    };
  })
  .filter(Boolean);

catalog.stats = { articlesNumbered: maxN, withFeatured: !!catalog.featured };

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log(`Done: ${ok} files, ${fail} failed → ${pagesDir}`);
