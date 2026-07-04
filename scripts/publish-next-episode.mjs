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
  part.i18n_status = 'pending';
}

function translatePublishedParts(parts) {
  const slugs = parts
    .filter((p) => p.i18n_status === 'pending' || p.i18n_status === undefined)
    .map((p) => p.file.replace(/\.html$/i, ''));
  return runTranslations(slugs, parts);
}

function translateMissingLocales(data) {
  const slugs = [];
  const parts = [];
  for (const series of data.series || []) {
    for (const part of series.parts || []) {
      if (part.status !== 'published' || part.i18n_status === 'done') continue;
      const slug = part.file.replace(/\.html$/i, '');
      const jsonPath = path.join(ROOT, 'locales', 'articles', `${slug}.json`);
      if (!fs.existsSync(jsonPath)) {
        slugs.push(slug);
        parts.push(part);
      }
    }
  }
  return runTranslations(slugs, parts);
}

function runTranslations(slugs, parts) {
  if (!slugs.length) return [];
  console.log('Traduction EN+ES :', slugs.join(', '));
  execSync(`python scripts/build-episode-part-i18n.py --only ${slugs.join(',')}`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  for (const p of parts) {
    p.i18n_status = 'done';
    p.i18n_on = todayIso();
  }
  return slugs.map((s) => `locales/articles/${s}.json`);
}

function gitCommitPush(message, extraFiles = []) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;
  const toAdd = [...new Set(extraFiles)];
  if (!toAdd.length) return;
  execSync(`git add ${toAdd.map((f) => JSON.stringify(f)).join(' ')}`, { cwd: ROOT });
  try {
    execSync('git diff --cached --quiet', { cwd: ROOT, stdio: 'pipe' });
    console.log('Aucun changement git.');
    return;
  } catch {
    execSync(`git commit -m ${JSON.stringify(message)}`, { cwd: ROOT, stdio: 'inherit' });
    execSync('git push', { cwd: ROOT, stdio: 'inherit' });
  }
}

function main() {
  const data = loadManifest();
  if (!data) return;

  const today = todayIso();
  const published = [];
  const publishedParts = [];

  for (const series of data.series || []) {
    const queued = (series.parts || [])
      .filter((p) => p.status === 'queued' && p.publish_date <= today)
      .sort((a, b) => a.part - b.part);

    for (const part of queued) {
      publishPart(part);
      published.push(part.file);
      publishedParts.push(part);
      if (part.image) published.push(`images/articles/${part.image}`);
    }
  }

  if (!published.length) {
    let localeFiles = [];
    try {
      localeFiles = translateMissingLocales(data);
      if (localeFiles.length) {
        saveManifest(data);
        gitCommitPush('Traduction auto #79 (rattrapage)', [
          'episodes-queue/episodes-queue.json',
          'locales/blog-serie-i18n.json',
          ...localeFiles,
        ]);
      }
    } catch (err) {
      console.error('Rattrapage traduction :', err.message);
    }
    if (!localeFiles.length) {
      console.log(`Aucune partie à publier (${today}).`);
    }
    return;
  }

  let localeFiles = [];
  try {
    localeFiles = translatePublishedParts(publishedParts);
    localeFiles = [...localeFiles, ...translateMissingLocales(data)];
  } catch (err) {
    console.error('Traduction échouée (partie publiée quand même) :', err.message);
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

  gitCommitPush(
    `Publication auto #79 : ${published.filter((f) => f.endsWith('.html')).join(', ')} (+ EN/ES)`,
    [
      'episodes-queue/episodes-queue.json',
      'sitemap.xml',
      'locales/blog-serie-i18n.json',
      ...published,
      ...localeFiles,
    ],
  );
}

main();
