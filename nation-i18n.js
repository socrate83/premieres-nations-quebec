/**
 * Traductions des 11 pages nations + cartes accueil.
 * Corps complet : locales/nations-bodies/{id}.json
 */
(function () {
  'use strict';

  var cache = null;
  var bodyCache = {};
  var frBodySnapshot = null;
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

  function fetchNationBody(id) {
    if (bodyCache[id]) return bodyCache[id];
    var prefix = assetPrefix();
    var urls = [
      prefix + '/locales/nations-bodies/' + id + '.json',
      'locales/nations-bodies/' + id + '.json',
      '../locales/nations-bodies/' + id + '.json',
    ];
    bodyCache[id] = (function tryLoad(i) {
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
    return bodyCache[id];
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

  function nationRoot() {
    return document.getElementById('pn-nation-root');
  }

  function saveFrBodySnapshot() {
    if (frBodySnapshot) return;
    var root = nationRoot();
    if (root) frBodySnapshot = root.innerHTML;
  }

  function cardReadLabel(data, lang) {
    if (typeof window.pnT === 'function') {
      var t = window.pnT('common.read');
      if (t && t !== 'common.read') return t;
    }
    if (data && data.common && data.common[lang] && data.common[lang].read) return data.common[lang].read;
    return null;
  }

  function applyHomeCards(data, lang) {
    var readLabel = cardReadLabel(data, lang);
    document.querySelectorAll('.nation-card[data-pn-nation-id]').forEach(function (card) {
      var entry = nationEntry(data, card.getAttribute('data-pn-nation-id'));
      var pack = packFor(entry, lang);
      if (!pack || !pack.card) return;
      var c = pack.card;
      var tag = card.querySelector('.card-tag');
      var h3 = card.querySelector('h3');
      var desc = card.querySelector('.card-desc');
      var img = card.querySelector('img');
      var btn = card.querySelector('.btn-read');
      if (tag) tag.textContent = c.tag;
      if (h3) h3.textContent = c.name;
      if (desc) desc.textContent = c.desc;
      if (img && c.alt) img.setAttribute('alt', c.alt);
      if (btn && readLabel) btn.textContent = readLabel;
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

  function applyNationChrome(pack) {
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
  }

  function showNotice(lang, hasFullBody) {
    var partialId = 'pn-i18n-nation-notice';
    var machineId = 'pn-i18n-machine-notice';

    function remove(id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    }

    if (lang === 'fr') {
      remove(partialId);
      remove(machineId);
      return;
    }

    remove(partialId);

    if (!hasFullBody) {
      var notice =
        typeof window.pnT === 'function'
          ? window.pnT('common.nationNotice') || window.pnT('common.articleNotice')
          : null;
      if (!notice) return;
      var anchor = document.querySelector('.intro-section, .intro-wrap, .intro-card, article.article-ecoute');
      if (!anchor) return;
      var box = document.getElementById(partialId);
      if (!box) {
        box = document.createElement('div');
        box.id = partialId;
        box.className = 'pn-i18n-notice';
        box.setAttribute('role', 'note');
        anchor.parentNode.insertBefore(box, anchor);
      }
      box.textContent = notice;
      remove(machineId);
      return;
    }

    remove(partialId);
    var msg =
      typeof window.pnT === 'function' ? window.pnT('common.machineTranslationNotice') : null;
    if (!msg) return;
    var root = nationRoot() || document.querySelector('article.article-ecoute');
    if (!root || !root.parentNode) return;
    var mbox = document.getElementById(machineId);
    if (!mbox) {
      mbox = document.createElement('div');
      mbox.id = machineId;
      mbox.className = 'pn-i18n-notice';
      mbox.setAttribute('role', 'note');
      root.parentNode.insertBefore(mbox, root);
    }
    mbox.textContent = msg;
  }

  function applyNationPage(entry, pack, lang, bodyData) {
    applyNationChrome(pack);
    saveFrBodySnapshot();

    var root = nationRoot();
    var fullBody = bodyData && bodyData[lang] && bodyData[lang].html;

    if (lang === 'fr' && frBodySnapshot && root) {
      root.innerHTML = frBodySnapshot;
      showNotice('fr', true);
      return;
    }

    if (fullBody && root) {
      root.innerHTML = fullBody;
      showNotice(lang, true);
      return;
    }

    if (pack && pack.sections) {
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
    if (introP && pack && pack.introHtml) introP.innerHTML = pack.introHtml;

    showNotice(lang, false);
  }

  window.pnApplyNationI18n = function (lang) {
    currentLang = lang || 'fr';
    return fetchNations().then(function (data) {
      if (!data) return;
      applyHomeCards(data, currentLang);
      var id = document.body && document.body.getAttribute('data-pn-nation');
      if (!id) return;
      var entry = nationEntry(data, id);
      return fetchNationBody(id).then(function (bodyData) {
        applyNationPage(entry, packFor(entry, currentLang), currentLang, bodyData);
      });
    });
  };
})();
