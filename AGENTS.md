# Premières Nations du Québec — site

Static, multilingual (FR / EN / ES) educational website published via **GitHub Pages**
(workflow `Deploy GitHub Pages` in `.github/workflows/pages.yml`, branch `main`).

See `README.md` for the project overview and public links.

## Cursor Cloud specific instructions

**Langue de communication :** le mainteneur préfère que les agents lui répondent
**toujours en français**.


This is a **pure static HTML/CSS/JS site**. There is **no `package.json`, no lockfile, and no
third-party dependencies** — every `scripts/*.mjs` file uses only Node.js built-in modules
(`fs`, `path`, `url`, `child_process`, `https`). Node.js (v22) and Python 3 are preinstalled, so
there is nothing to `npm install`; the startup update script is intentionally a no-op check.

### Run the site (development)
Serve the repo root with any static file server, then open `http://localhost:8000/`
(redirects to `Home.html`):

```
python3 -m http.server 8000     # from repo root
```

Pages use root-relative links (`Home.html`, `assets/…`) and most images are hosted externally
(`media.base44.com`), so serving from the repo root "just works". The language switcher
(`lang-switcher.js` + `locales/`) runs client-side; some article bodies have no EN/ES translation
and intentionally show a banner "Translation not available… French version is authoritative".

### Build / deploy
The Pages workflow runs `node scripts/mirror-pages-to-root.mjs`, which copies `pages/*.html` to the
repo root (rewriting `../assets/` → `assets/`, etc.) and regenerates `blog-serie-articles.json`.
**Gotcha:** running it modifies many tracked root-level `*.html` files in place — it is a
build/deploy step, not something to run casually during local dev. The root-level `*.html` files
are the deployed copies; the editable sources live under `pages/`.

### Checks (no test framework)
There is no lint/test runner. The read-only audit scripts are the closest thing to checks:

```
node scripts/audit-i18n-coverage.mjs    # i18n / lang-switcher coverage report
node scripts/audit-nation-bodies.mjs    # nation body translation sanity report
```
