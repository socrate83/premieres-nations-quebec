/**
 * Restaure Abenaquis.html en UTF-8 depuis abenaquis.html (commit sain).
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const GOOD_COMMIT = '6ac3ded';

const good = execSync(`git show ${GOOD_COMMIT}:abenaquis.html`, {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
});

if (/Ab├®|ÔÇö|Ã©/.test(good)) {
  console.error('Source encore corrompue, abandon.');
  process.exit(1);
}

const targets = ['Abenaquis.html', 'abenaquis.html'];
for (const name of targets) {
  const p = path.join(root, name);
  fs.writeFileSync(p, good, 'utf8');
  console.log('OK:', name);
}

console.log('Terminé — lancez: git add Abenaquis.html abenaquis.html && git commit');
