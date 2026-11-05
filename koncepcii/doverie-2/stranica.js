
(function () {
  'use strict';

  
  document.querySelectorAll('[data-share]').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-url') || location.href;
      if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var s = b.querySelector('span'), t = s.textContent;
          s.textContent = b.getAttribute('data-done') || t;
          setTimeout(function () { s.textContent = t; }, 2000);
        }).catch(function () {});
      }
    });
  });

  
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (location.hash) a.setAttribute('href', a.getAttribute('href').split('#')[0] + location.hash);
    });
  });
  var chapters = [].slice.call(document.querySelectorAll('.chapter[id]'));
  if ('IntersectionObserver' in window) {
    var links = {};
    document.querySelectorAll('.toc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (history.replaceState && id) history.replaceState(null, '', '#' + id);
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('cur', k === id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    chapters.forEach(function (c) { io.observe(c); });
  }
})();
