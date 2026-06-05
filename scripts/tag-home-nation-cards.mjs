/**
 * Ajoute data-i18n-nation / data-i18n-field sur les cartes accueil.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const fp = path.join(root, 'Home.html');
let html = fs.readFileSync(fp, 'utf8');

const fields = [
  { re: /(<div class="card-tag">)([^<]+)(<\/div>)/, field: 'tag' },
  { re: /(<h3>)([^<]+)(<\/h3>)/, field: 'name' },
  { re: /(<p class="card-desc">)([^<]+)(<\/p>)/, field: 'desc' },
];

html = html.replace(
  /<div class="nation-card" data-pn-nation-id="([^"]+)">([\s\S]*?)<\/div>\s*(?=\n\s*<!--|\n\s*<\/div>)/g,
  (block, id, inner) => {
    let out = inner;
    for (const { re, field } of fields) {
      out = out.replace(re, (m, a, text, c) => {
        if (out.includes(`data-i18n-field="${field}"`)) return m;
        const open = a.startsWith('<div')
          ? `<div class="card-tag" data-i18n-nation="${id}" data-i18n-field="${field}">`
          : a.startsWith('<h3')
            ? `<h3 data-i18n-nation="${id}" data-i18n-field="${field}">`
            : `<p class="card-desc" data-i18n-nation="${id}" data-i18n-field="${field}">`;
        return open + text + c;
      });
    }
    return `<div class="nation-card" data-pn-nation-id="${id}">${out}</div>`;
  }
);

fs.writeFileSync(fp, html, 'utf8');
console.log('Home.html — cartes nations balisées.');
