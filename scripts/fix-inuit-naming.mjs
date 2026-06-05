/**
 * Corrige Inuit / Inuit (pas de « s ») sur tout le site.
 * Préserve : Inuits.html (URL fichier), id technique inuit, liens gouvernementaux.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'repo_push']);
const SKIP_FILES = new Set(['scripts/fix-inuit-naming.mjs']);
const EXT = new Set(['.html', '.json', '.jsx', '.js', '.mjs', '.md', '.xml', '.txt']);

const GUARD = [];
function guard(re, text) {
  return text.replace(re, (m) => {
    const k = `__PN_GUARD_${GUARD.length}__`;
    GUARD.push(m);
    return k;
  });
}

function unguard(text) {
  let out = text;
  GUARD.forEach((m, i) => {
    out = out.split(`__PN_GUARD_${i}__`).join(m);
  });
  return out;
}

function fixText(raw) {
  GUARD.length = 0;
  let t = raw;
  // Protéger AVANT tout remplacement (Inuits.html contient le mot « Inuits »)
  t = guard(/Inuits\.html/gi, t);
  t = guard(/Inuits\.jsx/gi, t);
  t = guard(/data-pn-nation-id=["']inuit["']/gi, t);
  t = guard(/data-pn-nation=["']inuit["']/gi, t);
  t = guard(/id:\s*['"]inuit['"]/g, t);
  t = guard(/premieres-nations-inuits/gi, t);

  t = t.replace(/\bInuits\b/g, 'Inuit');
  t = t.replace(/\binuits\b/g, 'inuit');
  t = t.replace(/\binuites\b/gi, 'inuit');
  t = t.replace(/\binuite\b/gi, 'inuit');

  t = t.replace(/\bLes Inuit today\b/g, 'The Inuit today');
  t = t.replace(/\bLes Inuit hoy\b/g, 'Los Inuit hoy');
  t = t.replace(/\bThe Inuits\b/g, 'The Inuit');
  t = t.replace(/\bLos Inuits\b/g, 'Los Inuit');

  return unguard(t);
}

function walk(dir, changed) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const fp = path.join(dir, name);
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    if (SKIP_FILES.has(rel)) continue;
    const st = fs.statSync(fp);
    if (st.isDirectory()) {
      walk(fp, changed);
      continue;
    }
    const ext = path.extname(name).toLowerCase();
    if (!EXT.has(ext)) continue;
    const raw = fs.readFileSync(fp, 'utf8');
    const next = fixText(raw);
    if (next !== raw) {
      fs.writeFileSync(fp, next, 'utf8');
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
if (changed.length) {
  console.log('Corrigé dans', changed.length, 'fichiers :');
  changed.forEach((f) => console.log(' ', f));
} else {
  console.log('Aucune correction supplémentaire nécessaire.');
}
