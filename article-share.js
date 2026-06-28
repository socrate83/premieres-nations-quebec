/**
 * Barre de partage des articles (Facebook, X, WhatsApp, Copier le lien).
 * S'injecte automatiquement sur toute page possédant #pn-article-root ou
 * <article class="article-ecoute">, SAUF si un partage existe déjà (.share-section).
 * Placée APRÈS #pn-article-root pour survivre au remplacement d'innerHTML (i18n).
 */
(function () {
  'use strict';

  var LABELS = {
    fr: { share: 'Partager', copy: 'Copier le lien', copied: 'Lien copié !' },
    en: { share: 'Share', copy: 'Copy link', copied: 'Link copied!' },
    es: { share: 'Compartir', copy: 'Copiar enlace', copied: '¡Enlace copiado!' },
  };

  function lang() {
    var l = document.documentElement.lang;
    return LABELS[l] ? l : 'fr';
  }

  var bar = null;

  function injectStyle() {
    if (document.getElementById('pn-share-style')) return;
    var s = document.createElement('style');
    s.id = 'pn-share-style';
    s.textContent =
      '.pn-share-bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center;margin:2rem auto;padding:1rem;max-width:760px;border-top:1px solid rgba(200,146,10,.25)}' +
      '.pn-share-label{font-weight:700;letter-spacing:1px;color:#E8B020;margin-right:.25rem}' +
      '.pn-share-btn{cursor:pointer;font:inherit;font-size:.85rem;font-weight:700;padding:.5rem 1rem;border-radius:50px;border:1px solid rgba(200,146,10,.45);background:rgba(200,146,10,.12);color:#E8B020;text-decoration:none;transition:transform .2s}' +
      '.pn-share-btn:hover{transform:translateY(-2px)}';
    document.head.appendChild(s);
  }

  function updateLabels() {
    if (!bar) return;
    var L = LABELS[lang()];
    var lab = bar.querySelector('.pn-share-label');
    if (lab) lab.textContent = '🔗 ' + L.share;
    var cp = bar.querySelector('.pn-copy');
    if (cp && !cp.dataset.copying) cp.textContent = '⧉ ' + L.copy;
  }

  function build() {
    var anchor =
      document.getElementById('pn-article-root') ||
      document.querySelector('article.article-ecoute');
    if (!anchor) return;
    if (document.querySelector('.share-section') || document.getElementById('pn-share-bar')) return;

    var url = location.href.split('#')[0];
    var title = document.title || '';
    bar = document.createElement('div');
    bar.id = 'pn-share-bar';
    bar.className = 'pn-share-bar';
    var fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    var tw = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
    var wa = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
    bar.innerHTML =
      '<span class="pn-share-label"></span>' +
      '<a class="pn-share-btn" target="_blank" rel="noopener" href="' + fb + '">📘 Facebook</a>' +
      '<a class="pn-share-btn" target="_blank" rel="noopener" href="' + tw + '">✕ X</a>' +
      '<a class="pn-share-btn" target="_blank" rel="noopener" href="' + wa + '">🟢 WhatsApp</a>' +
      '<button type="button" class="pn-share-btn pn-copy"></button>';

    anchor.insertAdjacentElement('afterend', bar);

    var copyBtn = bar.querySelector('.pn-copy');
    copyBtn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.dataset.copying = '1';
        copyBtn.textContent = '✓ ' + LABELS[lang()].copied;
        setTimeout(function () {
          delete copyBtn.dataset.copying;
          updateLabels();
        }, 1600);
      });
    });

    injectStyle();
    updateLabels();
  }

  window.pnUpdateShareBar = updateLabels;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
