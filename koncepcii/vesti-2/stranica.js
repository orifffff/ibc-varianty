
(function () {
  'use strict';
  var d = document, h = d.documentElement;
  var data = {};
  try { data = JSON.parse(d.getElementById('v2k-data').textContent); } catch (e) {  }

  // ---------- регион ----------
  var btns = d.querySelectorAll('[data-region-btn]');
  function setRegion(r, save) {
    if (r === 'ru') h.setAttribute('data-region', 'ru'); else h.removeAttribute('data-region');
    for (var i = 0; i < btns.length; i++) { btns[i].setAttribute('role', 'button'); btns[i].setAttribute('aria-pressed', String(btns[i].getAttribute('data-region-btn') === r)); }
    if (save) { try { localStorage.setItem('ibc-region', r); } catch (e) {  } }
  }
  setRegion(h.getAttribute('data-region') === 'ru' ? 'ru' : 'ca', false);
  for (var b = 0; b < btns.length; b++) {
    btns[b].addEventListener('click', function (ev) { ev.preventDefault(); setRegion(this.getAttribute('data-region-btn'), true); });
  }

  // ---------- раскрытие: кубики ниже сдвигаются, без всплывающих окон ----------
  var toggles = d.querySelectorAll('[data-toggle]');
  for (var t = 0; t < toggles.length; t++) {
    toggles[t].setAttribute('role', 'button');
    toggles[t].setAttribute('aria-expanded', 'false');
    toggles[t].addEventListener('click', function (ev) {
      ev.preventDefault();
      var name = this.getAttribute('data-toggle');
      var sec = this.closest('section') || d.body;
      var open = !sec.classList.contains('open-' + name);
      sec.classList.toggle('open-' + name, open);
      var same = sec.querySelectorAll('[data-toggle="' + name + '"]');
      for (var j = 0; j < same.length; j++) same[j].setAttribute('aria-expanded', String(open));
    });
  }

  // ---------- самосборка по датам ----------
  var today = '';
  var q = /[?&]data=(\d{4}-\d{2}-\d{2})/.exec(location.search);
  if (q) today = q[1];
  else {
    try { today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { today = ''; }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return;
  var ms = function (iso) { return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)); };
  var past = d.querySelectorAll('[data-date]');
  for (var p = 0; p < past.length; p++) if (past[p].getAttribute('data-date') < today) past[p].hidden = true;
  var until = d.querySelectorAll('[data-until]');
  for (var u = 0; u < until.length; u++) if (until[u].getAttribute('data-until') < today) until[u].hidden = true;

  var soon = d.querySelector('[data-soon]');
  var left = soon && soon.querySelector('[data-left]');
  var f = data.cherez || [];
  if (left && f.length && !soon.hidden) {
    var n = Math.round((ms(soon.getAttribute('data-date')) - ms(today)) / 864e5);
    var txt = '';
    if (data.lang === 'ru') {
      var m10 = n % 10, m100 = n % 100;
      txt = n === 0 ? f[3] : n === 1 ? f[4] : (m10 === 1 && m100 !== 11 ? f[0] : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? f[1] : f[2]);
    } else {
      txt = n === 0 ? f[2] : n === 1 ? f[3] : f[1];
    }
    if (txt) left.textContent = txt.replace('{n}', n);
  }
})();
