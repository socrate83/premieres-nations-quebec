/**
 * Rapport : nations avec tail traduit, pages racine sans lang-switcher.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const NATIONS = [
  ['Abenaquis.html', 'abenaquis'],
  ['Algonquins.html', 'algonquins'],
  ['Atikamekw.html', 'atikamekw'],
  ['Cris.html', 'cris'],
  ['HuronsWendat.html', 'huronswendat'],
  ['Innus.html', 'innus'],
  ['Malecites.html', 'malecites'],
  ['Micmacs.html', 'micmacs'],
  ['Mohawks.html', 'mohawks'],
  ['Naskapis.html', 'naskapis'],
  ['Inuits.html', 'inuit'],
];

console.log('=== Nations (corps + pied de page) ===');
for (const [file, id] of NATIONS) {
  const h = fs.readFileSync(path.join(root, file), 'utf8');
  const jp = path.join(root, 'locales', 'nations-bodies', id + '.json');
  let tailJson = false;
  let tailLen = 0;
  if (fs.existsSync(jp)) {
    const j = JSON.parse(fs.readFileSync(jp, 'utf8'));
    tailJson = !!(j.en && j.en.tail);
    tailLen = j.en?.tail?.length || 0;
  }
  console.log(
    file.padEnd(18),
    '| tail HTML:', String(h.includes('pn-nation-tail')).padEnd(5),
    '| tail JSON:', String(tailJson).padEnd(5),
    '| tail EN chars:', tailLen
  );
}

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const noSwitcher = htmlFiles.filter((f) => {
  if (f === 'index.html') return false;
  const h = fs.readFileSync(path.join(root, f), 'utf8');
  return !h.includes('lang-switcher.js');
});
console.log('\n=== Pages racine sans lang-switcher ===');
console.log(noSwitcher.length ? noSwitcher.join('\n') : '(aucune)');
