(function () {
  'use strict';

  var SUPPORT_HOST = 'support.starlink.com';

  function isValidCode(code) {
    return typeof code === 'string' && /^RC-[A-Z0-9-]+$/i.test(code.trim());
  }

  function buildUrl(path, code) {
    var p = path && path.charAt(0) === '/' ? path : '/residential';
    var url = 'https://www.starlink.com' + p;
    if (!isValidCode(code)) return url;
    var join = url.indexOf('?') >= 0 ? '&' : '?';
    return url + join + 'referral=' + encodeURIComponent(code.trim());
  }

  function applyLinks(code) {
    document.querySelectorAll('[data-starlink-path]').forEach(function (a) {
      var path = a.getAttribute('data-starlink-path') || '/residential';
      a.setAttribute('href', buildUrl(path, code));
      a.setAttribute('rel', 'noopener');
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
    });
    document.querySelectorAll('a[data-starlink-referral]').forEach(function (a) {
      var path = a.getAttribute('data-starlink-referral') || '/residential';
      a.setAttribute('href', buildUrl(path, code));
    });
  }

  function showConfigBanner() {
    if (document.getElementById('starlink-ref-banner')) return;
    var el = document.createElement('div');
    el.id = 'starlink-ref-banner';
    el.setAttribute('role', 'status');
    el.style.cssText =
      'background:#5c1a1a;color:#fff;text-align:center;padding:0.5rem 1rem;font-size:0.82rem;font-weight:600;';
    el.textContent =
      'Guide Starlink : lien de parrainage non configuré (fichier referral.json). Les liens mènent à starlink.com sans code.';
    document.body.prepend(el);
  }

  fetch('referral.json', { cache: 'no-store' })
    .then(function (r) {
      return r.json();
    })
    .then(function (cfg) {
      var code = cfg && cfg.referralCode;
      if (cfg && cfg.referralUrl) {
        try {
          var u = new URL(cfg.referralUrl);
          var fromUrl = u.searchParams.get('referral');
          if (fromUrl) code = fromUrl;
        } catch (e) {}
      }
      window.__starlinkReferral = { referralCode: code };
      applyLinks(code);
      if (!isValidCode(code)) showConfigBanner();
    })
    .catch(function () {
      applyLinks('');
      showConfigBanner();
    });
})();
