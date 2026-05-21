import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const nav = '<div class="nav-art"';

for (const f of fs.readdirSync(root)) {
  if (!/^article\d+\.html$/i.test(f)) continue;
  let h = fs.readFileSync(path.join(root, f), 'utf8');
  const i = h.indexOf(nav);
  const open = h.indexOf('<article class="article-ecoute">');
  const close = h.indexOf('</article>', i);
  if (i < 0 || open < 0 || close < i) continue;
  if (h.slice(open, i).includes('</article>')) {
    console.log('skip', f);
    continue;
  }
  h = h.slice(0, i) + '</article>\n\n' + h.slice(i, close) + h.slice(close + '</article>'.length);
  fs.writeFileSync(path.join(root, f), h);
  console.log('fixed', f);
}
