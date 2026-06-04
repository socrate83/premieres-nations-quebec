/**
 * Traductions des 11 pages nations + cartes accueil (locales/nations.json).
 */
(function () {
  'use strict';

  var cache = null;
  var currentLang = 'fr';

  function assetPrefix() {
    var p = location.pathname || '';
    if (/\/podcasts\//i.test(p)) return '..';
    return '';
  }

  function fetchNations() {
    if (cache) return Promise.resolve(cache);
    var prefix = assetPrefix();
    var urls = [prefix + '/locales/nations.json', 'locales/nations.json', '../locales/nations.json'];
    function tryLoad(i) {
      if (i >= urls.length) return Promise.resolve(null);
      return fetch(urls[i], { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(function (data) {
          cache = data;
          return data;
        })
        .catch(function () {
          return tryLoad(i + 1);
        });
    }
    return tryLoad(0);
  }

  function nationEntry(data, id) {
    if (!data || !data.nations) return null;
    for (var i = 0; i < data.nations.length; i++) {
      if (data.nations[i].id === id) return data.nations[i];
    }
    return null;
  }

  function packFor(entry, lang) {
    if (!entry) return null;
    return entry[lang] || entry.fr;
  }

  function applyHomeCards(data, lang) {
    document.querySelectorAll('[data-pn-nation-id]').forEach(function (card) {
      var entry = nationEntry(data, card.getAttribute('data-pn-nation-id'));
      var pack = packFor(entry, lang);
      if (!pack || !pack.card) return;
      var tag = card.querySelector('.card-tag');
      var h3 = card.querySelector('h3');
      var desc = card.querySelector('.card-desc');
      if (tag) tag.textContent = pack.card.tag;
      if (h3) h3.textContent = pack.card.name;
      if (desc) desc.textContent = pack.card.desc;
    });
  }

  function navFragment(href, onclick) {
    if (href && href.indexOf('#') >= 0) return href.split('#')[1];
    if (onclick) {
      var m = String(onclick).match(/['"]([a-z0-9-]+)['"]/i);
      if (m) return m[1];
    }
    return '';
  }

  function applyNationPage(entry, pack, lang) {
    if (!pack) return;
    document.title = pack.metaTitle || document.title;

    var sub = document.querySelector('.hero-subtitle, .hero-nation');
    if (sub) sub.textContent = pack.heroNation || sub.textContent;

    var h1 = document.querySelector('.hero h1, .hero-content h1');
    if (h1) h1.textContent = pack.heroTitle || h1.textContent;

    var tag = document.querySelector('.hero-tagline, .hero-sub');
    if (tag && !tag.classList.contains('hero-nation')) tag.textContent = pack.heroTagline || tag.textContent;

    var scroll = document.querySelector('.hero-scroll, .scroll-hint');
    if (scroll && pack.scroll) scroll.textContent = pack.scroll;

    var navLinks = document.querySelectorAll('.nav-chapitres a, nav.nav a, #navbar a');
    if (pack.nav && pack.nav.length) {
      var byId = {};
      if (pack.sections) {
        pack.sections.forEach(function (s, idx) {
          byId[s.id] = pack.nav[idx] || pack.nav[pack.nav.length - 1];
        });
      }
      navLinks.forEach(function (a, i) {
        var frag = navFragment(a.getAttribute('href'), a.getAttribute('onclick'));
        if (frag && byId[frag]) a.textContent = byId[frag];
        else if (pack.nav[i]) a.textContent = pack.nav[i];
      });
    }

    if (pack.sections) {
      pack.sections.forEach(function (s) {
        var sec = document.getElementById(s.id);
        if (!sec) return;
        var label = sec.querySelector('.section-label, .sec-label');
        var title = sec.querySelector('.section-header h2, h2.sec-title, .sec-title');
        if (label) label.textContent = s.label;
        if (title) title.textContent = s.title;
      });
    }

    var introP =
      document.querySelector('.intro-card > p') ||
      document.querySelector('.intro-wrap .intro-card p') ||
      document.querySelector('.intro-section .intro-card p');
    if (introP && pack.introHtml) introP.innerHTML = pack.introHtml;

    injectNationNotice(lang);
  }

  function injectNationNotice(lang) {
    var notice =
      typeof window.pnT === 'function'
        ? window.pnT('common.nationNotice') || window.pnT('common.articleNotice')
        : null;
    if (!notice && lang !== 'fr') {
      notice =
        lang === 'en'
          ? 'Section titles and introduction are translated; the full article body remains in French.'
          : 'Los títulos de sección y la introducción están traducidos; el cuerpo del artículo permanece en francés.';
    }
    if (!notice || lang === 'fr') {
      var old = document.getElementById('pn-i18n-nation-notice');
      if (old) old.remove();
      return;
    }
    var anchor = document.querySelector('.intro-section, .intro-wrap, .intro-card, article.article-ecoute');
    if (!anchor) return;
    var box = document.getElementById('pn-i18n-nation-notice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pn-i18n-nation-notice';
      box.className = 'pn-i18n-notice';
      box.setAttribute('role', 'note');
      anchor.parentNode.insertBefore(box, anchor);
    }
    box.textContent = notice;
  }

  window.pnApplyNationI18n = function (lang) {
    currentLang = lang || 'fr';
    return fetchNations().then(function (data) {
      if (!data) return;
      applyHomeCards(data, currentLang);
      var id = document.body && document.body.getAttribute('data-pn-nation');
      if (!id) return;
      var entry = nationEntry(data, id);
      applyNationPage(entry, packFor(entry, currentLang), currentLang);
    });
  };
})();
