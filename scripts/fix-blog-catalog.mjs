import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = execSync('git show f47f7ea:pages/blog-serie-articles.json', {
  cwd: root,
  encoding: 'utf8',
});
const catalog = JSON.parse(raw);
const maxN = 52;

catalog.baseUrl = '';
catalog.introNote =
  'Série thématique sur les Premières Nations (thèmes nord-américains et canadiens). Chaque carte ouvre l’article complet sur ce site.';

catalog.groups = catalog.groups
  .map((g) => {
    const items = g.items.filter((it) => {
      const n = parseInt(String(it.n), 10);
      return isNaN(n) || n <= maxN;
    });
    if (!items.length) return null;
    const nums = items.map((it) => parseInt(String(it.n), 10)).filter((n) => !isNaN(n));
    const label =
      nums.length > 0
        ? g.label.replace(/\d+\s*à\s*\d+/, `${Math.min(...nums)} à ${Math.max(...nums)}`)
        : g.label;
    return { ...g, label, items };
  })
  .filter(Boolean);

catalog.stats = { articlesNumbered: maxN, withFeatured: !!catalog.featured };

const out = path.join(root, 'pages', 'blog-serie-articles.json');
fs.writeFileSync(out, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
console.log('Wrote', out, '— article 42:', catalog.groups[4].items.find((x) => x.n === '42')?.file);
