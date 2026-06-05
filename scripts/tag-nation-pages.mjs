/**
 * data-pn-nation sur les 11 pages + script nation-i18n.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = {
  'Abenaquis.html': 'abenaquis',
  'Algonquins.html': 'algonquins',
  'Atikamekw.html': 'atikamekw',
  'Cris.html': 'cris',
  'HuronsWendat.html': 'huronswendat',
  'Innus.html': 'innus',
  'Malecites.html': 'malecites',
  'Micmacs.html': 'micmacs',
  'Mohawks.html': 'mohawks',
  'Naskapis.html': 'naskapis',
  'Inuits.html': 'inuit',
};

const NATION_SCRIPT =
  '  <script src="nation-i18n.js" defer></script>\n';

for (const [file, id] of Object.entries(FILES)) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    console.warn('skip', file);
    continue;
  }
  let html = fs.readFileSync(fp, 'utf8');
  if (!html.includes('data-pn-nation=')) {
    html = html.replace(/<body([^>]*)>/i, `<body$1 data-pn-nation="${id}">`);
  }
  if (!html.includes('nation-i18n.js')) {
    html = html.replace(
      /<script src="lang-switcher\.js" defer><\/script>/i,
      '<script src="nation-i18n.js" defer></script>\n  <script src="lang-switcher.js" defer></script>'
    );
  } else {
    html = html.replace(
      /<script src="lang-switcher\.js" defer><\/script>\s*<script src="nation-i18n\.js" defer><\/script>/i,
      '<script src="nation-i18n.js" defer></script>\n  <script src="lang-switcher.js" defer></script>'
    );
  }
  fs.writeFileSync(fp, html, 'utf8');
  console.log('tagged', file, id);
}
