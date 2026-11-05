
(function () {
  'use strict';
  var root = document.documentElement;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gates = [].slice.call(document.querySelectorAll('.gate.next'));

  
  if ('IntersectionObserver' in window && !still) {
    root.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('open'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    gates.forEach(function (g) {
      var r = g.getBoundingClientRect();
      if (r.top < window.innerHeight) g.classList.add('open'); else io.observe(g);
    });
  }

  
  var today = new Date();
  var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  var board = document.querySelector('.board');
  var forms = board ? (board.getAttribute('data-forms') || '').split(/\s*;\s*/) : [];
  var ru = root.lang === 'ru';
  function cherez(n) {
    var f = function (s) { return (s || '').replace('{n}', String(n)); };
    if (ru && forms.length >= 5) {
      if (n === 0) return forms[3];
      if (n === 1) return forms[4];
      var a = n % 100, b = n % 10;
      return f(a > 10 && a < 20 ? forms[2] : b === 1 ? forms[0] : b >= 2 && b <= 4 ? forms[1] : forms[2]);
    }
    if (!ru && forms.length >= 4) {
      if (n === 0) return forms[2];
      if (n === 1) return forms[3];
      return f(forms[1]);
    }
    return '';
  }
  var rows = [].slice.call(document.querySelectorAll('.board .ev[data-date]'));
  var firstShown = null;
  rows.forEach(function (li) {
    if (li.getAttribute('data-date') < iso) { li.hidden = true; return; }
    if (!firstShown) firstShown = li;
  });
  rows.forEach(function (li) {
    var el = li.querySelector('[data-cherez]');
    if (!el) return;
    el.hidden = li !== firstShown;
    if (li === firstShown) {
      var d = li.getAttribute('data-date');
      var n = Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(iso + 'T00:00:00Z')) / 864e5);
      var t = cherez(n);
      if (t) el.textContent = t;
    }
  });

  
  var nav = {};
  document.querySelectorAll('.nums a').forEach(function (a) { nav[a.getAttribute('href').slice(1)] = a; });
  var all = [].slice.call(document.querySelectorAll('#vorota-01, .gate.next'));
  if ('IntersectionObserver' in window && all.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(nav).forEach(function (k) { nav[k].classList.toggle('on', k === en.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    all.forEach(function (s) { io2.observe(s); });
  }

  
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (location.hash) a.setAttribute('href', a.getAttribute('href').split('#')[0] + location.hash);
    });
  });
})();
