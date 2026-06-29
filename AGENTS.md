# Premières Nations du Québec — site

Static, multilingual (FR / EN / ES) educational website published via **GitHub Pages**
(workflow `Deploy GitHub Pages` in `.github/workflows/pages.yml`, branch `main`).

See `README.md` for the project overview and public links.

## Cursor Cloud specific instructions

**Noms :** le mainteneur s'appelle **Jean-Claude**. Il a nommé son agent **Socrate**
(c'est le nom de l'agent, pas celui du mainteneur). L'agent peut se désigner « Socrate ».

**Langue de communication :** le mainteneur préfère que les agents lui répondent
**toujours en français**.

**Gestion de GitHub :** le mainteneur ne touche pas à GitHub. L'agent gère tout de
bout en bout — il **commite et pousse directement sur `main`** (ce qui déclenche le
déploiement Pages) plutôt que de laisser des PR à fusionner — et fournit ensuite le
**lien public** pour vérifier.


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

### Traductions des articles (EN / ES)
Chaque article charge son corps traduit depuis `locales/articles/{slug}.json`
(via `article-i18n.js`) ; le slug = `data-pn-article-slug` ou le nom de fichier sans
`.html`. Sans JSON, la page affiche « traduction non disponible » et reste en français.
- Générer/regénérer : `node scripts/build-article-translations.mjs --only <slug1,slug2,…>`
  (traduction automatique via l'API Google Translate ; lent, ~5 min/article — délais
  volontaires pour éviter le throttling).
- Lot suivant non traduit : `node scripts/next-untranslated.mjs [N]` (slugs séparés par virgules).
- **Titres des cartes** (grille d'articles sur `Home.html`) : traduits via
  `locales/blog-serie-i18n.json` (chargé par `applyBlogCards` dans `article-i18n.js`).
  Régénérer avec `node scripts/build-blog-cards-i18n.mjs` (titres + teasers seulement).
- **Cartes vidéos** (`Videos.html`, depuis `videos-catalog.json`) : traduites via
  `locales/videos-i18n.json` (hook `window.pnUpdateVideosI18n` appelé par
  `lang-switcher.js`). Régénérer avec `node scripts/build-videos-i18n.mjs`.
- **Cartes podcasts** (`podcasts/index.html`, depuis `podcasts/catalog.json`) :
  desc/type/schedule traduits via `locales/podcasts-i18n.json` (hook
  `window.pnUpdateMediathequeI18n`). Régénérer : `node scripts/build-podcasts-i18n.mjs`.
- **Liens de partage des articles** : `article-share.js` injecte une barre de partage
  (FB/X/WhatsApp/Copier) sur toute page ayant `#pn-article-root` (sauf si `.share-section`
  existe déjà). L'ajouter aux pages : `node scripts/inject-article-share.mjs`. Libellés
  mis à jour via `window.pnUpdateShareBar` (hook `lang-switcher.js`).
- **Lecture audio (synthèse vocale)** : désactivée temporairement via le drapeau
  `DISABLED` en haut de `audio-player.js` (gênait les traductions). Repasser à `false`
  pour réactiver.
  ⚠️ `build-article-translations.mjs` n'écrit ce fichier que SANS `--only` ; en mode
  lot, utiliser le script dédié.
- **Automatisé (GitHub, arrière-plan — ne pas lancer sur le PC de Jean-Claude)** :
  workflow `Traduire les articles (nocturne)` — **1 article par nuit**, ordre numérique
  (#15, puis #16, #17… via `scripts/next-untranslated.mjs`). Commite sur `main` → Pages.
  Ne jamais exécuter `build-article-translations.mjs` en local sauf demande explicite.

### Audit & pages hors catalogue
- Audit de couverture i18n de tout le site : `node scripts/audit-site-i18n.mjs`
  (liste pages sans commutateur, corps non traduits, pages « autonomes »).
- Pages hors catalogue (ex. `PensionnatsIndiens.html`, `BijouxPremieresNations.html`) :
  les câbler avec `node scripts/wire-standalone-i18n.mjs` (enveloppe l'`<article
  class="article-ecoute">` dans `<div id="pn-article-root" data-pn-article-slug>` +
  injecte `article-i18n.js`), puis traduire avec `node scripts/translate-extra-pages.mjs`.
  ⚠️ Ne pas câbler les pages **interactives** (ex. `Partage.html`) : le remplacement
  d'`innerHTML` au changement de langue casserait leurs scripts.

### Checks (no test framework)
There is no lint/test runner. The read-only audit scripts are the closest thing to checks:

```
node scripts/audit-i18n-coverage.mjs    # i18n / lang-switcher coverage report
node scripts/audit-nation-bodies.mjs    # nation body translation sanity report
```
