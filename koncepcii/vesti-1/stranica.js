
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  
  var KEY = 'ibc-region';
  var btns = [].slice.call(document.querySelectorAll('[data-region]'));
  var regs = [].slice.call(document.querySelectorAll('[data-reg]'));
  function setRegion(code, save) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === code)); });
    regs.forEach(function (r) { r.hidden = r.getAttribute('data-reg') !== code; });
    if (save) { try { localStorage.setItem(KEY, code); } catch (e) {} }
  }
  if (btns.length) {
    var saved = 'ca';
    try { saved = localStorage.getItem(KEY) === 'ru' ? 'ru' : 'ca'; } catch (e) {}
    setRegion(saved, false);
    btns.forEach(function (b) { b.addEventListener('click', function () { setRegion(b.getAttribute('data-region'), true); }); });
  }

  
  var live = document.createElement('span');
  live.className = 'ibc-sr-only';
  live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (ok, fail) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
      document.body.removeChild(t);
    });
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.getAttribute('data-copy')).then(function () {
        var v = document.getElementById(b.getAttribute('data-flash'));
        var done = b.getAttribute('data-done') || '';
        b.classList.add('done');
        live.textContent = done;
        var keep = v ? v.innerHTML : '';
        if (v) v.textContent = done;
        setTimeout(function () { b.classList.remove('done'); if (v) v.innerHTML = keep; live.textContent = ''; }, 1500);
      }).catch(function () {});
    });
  });

  
  function today() {
    var m = location.search.match(/[?&]data=(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function days(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }
  function cherez(forms, n, lang) {
    var f = String(forms || '').split(/\s*;\s*/);
    if (n < 0) return '';
    if (lang === 'ru' && f.length >= 5) {
      if (n === 0) return f[3];
      if (n === 1) return f[4];
      var a = n % 10, c = n % 100;
      return (a === 1 && c !== 11 ? f[0] : a >= 2 && a <= 4 && (c < 12 || c > 14) ? f[1] : f[2]).replace('{n}', n);
    }
    if (f.length >= 4) return n === 0 ? f[2] : n === 1 ? f[3] : f[1].replace('{n}', n);
    return '';
  }
  var now = today();
  var list = document.querySelector('.evs');
  if (list) {
    var first = null;
    list.querySelectorAll('.evi').forEach(function (li) {
      var past = (li.getAttribute('data-end') || '') < now;
      li.hidden = past;
      var s = li.querySelector('[data-soon]');
      if (s) s.textContent = '';
      if (!past && !first) first = li;
    });
    if (first) {
      var s = first.querySelector('[data-soon]');
      var start = first.getAttribute('data-date');
      if (s && start >= now) s.textContent = cherez(list.getAttribute('data-cherez'), days(now, start), list.getAttribute('data-lang'));
    }
  }
  document.querySelectorAll('[data-until]').forEach(function (el) { el.hidden = el.getAttribute('data-until') < now; });

  
  var sections = [].slice.call(document.querySelectorAll('main section[id]'));
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () {
      var cur = '';
      sections.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = s.id; });
      var base = a.getAttribute('href').split('#')[0];
      if (cur && window.scrollY > 40) a.setAttribute('href', base + '#' + cur);
    });
  });
})();
