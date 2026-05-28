/**
 * Copie pages/*.html vers la racine du dépôt (chemins adaptés pour GitHub Pages).
 * Nécessaire quand Pages déploie la branche main / racine sans passer par _site.
 * Usage: node scripts/mirror-pages-to-root.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(root, 'pages');

function fixHtml(html) {
  return html
    .replace(/\.\.\/assets\//g, 'assets/')
    .replace(/href=["']\.\.\/style\.css["']/gi, 'href="style.css"')
    .replace(/src=["']\.\.\/audio-player\.js["']/gi, 'src="audio-player.js"')
    .replace(/href=["']\.\.\/Home\.html/gi, 'href="Home.html')
    .replace(/href=["']\.\.\/Articles\.html/gi, 'href="Articles.html');
}

const skipIfRootArticle = /^article(5[2-9]|[6-7]\d|72)\.html$/i;

let n = 0;
for (const name of fs.readdirSync(pagesDir)) {
  if (!name.endsWith('.html')) continue;
  if (skipIfRootArticle.test(name) && fs.existsSync(path.join(root, name))) continue;
  const html = fixHtml(fs.readFileSync(path.join(pagesDir, name), 'utf8'));
  fs.writeFileSync(path.join(root, name), html, 'utf8');
  n++;
}

const jsonSrc = path.join(pagesDir, 'blog-serie-articles.json');
const json = JSON.parse(fs.readFileSync(jsonSrc, 'utf8'));
json.baseUrl = '';
fs.writeFileSync(path.join(root, 'blog-serie-articles.json'), JSON.stringify(json, null, 2) + '\n', 'utf8');
fs.writeFileSync(jsonSrc, JSON.stringify(json, null, 2) + '\n', 'utf8');

console.log(`Mirroring terminé : ${n} fichiers HTML à la racine + blog-serie-articles.json (baseUrl vide).`);
