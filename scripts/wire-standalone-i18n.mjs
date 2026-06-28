/**
 * Câble des pages "autonomes" (hors catalogue) pour la traduction d'article :
 *  - injecte article-i18n.js dans <head> (avant lang-switcher.js) ;
 *  - enveloppe l'unique <article class="article-ecoute">…</article> dans
 *    <div id="pn-article-root" data-pn-article-slug="SLUG">…</div>.
 * Idempotent. Le slug = nom de fichier sans .html.
 *
 * Usage: node scripts/wire-standalone-i18n.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  '52-les-architectes-du-silence.html',
  'BijouxPremieresNations.html',
  'FemmesAutochtones.html',
  'FemmesAutochtones2.html',
  'LanguesAutochtones.html',
  'PensionnatsIndiens.html',
  // Partage.html exclu volontairement : page interactive (outil de partage),
  // remplacer son innerHTML au changement de langue casserait ses boutons/JS.
];

function injectArticleI18n(html) {
  if (html.includes('article-i18n.js')) return html;
  const tag = '  <script src="article-i18n.js" defer></script>\n';
  if (/<script src="[^"]*lang-switcher\.js" defer><\/script>/i.test(html)) {
    return html.replace(
      /(<script src="[^"]*lang-switcher\.js" defer><\/script>)/i,
      tag + '$1'
    );
  }
  return html.replace(/<\/head>/i, tag + '</head>');
}

function wrapRoot(html, slug) {
  if (html.includes('pn-article-root')) return html;
  const open = html.match(/<article class="article-ecoute"[^>]*>/i);
  if (!open) {
    console.warn('  (pas de <article class="article-ecoute"> dans', slug, ')');
    return html;
  }
  const closeCount = (html.match(/<\/article>/gi) || []).length;
  if (closeCount !== 1) {
    console.warn('  (', slug, ': nombre de </article> =', closeCount, '— enveloppement ignoré)');
    return html;
  }
  html = html.replace(
    open[0],
    `<div id="pn-article-root" data-pn-article-slug="${slug}">\n${open[0]}`
  );
  html = html.replace(/<\/article>/i, '</article>\n</div>');
  return html;
}

for (const file of FILES) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) {
    console.warn('absent:', file);
    continue;
  }
  const slug = file.replace(/\.html$/i, '');
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = injectArticleI18n(html);
  html = wrapRoot(html, slug);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('câblé:', file, '→ slug', slug);
  } else {
    console.log('déjà câblé:', file);
  }
}
