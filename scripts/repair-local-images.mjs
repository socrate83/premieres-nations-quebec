#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://socrate83.github.io/premieres-nations-quebec';
const assetDir = path.join(root, 'assets', 'images');
const textExtensions = new Set(['.html', '.jsx', '.json']);
const files = [];
const assets = new Set();
const pageMap = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
}

function collectAssets(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectAssets(full, rel);
    else assets.add(rel);
  }
}

function buildPageMap() {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const basename = entry.name.replace(/\.html$/i, '');
    pageMap.set(basename.toLowerCase(), entry.name);
    if (basename.endsWith('s')) pageMap.set(basename.slice(0, -1).toLowerCase(), entry.name);
  }
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapLines(text, maxLength = 26) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return ['Illustration locale'];
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function pickPalette(seed) {
  const palettes = [
    ['#1f4037', '#99f2c8'],
    ['#603813', '#b29f94'],
    ['#355c7d', '#6c5b7b'],
    ['#283c86', '#45a247'],
    ['#42275a', '#734b6d']
  ];
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palettes[total % palettes.length];
}

function createFallbackSvg(fileName, label) {
  const fallbackName = fileName.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '.svg');
  const relPath = path.posix.join('base44-fallbacks', fallbackName);
  const fullPath = path.join(assetDir, relPath);
  if (assets.has(relPath)) return relPath;
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  const [start, end] = pickPalette(fileName);
  const safeLabel = label || 'Illustration locale';
  const lines = wrapLines(safeLabel);
  const yStart = 210 - ((lines.length - 1) * 28) / 2;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(safeLabel)}</title>
  <desc id="desc">Illustration locale de remplacement pour supprimer la dépendance Base44.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${start}"/>
      <stop offset="100%" stop-color="${end}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="155" cy="128" r="56" fill="rgba(255,255,255,0.18)"/>
  <path d="M165 70c38 70 39 122 0 176-38-54-38-106 0-176Z" fill="rgba(255,255,255,0.42)"/>
  <text x="110" y="570" font-size="28" fill="rgba(255,255,255,0.78)" font-family="Georgia, serif">Premières Nations du Québec</text>
  ${lines.map((line, index) => `<text x="600" y="${yStart + index * 56}" text-anchor="middle" font-size="44" font-weight="700" fill="#ffffff" font-family="Georgia, serif">${escapeXml(line)}</text>`).join('\n  ')}
  <text x="600" y="510" text-anchor="middle" font-size="22" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif">Illustration locale de remplacement</text>
</svg>
`;
  fs.writeFileSync(fullPath, svg, 'utf8');
  assets.add(relPath);
  return relPath;
}

function assetPathForFile(file, assetRelativePath) {
  if (file.endsWith('.json')) {
    return path.posix.join('assets', 'images', assetRelativePath.replaceAll('\\', '/'));
  }
  return path.posix.relative(
    path.dirname(file).replaceAll('\\', '/'),
    path.join(assetDir, assetRelativePath).replaceAll('\\', '/')
  );
}

function extractLabel(content, index) {
  const windowStart = Math.max(0, index - 220);
  const windowEnd = Math.min(content.length, index + 220);
  const snippet = content.slice(windowStart, windowEnd);
  const patterns = [
    /alt=(?:"([^"]+)"|\\?"([^"]+)\\?")/gi,
    /content=(?:"([^"]+)"|\\?"([^"]+)\\?")/gi
  ];
  for (const pattern of patterns) {
    const matches = [...snippet.matchAll(pattern)];
    if (matches.length) {
      const value = matches.at(-1)[1] || matches.at(-1)[2];
      if (value) {
        return value
          .replace(/\\"/g, '"')
          .replace(/\\+$/g, '')
          .trim();
      }
    }
  }
  return 'Illustration Premières Nations du Québec';
}

function resolveLocalAsset(file, assetUrl, index, original) {
  const normalized = assetUrl.replaceAll('\\', '/');
  const localRelative = normalized
    .replace(/^\.\//, '')
    .replace(/^\.\.\//, '')
    .replace(/^assets\/images\//, '');
  const assetFullPath = path.join(assetDir, localRelative);
  if (fs.existsSync(assetFullPath)) return assetUrl;
  const label = extractLabel(original, index);
  if (assets.has(localRelative)) {
    return assetPathForFile(file, localRelative);
  }
  const fallbackAsset = createFallbackSvg(path.posix.basename(localRelative), label);
  return assetPathForFile(file, fallbackAsset);
}

function replaceSiteUrl(url) {
  const matched = url.match(/^https:\/\/lucie-app-[^.]+\.base44\.app(?:\/([^"'&\s?#]+))?/i);
  const slug = matched?.[1];
  if (!slug) return `${siteBase}/`;
  const normalized = slug.replace(/\.html$/i, '').toLowerCase();
  const htmlFile = pageMap.get(normalized);
  return htmlFile ? `${siteBase}/${htmlFile}` : `${siteBase}/${slug}`;
}

walk(root);
collectAssets(assetDir);
buildPageMap();

let changed = 0;
let localReplacements = 0;
let fallbackReplacements = 0;
let siteReplacements = 0;
let brokenLocalReplacements = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original.replace(
    /https:\/\/media\.base44\.com\/images\/public\/[^"'\\\s)]+\/([^"'\\\s)]+\.(?:png|jpg|jpeg|webp|gif))/gi,
    (url, fileName, index) => {
      const label = extractLabel(original, index);
      if (assets.has(fileName)) {
        localReplacements++;
        return assetPathForFile(file, fileName);
      }
      const fallbackAsset = createFallbackSvg(fileName, label);
      fallbackReplacements++;
      return assetPathForFile(file, fallbackAsset);
    }
  );

  updated = updated.replace(
    /((?:\.\.\/)?assets\/images\/[^"'\\\s)]+\.(?:png|jpg|jpeg|webp|gif|svg))/gi,
    (assetUrl, _unused, index) => {
      const resolved = resolveLocalAsset(file, assetUrl, index, original);
      if (resolved !== assetUrl) {
        brokenLocalReplacements++;
      }
      return resolved;
    }
  );

  updated = updated.replace(/https:\/\/lucie-app-[^.]+\.base44\.app(?:\/[^"'&\s?#]+)?/gi, (url) => {
    siteReplacements++;
    return replaceSiteUrl(url);
  });

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
  }
}

console.log([
  `Fichiers modifiés: ${changed}`,
  `Images locales réutilisées: ${localReplacements}`,
  `Fallbacks SVG générés: ${fallbackReplacements}`,
  `Chemins locaux cassés réparés: ${brokenLocalReplacements}`,
  `Liens Base44 remplacés: ${siteReplacements}`
].join('\n'));
