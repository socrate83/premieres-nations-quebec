/**
 * Traduction FR → EN/ES — préserve la structure HTML des pages nations.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function splitPlain(text, max = 4200) {
  if (text.length <= max) return [text];
  const parts = [];
  let rest = text.trim();
  while (rest.length) {
    if (rest.length <= max) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf('. ', max);
    if (cut < 100) cut = rest.lastIndexOf(' ', max);
    if (cut < 100) cut = max;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  return parts;
}

async function googleTranslate(text, target) {
  const tl = target === 'es' ? 'es' : 'en';
  const parts = splitPlain(text);
  const out = [];
  for (const p of parts) {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=' +
      tl +
      '&dt=t&q=' +
      encodeURIComponent(p);
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) {
      out.push(p);
      continue;
    }
    const data = await r.json();
    const tr = (data[0] || []).map((x) => x[0]).join('');
    out.push(tr || p);
    await sleep(180);
  }
  return out.join(' ');
}

export async function translateText(text, target) {
  if (!text || !text.trim()) return text;
  return googleTranslate(text, target);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasBlockNesting(inner) {
  return /<(p|div|h[1-6]|ul|ol|li|table|section|article|blockquote)\b/i.test(inner);
}

const DIV_LABEL_RE =
  /<div class="(?:sec-label|section-label|intro-kword|kword|stat-n|stat-l|stat-number|stat-label|tl-dot|card-icon|timeline-dot|timeline-year|timeline-content)"([^>]*)>([^<]*)<\/div>/gi;

const P_CAP_RE =
  /<p class="(?:img-cap|img-caption|quote-src|quote-source)"([^>]*)>([^<]*)<\/p>/gi;

const HEADING_RE = /<(h[1-4])([^>]*)>([^<]+)<\/\1>/gi;
const STRONG_RE = /<strong>([^<]+)<\/strong>/gi;
const LI_RE = /<li([^>]*)>([\s\S]*?)<\/li>/gi;
const P_RE = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
const BLOCKQUOTE_RE = /<blockquote([^>]*)>([^<]+)<\/blockquote>/gi;

function collectMatches(html, re, groupIdx, opts = {}) {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    const inner = m[groupIdx];
    if (opts.skipBlockNesting && hasBlockNesting(inner)) continue;
    const plain = opts.allowInlineTags ? stripTags(inner) : inner.trim();
    if (plain.length < 2) continue;
    out.push({ index: m.index, len: m[0].length, plain, raw: m[0], parts: m });
  }
  return out;
}

/**
 * Traduit le contenu interne d'un bloc en PRÉSERVANT les balises inline
 * (<strong>, <a>, <em>, <br>…). On découpe sur les balises et on ne traduit
 * que les segments de texte : aucune balise n'est jamais cassée ni réordonnée.
 */
async function translateInline(inner, target) {
  if (!inner || !inner.trim()) return inner;
  if (inner.indexOf('<') === -1) {
    return await googleTranslate(inner, target);
  }
  const tokens = inner.split(/(<[^>]+>)/g);
  const out = [];
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok[0] === '<' || !tok.trim()) {
      out.push(tok);
      continue;
    }
    // Préserver les espaces de début/fin (Google les rogne) pour ne pas
    // coller le texte aux balises inline voisines (<strong>, <a>…).
    const lead = tok.match(/^\s*/)[0];
    const trail = tok.match(/\s*$/)[0];
    const core = tok.slice(lead.length, tok.length - trail.length);
    out.push(lead + (await googleTranslate(core, target)) + trail);
  }
  return out.join('');
}

export async function translateHtml(html, target, opts = {}) {
  const delay = opts.delayMs ?? 120;
  if (!html || html.length < 20) return html;

  const collectors = [
    [HEADING_RE, 3, {}],
    [DIV_LABEL_RE, 2, {}],
    [P_CAP_RE, 2, {}],
    [LI_RE, 2, { allowInlineTags: true }],
    [P_RE, 2, { allowInlineTags: true, skipBlockNesting: true }],
    [BLOCKQUOTE_RE, 2, {}],
    // Les <strong> autonomes (hors <p>/<li>) : ceux imbriqués dans un bloc
    // déjà collecté seront écartés par le filtre anti-chevauchement ci-dessous.
    [STRONG_RE, 1, {}],
  ];

  let jobs = [];
  for (const [re, gi, o] of collectors) {
    jobs = jobs.concat(collectMatches(html, re, gi, o));
  }

  // Éliminer les chevauchements : on garde le bloc le plus externe / le premier.
  jobs.sort((a, b) => a.index - b.index || b.len - a.len);
  const kept = [];
  let lastEnd = -1;
  for (const j of jobs) {
    if (j.index >= lastEnd) {
      kept.push(j);
      lastEnd = j.index + j.len;
    }
  }

  // Appliquer de la fin vers le début pour que les index restent valides.
  kept.sort((a, b) => b.index - a.index);

  let result = html;
  for (const job of kept) {
    const raw = job.raw;
    const open = raw.slice(0, raw.indexOf('>') + 1);
    const close = raw.slice(raw.lastIndexOf('<'));
    const inner = raw.slice(open.length, raw.length - close.length);
    const repl = open + (await translateInline(inner, target)) + close;
    result = result.slice(0, job.index) + repl + result.slice(job.index + job.len);
    await sleep(delay);
  }

  return result;
}
