#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const assetDir = path.join(root, 'assets', 'images');
const assets = new Set(
  fs
    .readdirSync(assetDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
);
const imageUrlPattern =
  /https:\/\/media\.base44\.com\/images\/public\/[^"'\\s)]+\/([^"'\\s)]+\.(?:png|jpg|jpeg|webp|gif))/gi;
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html') || entry.name.endsWith('.jsx')) files.push(full);
  }
}

function addTarget(target) {
  const full = path.resolve(root, target);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    walk(full);
    return;
  }
  if (full.endsWith('.html') || full.endsWith('.jsx')) files.push(full);
}

const targets = process.argv.slice(2);
if (targets.length > 0) {
  for (const target of targets) addTarget(target);
} else {
  walk(root);
}

function buildLocalImagePath(file, filename) {
  return `${path.relative(path.dirname(file), assetDir).split(path.sep).join('/')}/${filename}`;
}

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(
    imageUrlPattern,
    (url, filename) => (assets.has(filename) ? buildLocalImagePath(file, filename) : url)
  );
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log(path.relative(root, file));
  }
}
console.log(`Images locales appliquées dans ${changed} page(s).`);
