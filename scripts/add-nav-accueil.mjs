/**
 * Ajoute une barre « Retour à l'accueil » sur toutes les pages d'articles.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = 'pn-nav-accueil';

const NAV_STYLE = `<style id="pn-nav-accueil-style">
.pn-nav-accueil{position:sticky;top:0;z-index:500;display:flex;flex-wrap:wrap;gap:0.5rem 1rem;align-items:center;justify-content:center;padding:0.65rem 1rem;background:#141414;border-bottom:2px solid #c8920a;font-family:'Lato',Georgia,system-ui,sans-serif}
.pn-nav-accueil a{color:#e8b020;text-decoration:none;font-weight:700;font-size:0.82rem;padding:0.45rem 1rem;border-radius:50px;border:1px solid rgba(232,176,32,0.4);transition:background .2s,color .2s}
.pn-nav-accueil a:hover{background:#c8920a;color:#000}
.pn-nav-accueil a.pn-nav-accueil__home{background:#c8920a;color:#000;border-color:#c8920a}
.pn-nav-accueil--light{background:#f4efe6;border-bottom:2px solid #8b4513}
.pn-nav-accueil--light a{color:#2c5530;border-color:rgba(44,85,48,0.35)}
.pn-nav-accueil--light a:hover{background:#2c5530;color:#fff}
.pn-nav-accueil--light a.pn-nav-accueil__home{background:#2c5530;color:#fff}
</style>`;

function navHtml(homeHref, light) {
  const cls = light ? 'pn-nav-accueil pn-nav-accueil--light' : 'pn-nav-accueil';
  const articlesHref = homeHref.startsWith('../') ? '../Articles.html' : 'Articles.html';
  return `${NAV_STYLE}
<nav class="${cls}" aria-label="Navigation">
  <a class="pn-nav-accueil__home" href="${homeHref}">← Retour à l'accueil</a>
  <a href="${articlesHref}">📚 Tous les articles (1–72)</a>
</nav>`;
}

function isLightTheme(html) {
  return /background:\s*#f(?:a|c)faf7|background-color:\s*#f(?:a|c)faf7/i.test(html);
}

function fixHomeLinks(html, homeHref) {
  let out = html
    .replace(/href=["']Home\.html#serie-blog["']/gi, 'href="Articles.html"')
    .replace(/href=["']\.\.\/Home\.html#serie-blog["']/gi, 'href="Articles.html"')
    .replace(/href=["']Home\.html["']/gi, `href="${homeHref}"`)
    .replace(/href=["']index\.html#nations["']/gi, `href="${homeHref}#nations"`)
    .replace(/href=["']index\.html["']/gi, `href="${homeHref}"`);
  if (homeHref.startsWith('../')) {
    out = out
      .replace(/href=["']style\.css["']/gi, 'href="../style.css"')
      .replace(/src=["']audio-player\.js["']/gi, 'src="../audio-player.js"');
  }
  return out;
}

function injectNav(html, homeHref) {
  if (html.includes(MARKER)) {
    return fixHomeLinks(html, homeHref);
  }
  const light = isLightTheme(html);
  const block = navHtml(homeHref, light);
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (!bodyMatch) return html;
  const insertAt = bodyMatch.index + bodyMatch[0].length;
  let out = html.slice(0, insertAt) + '\n' + block + '\n' + html.slice(insertAt);
  return fixHomeLinks(out, homeHref);
}

function processDir(dir, homeHref) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.html')) continue;
    const fp = path.join(dir, name);
    const before = fs.readFileSync(fp, 'utf8');
    const after = injectNav(before, homeHref);
    if (after !== before) {
      fs.writeFileSync(fp, after, 'utf8');
      n++;
    }
  }
  return n;
}

const pagesCount = processDir(path.join(root, 'pages'), '../Home.html');
const rootCount = processDir(root, 'Home.html');
console.log(`Barre accueil : ${pagesCount} fichiers dans pages/, ${rootCount} à la racine.`);
