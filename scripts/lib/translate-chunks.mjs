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

function hasNestedBlocks(inner) {
  return /<(p|div|h[1-6]|ul|ol|li|table|section|article|blockquote)\b/i.test(inner);
}

function replaceOnce(haystack, needle, repl) {
  const i = haystack.indexOf(needle);
  if (i < 0) return haystack;
  return haystack.slice(0, i) + repl + haystack.slice(i + needle.length);
}

export async function translateHtml(html, target, opts = {}) {
  const delay = opts.delayMs ?? 120;
  if (!html || html.length < 20) return html;

  let result = html;

  const patterns = [
    /<(h[1-6])([^>]*)>([^<]+)<\/\1>/gi,
    /<(p|li|td|th|dt|dd|blockquote|caption)([^>]*)>([\s\S]*?)<\/\1>/gi,
    /<(div)([^>]*class="[^"]*(?:section-label|stat-label|stat-number|timeline-year|timeline-content|kword)[^"]*"[^>]*)>([^<]+)<\/\1>/gi,
    /<(span)([^>]*class="[^"]*(?:img-caption|quote-source)[^"]*"[^>]*)>([^<]+)<\/\1>/gi,
  ];

  for (const re of patterns) {
    const blocks = [...result.matchAll(re)];
    for (const m of blocks) {
      const inner = m[3];
      if (re.source.includes('p|li') && hasNestedBlocks(inner)) continue;
      const plain = /<[^>]+>/.test(inner) ? stripTags(inner) : inner.trim();
      if (plain.length < 2) continue;
      const tt = await googleTranslate(plain, target);
      const repl = '<' + m[1] + m[2] + '>' + tt + '</' + m[1] + '>';
      if (repl !== m[0]) result = replaceOnce(result, m[0], repl);
      await sleep(delay);
    }
  }

  return result;
}
