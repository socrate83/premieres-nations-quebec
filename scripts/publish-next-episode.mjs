#!/usr/bin/env node
/**
 * Publie les parties en file d'attente dont la date est atteinte.
 * Voir episodes-queue/episodes-queue.json et .github/workflows/publish-episodes.yml
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'episodes-queue', 'episodes-queue.json');

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) {
    console.log('Aucun manifest episodes-queue — rien à publier.');
    return null;
  }
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}

function saveManifest(data) {
  fs.writeFileSync(MANIFEST, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function publishPart(part) {
  const queuePath = path.join(ROOT, part.queue_file);
  const destPath = path.join(ROOT, part.file);
  if (!fs.existsSync(queuePath)) {
    throw new Error(`Fichier manquant : ${part.queue_file}`);
  }
  fs.copyFileSync(queuePath, destPath);
  console.log(`Publié : ${part.file}`);

  if (part.image) {
    const srcImg = path.join(ROOT, 'episodes-queue', 'images', part.image);
    const destImg = path.join(ROOT, 'images', 'articles', part.image);
    if (fs.existsSync(srcImg)) {
      fs.mkdirSync(path.dirname(destImg), { recursive: true });
      fs.copyFileSync(srcImg, destImg);
      console.log(`Image : ${part.image}`);
    }
  }

  part.status = 'published';
  part.published_on = todayIso();
}

function main() {
  const data = loadManifest();
  if (!data) return;

  const today = todayIso();
  const published = [];

  for (const series of data.series || []) {
    const queued = (series.parts || [])
      .filter((p) => p.status === 'queued' && p.publish_date <= today)
      .sort((a, b) => a.part - b.part);

    for (const part of queued) {
      publishPart(part);
      published.push(part.file);
      if (part.image) published.push(`images/articles/${part.image}`);
    }
  }

  if (!published.length) {
    console.log(`Aucune partie à publier (${today}).`);
    return;
  }

  saveManifest(data);

  try {
    execSync('python scripts/build-sitemap.py', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.warn('build-sitemap.py ignoré');
  }

  if (process.env.GITHUB_ACTIONS !== 'true') {
    console.log('Hors CI — fichiers écrits localement :', published.join(', '));
    return;
  }

  const toAdd = [...new Set(['episodes-queue/episodes-queue.json', 'sitemap.xml', ...published])];
  execSync(`git add ${toAdd.map((f) => JSON.stringify(f)).join(' ')}`, { cwd: ROOT });
  try {
    execSync('git diff --cached --quiet', { cwd: ROOT, stdio: 'pipe' });
    console.log('Aucun changement git.');
    return;
  } catch {
    // staged changes exist
  }
  const msg = `Publication auto #79 : ${published.filter((f) => f.endsWith('.html')).join(', ')}`;
  execSync(`git commit -m ${JSON.stringify(msg)}`, { cwd: ROOT, stdio: 'inherit' });
  execSync('git push', { cwd: ROOT, stdio: 'inherit' });
}

main();
