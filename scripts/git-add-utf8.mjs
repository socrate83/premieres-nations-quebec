import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node git-add-utf8.mjs <fichier>');
  process.exit(1);
}

const content = fs.readFileSync(path.resolve(file), 'utf8');
const blob = execSync('git hash-object -w --stdin', { input: content }).toString().trim();
execSync(`git update-index --cacheinfo 100644,${blob},${file.replace(/\\/g, '/')}`);
console.log('Indexé UTF-8:', file, blob.slice(0, 8) + '…');
