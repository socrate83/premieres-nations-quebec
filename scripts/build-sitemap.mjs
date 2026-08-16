/**
 * Régénère sitemap.xml — toutes les pages utiles pour le référencement.
 * Usage: node scripts/build-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://socrate83.github.io/premieres-nations-quebec';
const today = new Date().toISOString().slice(0, 10);

const STATIC = [
  { loc: 'Home.html', priority: '1.0', changefreq: 'weekly' },
  { loc: 'Carnets.html', priority: '0.95', changefreq: 'weekly' },
  { loc: 'Articles.html', priority: '0.95', changefreq: 'weekly' },
  { loc: 'Videos.html', priority: '0.7', changefreq: 'weekly' },
  { loc: 'Audio.html', priority: '0.7', changefreq: 'weekly' },
  { loc: 'famille-premieres-nations.html', priority: '0.85', changefreq: 'monthly' },
];

const NATIONS = [
  'Abenaquis', 'Algonquins', 'Atikamekw', 'Cris', 'HuronsWendat', 'Innus', 'Inuits',
  'Malecites', 'Micmacs', 'Mohawks', 'Naskapis',
].map((n) => ({ loc: `${n}.html`, priority: '0.85', changefreq: 'monthly' }));

function articleUrls() {
  const jsonPath = path.join(root, 'blog-serie-articles.json');
  const alt = path.join(root, 'pages', 'blog-serie-articles.json');
  const fp = fs.existsSync(jsonPath) ? jsonPath : alt;
  if (!fs.existsSync(fp)) return [];
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const files = new Set();
  for block of data.groups || data.series || []) {
    for (const item of block.items || []) {
      if (item.file && !item.file.startsWith('http')) files.add(item.file);
    }
  }
  return [...files].sort().map((f) => ({
    loc: f,
    priority: f.includes('76-') || f.includes('77-') || f.includes('78-') ? '0.9' : '0.75',
    changefreq: 'monthly',
  }));
}

function urlEntry({ loc, priority, changefreq }) {
  return `  <url>
    <loc>${BASE}/${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const all = [...STATIC, ...NATIONS, ...articleUrls()];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(urlEntry).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml — ${all.length} URLs`);
