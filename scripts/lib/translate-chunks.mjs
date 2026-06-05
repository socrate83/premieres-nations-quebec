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

const HEADING_RE = /<(h[2-4])([^>]*)>([^<]+)<\/\1>/gi;
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

function rebuildOpenClose(raw, translated) {
  const open = raw.slice(0, raw.indexOf('>') + 1);
  const close = raw.slice(raw.lastIndexOf('<'));
  return open + translated + close;
}

export async function translateHtml(html, target, opts = {}) {
  const delay = opts.delayMs ?? 120;
  if (!html || html.length < 20) return html;

  const jobs = [
    ...collectMatches(html, HEADING_RE, 3).map((j) => ({ ...j, kind: 'heading' })),
    ...collectMatches(html, DIV_LABEL_RE, 2).map((j) => ({ ...j, kind: 'div' })),
    ...collectMatches(html, P_CAP_RE, 2).map((j) => ({ ...j, kind: 'p-cap' })),
    ...collectMatches(html, LI_RE, 2, { allowInlineTags: true }).map((j) => ({ ...j, kind: 'li' })),
    ...collectMatches(html, P_RE, 2, { allowInlineTags: true, skipBlockNesting: true }).map((j) => ({
      ...j,
      kind: 'p',
    })),
    ...collectMatches(html, BLOCKQUOTE_RE, 2).map((j) => ({ ...j, kind: 'blockquote' })),
    ...collectMatches(html, STRONG_RE, 1).map((j) => ({ ...j, kind: 'strong' })),
  ];

  jobs.sort((a, b) => b.index - a.index);

  let result = html;
  for (const job of jobs) {
    const tt = await googleTranslate(job.plain, target);
    let repl;
    if (job.kind === 'heading') repl = `<${job.parts[1]}${job.parts[2]}>${tt}</${job.parts[1]}>`;
    else if (job.kind === 'div' || job.kind === 'p-cap') repl = rebuildOpenClose(job.raw, tt);
    else if (job.kind === 'p') repl = `<p${job.parts[1]}>${tt}</p>`;
    else if (job.kind === 'li') repl = `<li${job.parts[1]}>${tt}</li>`;
    else if (job.kind === 'blockquote') repl = `<blockquote${job.parts[1]}>${tt}</blockquote>`;
    else if (job.kind === 'strong') repl = `<strong>${tt}</strong>`;
    else repl = tt;
    result = result.slice(0, job.index) + repl + result.slice(job.index + job.len);
    await sleep(delay);
  }

  return result;
}
