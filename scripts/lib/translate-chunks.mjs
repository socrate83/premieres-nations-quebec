/**
 * Traduction FR → EN/ES (Google Translate + préservation HTML par blocs).
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

export async function translateHtml(html, target, opts = {}) {
  const delay = opts.delayMs ?? 120;
  if (!html || html.length < 20) return html;

  const re = /(<(p|h[1-6]|li|blockquote|td|th|div|span|strong|em|a|caption)[^>]*>)([\s\S]*?)(<\/\2>)/gi;
  let result = html;
  const blocks = [...html.matchAll(re)];

  for (const m of blocks) {
    const plain = stripTags(m[3]);
    if (plain.length < 3) continue;
    const tt = await googleTranslate(plain, target);
    const repl = m[1] + tt + m[4];
    if (repl !== m[0]) result = result.replace(m[0], repl);
    await sleep(delay);
  }

  // Titres h2/h3 sans balise interne : <h2>Texte</h2>
  result = result.replace(/<(h[1-6])([^>]*)>([^<]+)<\/\1>/gi, async function () {
    /* sync only — handled below */
  });

  const headRe = /<(h[1-6])([^>]*)>([^<][\s\S]*?)<\/\1>/gi;
  const heads = [...result.matchAll(headRe)];
  for (const m of heads) {
    const plain = stripTags(m[3]);
    if (plain.length < 3 || plain.length > 500) continue;
    const tt = await googleTranslate(plain, target);
    result = result.replace(m[0], '<' + m[1] + m[2] + '>' + tt + '</' + m[1] + '>');
    await sleep(delay);
  }

  return result;
}
