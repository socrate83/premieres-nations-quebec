(function () {
  'use strict';

  document.querySelectorAll('.video-poster[data-video-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-playing')) return;
      var id = btn.getAttribute('data-video-id');
      var title = btn.getAttribute('data-video-title') || 'Vidéo YouTube';
      var iframe = document.createElement('iframe');
      iframe.setAttribute('title', title);
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      );
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen', '');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1';
      btn.classList.add('is-playing');
      btn.innerHTML = '';
      btn.appendChild(iframe);
    });
  });

  document.querySelectorAll('.faq-item button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (el) {
        el.classList.remove('is-open');
        el.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
