/**
 * Injecte balises Open Graph / Twitter sur les pages articles (aperçu Facebook riche).
 * Usage: node scripts/inject-og-social.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://socrate83.github.io/premieres-nations-quebec';

function metaContent(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i');
  const m2 = html.match(re2);
  return m2 ? m2[1] : '';
}

function firstArticleImage(html) {
  const m = html.match(/src=["']images\/articles\/([^"']+)["']/i);
  return m ? `images/articles/${m[1]}` : '';
}

function stripOg(html) {
  return html.replace(/\s*<meta property="og:[^"]+"[^>]*>\s*/gi, '')
    .replace(/\s*<meta name="twitter:(?!site)[^"]+"[^>]*>\s*/gi, '');
}

let n = 0;
for (const name of fs.readdirSync(root)) {
  if (!name.endsWith('.html')) continue;
  const fp = path.join(root, name);
  let html = fs.readFileSync(fp, 'utf8');
  const isArticle = html.includes('pn-article-root') || html.includes('article-ecoute');
  const isLanding = ['Carnets.html', 'Articles.html', 'Home.html'].includes(name);
  if (!isArticle && !isLanding) continue;

  const title = (html.match(/<title>([^<]*)<\/title>/i) || ['', name])[1].trim();
  const desc = metaContent(html, 'description') || title;
  const img = firstArticleImage(html);
  const imgAbs = img ? `${BASE}/${img}` : `${BASE}/images/articles/78-friction-feu.png`;
  const url = `${BASE}/${name}`;

  html = stripOg(html);
  const block = `
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
  <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${imgAbs}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}">
  <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="${imgAbs}">`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${block}\n</head>`);
    fs.writeFileSync(fp, html, 'utf8');
    n += 1;
    console.log('og:', name);
  }
}
console.log('Terminé —', n, 'pages.');
