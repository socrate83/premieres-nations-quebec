/**
 * FR / EN / ES — bouton en haut à droite, préférence localStorage.
 */
(function () {
  'use strict';

  var LANGS = ['fr', 'en', 'es'];
  var STORAGE_KEY = 'pnq_lang';

  function assetPrefix() {
    var p = location.pathname || '';
    if (/\/podcasts\//i.test(p)) return '..';
    return '';
  }

  function getLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS.indexOf(q) >= 0) return q;
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s && LANGS.indexOf(s) >= 0) return s;
    } catch (e) {}
    return 'fr';
  }

  function setLang(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {}
    document.documentElement.lang = code === 'es' ? 'es' : code === 'en' ? 'en' : 'fr';
  }

  function get(obj, path) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (!cur || cur[parts[i]] === undefined) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function fmt(str, vars) {
    if (!str) return '';
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] !== undefined ? String(vars[k]) : '';
    });
  }

  var T = {};
  var currentLang = 'fr';

  window.pnT = function (key, vars) {
    var v = get(T, key);
    if (v == null) return key;
    return vars ? fmt(v, vars) : v;
  };

  window.pnApplyI18n = applyAll;

  function applyDataI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = get(T, el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = get(T, el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var v = get(T, el.getAttribute('data-i18n-placeholder'));
      if (v != null) el.setAttribute('placeholder', v);
    });
  }

  function applyMeta() {
    if (document.body.dataset.i18nTitle) {
      var v = get(T, document.body.dataset.i18nTitle);
      if (v) document.title = v;
    } else if (location.pathname.match(/Home\.html$/i) || /\/$/.test(location.pathname)) {
      var t = get(T, 'meta.siteTitle');
      if (t) document.title = t;
    }
  }

  function translateReadButtons() {
    var read = get(T, 'common.read');
    if (!read) return;
    document.querySelectorAll('.btn-read').forEach(function (el) {
      if (!el.getAttribute('data-i18n')) el.textContent = read;
    });
    document.querySelectorAll('a.btn-serie').forEach(function (el) {
      var serieRead = get(T, 'home.serieRead');
      if (serieRead) el.textContent = serieRead;
    });
  }

  function injectArticleNotice() {
    var notice = get(T, 'common.articleNotice');
    if (!notice || currentLang === 'fr') {
      var old = document.getElementById('pn-i18n-article-notice');
      if (old) old.remove();
      return;
    }
    var art = document.querySelector('article.article-ecoute');
    if (!art) return;
    var box = document.getElementById('pn-i18n-article-notice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'pn-i18n-article-notice';
      box.className = 'pn-i18n-notice';
      box.setAttribute('role', 'note');
      art.parentNode.insertBefore(box, art);
    }
    box.textContent = notice;
  }

  function renderSwitcher() {
    if (document.getElementById('pn-lang-switcher')) return;
    var wrap = document.createElement('div');
    wrap.id = 'pn-lang-switcher';
    wrap.setAttribute('aria-label', get(T, 'lang.label') || 'Language');
    var label = document.createElement('span');
    label.className = 'pn-lang-label';
    label.textContent = get(T, 'lang.label') || 'Langue';
    wrap.appendChild(label);
    LANGS.forEach(function (code) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = get(T, 'lang.' + code) || code.toUpperCase();
      btn.dataset.lang = code;
      if (code === currentLang) btn.classList.add('is-active');
      btn.addEventListener('click', function () {
        if (code === currentLang) return;
        setLang(code);
        loadAndApply(code);
      });
      wrap.appendChild(btn);
    });
    document.body.appendChild(wrap);
  }

  function updateSwitcherActive() {
    document.querySelectorAll('#pn-lang-switcher button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.lang === currentLang);
    });
    var lab = document.querySelector('#pn-lang-switcher .pn-lang-label');
    if (lab) lab.textContent = get(T, 'lang.label') || 'Langue';
  }

  function applyAll() {
    applyDataI18n();
    applyMeta();
    translateReadButtons();
    injectArticleNotice();
    updateSwitcherActive();
    if (typeof window.pnUpdateMediathequeI18n === 'function') window.pnUpdateMediathequeI18n();
    if (typeof window.pnUpdateVideosI18n === 'function') window.pnUpdateVideosI18n();
  }

  function loadAndApply(code) {
    currentLang = code;
    setLang(code);
    var prefix = assetPrefix();
    var urls = [
      prefix + '/locales/' + code + '.json',
      'locales/' + code + '.json',
      '../locales/' + code + '.json',
    ];
    function tryLoad(i) {
      if (i >= urls.length) return;
      fetch(urls[i], { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then(function (data) {
          T = data;
          applyAll();
        })
        .catch(function () {
          tryLoad(i + 1);
        });
    }
    tryLoad(0);
  }

  function init() {
    currentLang = getLang();
    setLang(currentLang);
    renderSwitcher();
    loadAndApply(currentLang);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
