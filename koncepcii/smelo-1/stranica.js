
(function () {
  'use strict';
  var el = document.getElementById('s1-data');
  var D = {};
  try { D = JSON.parse(el ? el.textContent : '{}'); } catch (e) { D = {}; }
  var live = document.getElementById('live');

  // сегодня по Алматы, ГГГГ-ММ-ДД; ?data=2027-04-16 показывает страницу на эту дату
  var today = (function () {
    var q = /[?&]data=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (q) return q[1];
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); }
  })();
  var diff = function (iso) { return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 864e5); };
  var cherez = function (n) {
    var f = D.cherez || [];
    if (!f.length || n < 0) return '';
    if (D.lang === 'ru') {
      if (n === 0) return f[3]; if (n === 1) return f[4];
      var a = n % 10, b = n % 100;
      return (a === 1 && b !== 11 ? f[0] : (a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2])).replace('{n}', n);
    }
    if (n === 0) return f[2]; if (n === 1) return f[3];
    return f[1].replace('{n}', n);
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-when]'), function (w) { w.textContent = cherez(diff(w.getAttribute('data-when'))); });
  Array.prototype.forEach.call(document.querySelectorAll('.ev[data-date]'), function (li) { if (diff(li.getAttribute('data-date')) < 0) li.hidden = true; });
  Array.prototype.forEach.call(document.querySelectorAll('[data-until]'), function (li) { if (diff(li.getAttribute('data-until')) < 0) li.hidden = true; });

  // квадрат-спутник: виден, когда бордовый квадрат первого экрана ушел вверх
  var s = document.querySelector('[data-sputnik]');
  var wa = document.querySelector('.rack .c-wa');
  if (s && wa && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var on = !en[0].isIntersecting && en[0].boundingClientRect.top < 0;
      s.classList.toggle('on', on);
      s.tabIndex = on ? 0 : -1;
    }).observe(wa);
  }

  // копирование на компьютере (мышь); на телефоне это звонок и письмо
  var desk = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };
  var copyText = function (t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) {
      var ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-100px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? ok() : no(); } catch (e) { no(e); }
      document.body.removeChild(ta);
    });
  };
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (a) {
    a.addEventListener('click', function (ev) {
      if (!desk.matches) return;
      ev.preventDefault();
      copyText(a.getAttribute('data-copy')).then(function () {
        var c = a.querySelector('.copy-t');
        if (c) { c.textContent = D.copied; setTimeout(function () { c.textContent = D.copy; }, 1500); }
        if (live) live.textContent = D.copied + ': ' + a.getAttribute('data-copy');
      }, function () { location.href = a.href; });
    });
  });

  // капсулы «С какой задачей Вы пришли?»: готовая фраза плюс задача
  Array.prototype.forEach.call(document.querySelectorAll('[data-task]'), function (a) {
    a.addEventListener('click', function () {
      if (D.wa && D.prefill) a.href = D.wa + '?text=' + encodeURIComponent(D.prefill + ' ' + a.getAttribute('data-task'));
    });
  });
})();
