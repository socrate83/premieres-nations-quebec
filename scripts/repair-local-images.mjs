#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const assetDir = path.join(root, 'assets', 'images');
const assets = new Set(fs.readdirSync(assetDir));
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
}
walk(root);
let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(
    /https:\/\/media\.base44\.com\/images\/public\/[^"'\\s)]+\/([^"'\\s)]+\.(?:png|jpg|jpeg|webp|gif))/gi,
    (url, filename) => assets.has(filename) ? `assets/images/${filename}` : url
  );
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
  }
}
console.log(`Images locales appliquées dans ${changed} page(s).`);
