/**
 * Corps des articles FR → EN / ES via locales/articles/{slug}.json
 */
(function () {
  'use strict';

  var cache = {};
  var frSnapshot = null;
  var slug = null;

  function assetPrefix() {
    var p = location.pathname || '';
    if (/\/podcasts\//i.test(p)) return '..';
    if (/\/pages\//i.test(p)) return '../';
    return '';
  }

  function articleSlug() {
    var body = document.body;
    if (body && body.getAttribute('data-pn-article-slug')) {
      return body.getAttribute('data-pn-article-slug');
    }
    var root = document.getElementById('pn-article-root');
    if (root && root.getAttribute('data-pn-article-slug')) {
      return root.getAttribute('data-pn-article-slug');
    }
    var path = (location.pathname || '').split('/').pop() || '';
    return path.replace(/\.html$/i, '');
  }

  function articleRoot() {
    return document.getElementById('pn-article-root');
  }

  function saveFrSnapshot() {
    if (frSnapshot) return;
    var root = articleRoot();
    if (!root) return;
    frSnapshot = { html: root.innerHTML, title: document.title };
  }

  function fetchArticle(slug, lang) {
    var key = slug + ':' + lang;
    if (cache[key]) return cache[key];
    var prefix = assetPrefix();
    var urls = [
      prefix + '/locales/articles/' + slug + '.json',
      'locales/articles/' + slug + '.json',
      '../locales/articles/' + slug + '.json',
    ];
    cache[key] = Promise.resolve(null);
    cache[key] = (function tryLoad(i) {
      if (i >= urls.length) return Promise.resolve(null);
      return fetch(urls[i], { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .catch(function () {
          return tryLoad(i + 1);
        });
    })(0);
    return cache[key];
  }

  function setNotice(lang, hasTranslation) {
    var id = 'pn-i18n-article-notice';
    var old = document.getElementById(id);
    if (hasTranslation || lang === 'fr') {
      if (old) old.remove();
      return;
    }
    var notice =
      typeof window.pnT === 'function' ? window.pnT('common.articleNotice') : null;
    if (!notice) return;
    var box = old;
    if (!box) {
      box = document.createElement('div');
      box.id = id;
      box.className = 'pn-i18n-notice';
      box.setAttribute('role', 'note');
      var root = articleRoot();
      if (root && root.parentNode) root.parentNode.insertBefore(box, root);
    }
    box.textContent = notice;
  }

  function reinitAudio() {
    // Le lecteur audio est injecté en JS dans <article class="article-ecoute">.
    // Après remplacement du innerHTML (changement de langue), il faut le remonter.
    if (typeof window.pnInitAudioPlayer === 'function') {
      setTimeout(window.pnInitAudioPlayer, 0);
    }
  }

  function applyArticle(lang) {
    slug = articleSlug();
    var root = articleRoot();
    if (!root || !slug) return Promise.resolve(false);

    saveFrSnapshot();

    if (lang === 'fr' && frSnapshot) {
      root.innerHTML = frSnapshot.html;
      if (frSnapshot.title) document.title = frSnapshot.title;
      setNotice('fr', true);
      showMachineNotice('fr');
      reinitAudio();
      return Promise.resolve(true);
    }

    return fetchArticle(slug, lang).then(function (data) {
      if (!data || !data[lang]) {
        setNotice(lang, false);
        return false;
      }
      var pack = data[lang];
      if (pack.html) root.innerHTML = pack.html;
      if (pack.title) document.title = pack.title;
      setNotice(lang, true);
      showMachineNotice(lang);
      reinitAudio();
      return true;
    });
  }

  function showMachineNotice(lang) {
    if (lang === 'fr') {
      var m = document.getElementById('pn-i18n-machine-notice');
      if (m) m.remove();
      return;
    }
    var msg =
      typeof window.pnT === 'function' ? window.pnT('common.machineTranslationNotice') : null;
    if (!msg) return;
    var root = articleRoot();
    if (!root) return;
    var box = document.getElementById('pn-i18n-machine-notice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pn-i18n-machine-notice';
      box.className = 'pn-i18n-notice';
      box.setAttribute('role', 'note');
      root.parentNode.insertBefore(box, root);
    }
    box.textContent = msg;
  }

  function fetchBlogCatalogI18n(lang) {
    if (lang === 'fr') return Promise.resolve(null);
    var prefix = assetPrefix();
    var url = prefix + '/locales/blog-serie-i18n.json';
    return fetch(url, { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .catch(function () {
        return fetch('locales/blog-serie-i18n.json', { cache: 'no-store' })
          .then(function (r) {
            return r.ok ? r.json() : null;
          })
          .catch(function () {
            return null;
          });
      });
  }

  function blogCardParts(card) {
    return {
      h: card.querySelector('h4, h3, .serie-card-title'),
      p: card.querySelector('p, .serie-card-teaser'),
    };
  }

  function snapshotBlogCardsFr() {
    // Mémorise le texte FR d'origine (une seule fois par carte) afin de pouvoir
    // le restaurer : sinon, revenir au français laisse les cartes figées dans la
    // dernière langue choisie (EN/ES).
    document.querySelectorAll('.serie-card-blog[data-pn-article-file]').forEach(function (card) {
      var parts = blogCardParts(card);
      if (parts.h && card.getAttribute('data-pn-fr-title') === null) {
        card.setAttribute('data-pn-fr-title', parts.h.textContent);
      }
      if (parts.p && card.getAttribute('data-pn-fr-teaser') === null) {
        card.setAttribute('data-pn-fr-teaser', parts.p.textContent);
      }
    });
  }

  function applyBlogCards(lang) {
    snapshotBlogCardsFr();

    if (lang === 'fr') {
      document.querySelectorAll('.serie-card-blog[data-pn-article-file]').forEach(function (card) {
        var parts = blogCardParts(card);
        var frTitle = card.getAttribute('data-pn-fr-title');
        var frTeaser = card.getAttribute('data-pn-fr-teaser');
        if (parts.h && frTitle !== null) parts.h.textContent = frTitle;
        if (parts.p && frTeaser !== null) parts.p.textContent = frTeaser;
      });
      return;
    }

    fetchBlogCatalogI18n(lang).then(function (data) {
      if (!data || !data[lang]) return;
      var map = data[lang];
      document.querySelectorAll('.serie-card-blog[data-pn-article-file]').forEach(function (card) {
        var file = card.getAttribute('data-pn-article-file');
        var t = map[file];
        if (!t) return;
        var parts = blogCardParts(card);
        if (parts.h && t.title) parts.h.textContent = t.title;
        if (parts.p && t.teaser) parts.p.textContent = t.teaser;
      });
    });
  }

  window.pnApplyArticleI18n = function (lang) {
    var p = applyArticle(lang);
    applyBlogCards(lang);
    return p;
  };
})();
