import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales', 'nations-bodies');
for (const f of fs.readdirSync(dir)) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const en = j.en.html;
  console.log(
    f.replace('.json', ''),
    'section-header:', en.includes('section-header'),
    'sec-label:', en.includes('sec-label'),
    'intro-card:', en.includes('intro-card'),
    'broken:', /intro-wrap">[^<]+<\/div>/.test(en) || en.includes('[object Promise]')
  );
}
