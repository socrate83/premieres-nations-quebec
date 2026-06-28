/**
 * Lecteur vocal — Web Speech API (gratuit, navigateur)
 * Lit le texte de la balise <article class="article-ecoute">.
 */
(function () {
  'use strict';

  /** Vitesse « narration posée » pour récits historiques */
  // Lecture audio des articles DÉSACTIVÉE temporairement (demande Jean-Claude) :
  // la synthèse vocale interférait avec les traductions. Pour réactiver, repasser
  // DISABLED à false.
  var DISABLED = true;

  var RATE = 0.92;
  var PITCH = 1;
  var LANG = 'fr-FR';

  var articleEl = null;
  var controlsEl = null;
  var btnPlay = null;
  var btnStop = null;
  var statusEl = null;
  var frenchVoice = null;
  var queue = [];
  var queueIndex = 0;
  var speaking = false;

  function init() {
    if (DISABLED) return;
    articleEl = document.querySelector('article.article-ecoute');
    if (!articleEl) return;

    if (getComputedStyle(document.body).backgroundColor) {
      var bg = document.body.style.backgroundColor || '';
      if (bg === '#0a0a0a' || document.body.classList.contains('ecoute-sombre')) {
        document.body.classList.add('ecoute-sombre');
      }
      var bodyBg = window.getComputedStyle(document.body).backgroundColor;
      if (bodyBg && (bodyBg === 'rgb(10, 10, 10)' || bodyBg === 'rgb(10, 10, 10)')) {
        document.body.classList.add('ecoute-sombre');
      }
    }

    var h1InArticle = articleEl.querySelector('h1');
    var h1Page = document.querySelector('.hero h1, .hero-banner + * h1, header h1');
    var mountAfter =
      h1Page ||
      h1InArticle ||
      articleEl.querySelector('.intro-card, .intro-kword, h2') ||
      articleEl.firstElementChild;

    mountControls(mountAfter || articleEl.firstElementChild);
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function loadVoices() {
    var voices = window.speechSynthesis.getVoices();
    frenchVoice =
      voices.find(function (v) {
        return v.lang === 'fr-FR' || v.lang === 'fr-CA';
      }) ||
      voices.find(function (v) {
        return v.lang && v.lang.indexOf('fr') === 0;
      }) ||
      null;
  }

  function homeHref() {
    var script = document.querySelector('script[src*="audio-player"]');
    if (script && script.src) {
      try {
        return new URL('Home.html', script.src).pathname;
      } catch (e) {
        /* ignore */
      }
    }
    var parts = (window.location.pathname || '').split('/').filter(Boolean);
    if (parts.length > 1) {
      return '../Home.html';
    }
    return 'Home.html';
  }

  function mountControls(anchor) {
    if (!anchor || articleEl.querySelector('.ecoute-controls')) return;

    controlsEl = document.createElement('div');
    controlsEl.className = 'ecoute-controls';
    controlsEl.setAttribute('role', 'toolbar');
    controlsEl.setAttribute('aria-label', 'Écouter cet article');

    var accueil = document.createElement('a');
    accueil.className = 'ecoute-accueil';
    accueil.href = homeHref();
    accueil.textContent = '← Accueil';
    accueil.setAttribute('aria-label', 'Retour à l’accueil du site');

    var label = document.createElement('span');
    label.className = 'ecoute-label';
    label.textContent = 'Lecture audio';

    btnPlay = document.createElement('button');
    btnPlay.type = 'button';
    btnPlay.className = 'ecoute-btn ecoute-btn-ecouter';
    btnPlay.textContent = '▶ Écouter';
    btnPlay.addEventListener('click', startReading);

    btnStop = document.createElement('button');
    btnStop.type = 'button';
    btnStop.className = 'ecoute-btn ecoute-btn-arreter';
    btnStop.textContent = '■ Arrêter';
    btnStop.disabled = true;
    btnStop.addEventListener('click', stopReading);

    statusEl = document.createElement('p');
    statusEl.className = 'ecoute-status';
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.textContent = 'Utilise la synthèse vocale de votre navigateur (aucun coût).';

    controlsEl.appendChild(accueil);
    controlsEl.appendChild(label);
    controlsEl.appendChild(btnPlay);
    controlsEl.appendChild(btnStop);
    controlsEl.appendChild(statusEl);

    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement('afterend', controlsEl);
    } else {
      articleEl.insertBefore(controlsEl, articleEl.firstChild);
    }
  }

  function getReadableText() {
    var clone = articleEl.cloneNode(true);
    var remove = clone.querySelectorAll(
      '.ecoute-controls, script, style, nav, .nav-chapitres, .share-section, .share-footer, .nav-bottom, .nav-art, .footer-sources, .footer-nav, .hashtags, audio, video, iframe, button, .hero-scroll, .stats-row'
    );
    remove.forEach(function (el) {
      el.remove();
    });
    return clone.innerText.replace(/\s+/g, ' ').trim();
  }

  function splitIntoChunks(text) {
    if (!text) return [];
    var parts = text.match(/[^.!?…]+[.!?…]+[\s]*/g);
    if (!parts || parts.length === 0) return [text];
    var chunks = [];
    var buf = '';
    parts.forEach(function (p) {
      if ((buf + p).length > 280) {
        if (buf) chunks.push(buf.trim());
        buf = p;
      } else {
        buf += p;
      }
    });
    if (buf.trim()) chunks.push(buf.trim());
    return chunks.filter(Boolean);
  }

  function startReading() {
    if (!window.speechSynthesis) {
      setStatus('La synthèse vocale n’est pas supportée par ce navigateur.');
      return;
    }

    stopReading(false);
    var text = getReadableText();
    if (!text) {
      setStatus('Aucun texte à lire dans cet article.');
      return;
    }

    queue = splitIntoChunks(text);
    queueIndex = 0;
    speaking = true;
    btnPlay.disabled = true;
    btnStop.disabled = false;
    setStatus('Lecture en cours…');
    speakNext();
  }

  function speakNext() {
    if (!speaking || queueIndex >= queue.length) {
      onReadingEnd();
      return;
    }

    var utter = new SpeechSynthesisUtterance(queue[queueIndex]);
    utter.lang = LANG;
    utter.rate = RATE;
    utter.pitch = PITCH;
    if (frenchVoice) utter.voice = frenchVoice;

    utter.onend = function () {
      queueIndex += 1;
      speakNext();
    };
    utter.onerror = function () {
      queueIndex += 1;
      speakNext();
    };

    window.speechSynthesis.speak(utter);
  }

  function stopReading(updateStatus) {
    speaking = false;
    queue = [];
    queueIndex = 0;
    window.speechSynthesis.cancel();
    btnPlay.disabled = false;
    btnStop.disabled = true;
    if (updateStatus !== false) {
      setStatus('Lecture arrêtée.');
    }
  }

  function onReadingEnd() {
    speaking = false;
    btnPlay.disabled = false;
    btnStop.disabled = true;
    setStatus('Lecture terminée.');
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  // Exposé pour permettre un remontage après un changement de langue
  // (article-i18n.js remplace le innerHTML, ce qui retire les contrôles injectés).
  window.pnInitAudioPlayer = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
