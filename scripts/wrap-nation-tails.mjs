/**
 * Enveloppe share-footer, légendes et footer dans #pn-nation-tail.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  'Abenaquis.html',
  'Algonquins.html',
  'Atikamekw.html',
  'Cris.html',
  'HuronsWendat.html',
  'Innus.html',
  'Malecites.html',
  'Micmacs.html',
  'Mohawks.html',
  'Naskapis.html',
  'Inuits.html',
];

const SHARE_I18N = {
  'btn-fb-big': 'nationShare.facebook',
  'btn-group-big': 'nationShare.groupFb',
  'btn-messenger-big': 'nationShare.messenger',
  'btn-whatsapp-big': 'nationShare.whatsapp',
  'btn-email-big': 'nationShare.email',
  'btn-copy-big': 'nationShare.copyLink',
};

for (const file of FILES) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('id="pn-nation-tail"')) {
    console.log('skip (déjà enveloppé)', file);
    continue;
  }

  const m = html.match(/<\/article>([\s\S]*?)(?=<script\b)/i);
  if (!m || !m[1].trim()) {
    console.warn('pas de queue après </article>', file);
    continue;
  }

  let tail = m[1].trim();
  for (const [cls, key] of Object.entries(SHARE_I18N)) {
    tail = tail.replace(
      new RegExp(`(<a class="${cls}"[^>]*)(>)`, 'g'),
      `$1 data-i18n="${key}"$2`
    );
    tail = tail.replace(
      new RegExp(`(<button class="${cls}"[^>]*)(>)`, 'g'),
      `$1 data-i18n="${key}"$2`
    );
  }
  tail = tail.replace(
    /(<div id="toast-share"[^>]*)(>)/,
    '$1 data-i18n="nationShare.linkCopied"$2'
  );
  tail = tail.replace(
    /<h2>Légendes, histoires et anecdotes<\/h2>/,
    '<h2 data-i18n="nationShare.legendesTitle">Légendes, histoires et anecdotes</h2>'
  );
  tail = tail.replace(
    /<h4>📢 Partager cet article<\/h4>/,
    '<h4 data-i18n="nationShare.title">📢 Partager cet article</h4>'
  );

  const wrapped = `\n<div id="pn-nation-tail">\n${tail}\n</div>\n`;
  html = html.replace(m[0], `</article>${wrapped}`);
  fs.writeFileSync(fp, html, 'utf8');
  console.log('tail enveloppé —', file);
}
