/**
 * Extrait la structure des pages nations (pour locales/nations.json).
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

function idFromFile(f) {
  return f.replace('.html', '').toLowerCase();
}

const out = { nations: [] };

for (const file of FILES) {
  const fp = path.join(root, file);
  if (!fs.existsSync(fp)) continue;
  const html = fs.readFileSync(fp, 'utf8');
  const id = idFromFile(file);
  const titleM = html.match(/<title>([^<]+)<\/title>/i);
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const heroSub = html.match(/class="hero-tagline"[^>]*>([^<]+)</i) ||
    html.match(/class="hero-sub"[^>]*>([^<]+)</i);
  const heroNation = html.match(/class="hero-subtitle"[^>]*>([^<]+)</i) ||
    html.match(/class="hero-nation"[^>]*>([^<]+)</i);

  const navLinks = [...html.matchAll(/<nav class="(?:nav-chapitres|nav)"[^>]*>[\s\S]*?<\/nav>/gi)];
  const navA = navLinks[0]
    ? [...navLinks[0][0].matchAll(/<a[^>]+href="[^"]*"[^>]*>([^<]+)<\/a>/gi)].map((m) => m[1].trim())
    : [];

  const sections = [];
  const secBlocks = [...html.matchAll(
    /<section[^>]*class="[^"]*section[^"]*"[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/section>/gi
  )];
  for (const m of secBlocks) {
    const block = m[0];
    const sid = m[1];
    const labelM = block.match(/class="(?:section-label|sec-label)"[^>]*>([^<]+)</i);
    const titleM = block.match(/<h2[^>]*>([^<]+)<\/h2>/i);
    sections.push({
      id: sid,
      label: labelM ? labelM[1].trim() : '',
      title: titleM ? titleM[1].trim() : '',
    });
  }

  const introM = html.match(/class="intro-card"[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  out.nations.push({
    id,
    file,
    metaTitle: titleM ? titleM[1].trim() : '',
    heroNation: heroNation ? heroNation[1].trim() : '',
    heroTitle: h1M ? h1M[1].replace(/<[^>]+>/g, '').trim() : '',
    heroTagline: heroSub ? heroSub[1].trim() : '',
    nav: navA,
    sections,
    introHtml: introM ? introM[1].replace(/\s+/g, ' ').trim().slice(0, 500) : '',
  });
}

fs.writeFileSync(path.join(root, 'locales', 'nations-structure-fr.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('Extracted', out.nations.length, 'nations → locales/nations-structure-fr.json');
