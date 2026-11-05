
(function () {
  'use strict';
  var d = document;
  var h = d.documentElement;
  var DATA = {};
  try { DATA = JSON.parse(d.getElementById('v3-data').textContent); } catch (e) { DATA = {}; }
  var mm = function (q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var desktop = mm('(hover: hover) and (pointer: fine)');
  function each(sel, fn, root) { var l = (root || d).querySelectorAll(sel); for (var i = 0; i < l.length; i++) fn(l[i], i); }

  if (!reduce) h.classList.add('anim');
  if (h.classList.contains('stack')) setTimeout(function () { h.classList.remove('stack'); }, 1000);

  // ---------- «сегодня» по Алматы; ?data=2027-04-16 показывает страницу на эту дату ----------
  function today() {
    var m = /[?&]data=(\d{4}-\d{2}-\d{2})/.exec(location.search);
    if (m) return m[1];
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      var o = {};
      for (var i = 0; i < p.length; i++) o[p[i].type] = p[i].value;
      if (o.year && o.month && o.day) return o.year + '-' + o.month + '-' + o.day;
    } catch (e) {  }
    var t = new Date(Date.now() + 5 * 3600 * 1000);
    return t.toISOString().slice(0, 10);
  }
  var T = today();

  // прошедшие события прячутся (событие видно до конца своего дня), строка ролика уходит после своего срока
  each('[data-date]', function (el) { if (el.getAttribute('data-date') < T) el.hidden = true; });
  each('[data-until]', function (el) { if (el.getAttribute('data-until') < T) el.hidden = true; });
  (function () {
    var list = d.querySelector('.ev-list');
    if (list && !list.querySelector('.ev:not([hidden])')) {
      list.hidden = true;
      var none = d.querySelector('.ev-none');
      if (none) none.hidden = false;
    }
    // квадрат CAWS: год ближайшего саммита, строки прошедших уходят, без будущих только домен
    var sq = d.querySelector('.sq-caws');
    if (!sq) return;
    var vis = sq.querySelectorAll('.cw-d:not([hidden])');
    var yr = sq.querySelector('.cw-yr');
    if (!vis.length) {
      each('.sq-dat-m2, .sq-dat-m1, .sq-dat-d', function (x) { x.hidden = true; }, sq);
      if (yr) yr.hidden = true;
      var n = sq.querySelector('.cw-none');
      if (n) n.hidden = false;
    } else if (yr) {
      yr.innerHTML = '&nbsp;' + vis[0].getAttribute('data-year');
    }
    // разделитель « · » в строке «15.04 · 07.10» нужен только между видимыми датами
    var firstVis = sq.querySelector('.cw-m1:not([hidden])');
    var sep = firstVis ? firstVis.querySelector('.cw-sep') : null;
    if (sep) sep.hidden = true;
  })();

  // ---------- копирование ----------
  function copyText(t) {
    function fallback() {
      var ta = d.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
      d.body.appendChild(ta);
      ta.select();
      try { d.execCommand('copy'); } catch (e) {  }
      d.body.removeChild(ta);
    }
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t).catch(fallback); return; }
    } catch (e) {  }
    fallback();
  }
  var liveEl = d.getElementById('v3-live');
  function say(t) { if (!liveEl) return; liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = t; }, 40); }
  function flash(el, text) {
    say(text);
    if (!el) return;
    if (el._v3t) clearTimeout(el._v3t); else el._v3o = el.innerHTML;
    el.textContent = text;
    el._v3t = setTimeout(function () { el.innerHTML = el._v3o; el._v3t = null; }, 1500);
  }
  each('[data-copy]', function (b) {
    b.addEventListener('click', function () {
      copyText(b.getAttribute('data-copy'));
      var row = b.closest ? b.closest('[data-row]') : null;
      flash(row ? row.querySelector('[data-val]') : null, DATA.copied);
      b.classList.add('done');
      setTimeout(function () { b.classList.remove('done'); }, 1500);
    });
  });
  // на компьютере звонок копирует номер (href остается tel:, без JS работает как обычно)
  if (desktop) {
    each('a[href^="tel:"]', function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var num = a.getAttribute('data-num') || (a.textContent || '').replace(/\s+/g, ' ').trim();
        copyText(num);
        if (a.hasAttribute('data-noflash')) { say(DATA.copied); return; }
        flash(a.querySelector('[data-val]') || a, DATA.copied);
      });
    });
  }

  // ---------- регион ----------
  function region() { return h.getAttribute('data-region') === 'ru' ? 'ru' : 'ca'; }
  function setRegion(r, save) {
    if (r === 'ru') h.setAttribute('data-region', 'ru'); else h.removeAttribute('data-region');
    each('.reg-b', function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === r)); });
    if (save) { try { localStorage.setItem('ibc-region', r); } catch (e) {  } }
    queueSat();
    queueFit();
  }
  var saved = 'ca';
  try { saved = localStorage.getItem('ibc-region') === 'ru' ? 'ru' : 'ca'; } catch (e) { saved = 'ca'; }
  each('.reg-b', function (b) { b.addEventListener('click', function () { setRegion(b.getAttribute('data-region'), true); }); });

  // ---------- капсулы задач: WhatsApp выбранного региона с готовой фразой и задачей ----------
  each('[data-task]', function (a) {
    a.addEventListener('click', function () {
      var orig = a.getAttribute('href');
      var base = region() === 'ru' ? DATA.waRu : DATA.waCa;
      if (base) a.setAttribute('href', base + '?text=' + encodeURIComponent((DATA.prefill ? DATA.prefill + ' ' : '') + a.getAttribute('data-task')));
      setTimeout(function () { a.setAttribute('href', orig); }, 0);
    });
  });

  // ---------- «Поделиться»: системное окно или копия адреса; без JS ведет на слой QR ----------
  each('[data-share]', function (b) {
    b.setAttribute('role', 'button');
    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (navigator.share) {
        navigator.share({ title: DATA.title, text: DATA.text, url: DATA.url }).catch(function () {  });
        return;
      }
      copyText(DATA.url);
      flash(b.querySelector('[data-val]'), DATA.linkCopied);
    });
    b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); b.click(); } });
  });

  // ---------- слой QR: на весь экран, страница под ним не сдвигается; Esc и «Назад» закрывают ----------
  var layer = d.getElementById('qr');
  var opener = null;
  function onKey(e) {
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeQr(false); }
    else if (e.key === 'Tab') { e.preventDefault(); var x = layer.querySelector('.qr-x'); if (x) x.focus(); }
  }
  function openQr(e) {
    if (e) e.preventDefault();
    if (!layer) return;
    opener = d.activeElement;
    try { history.pushState({ v3qr: 1 }, '', '#qr'); } catch (er) {  }
    layer.classList.add('open');
    var x = layer.querySelector('.qr-x');
    if (x) { try { x.focus({ preventScroll: true }); } catch (er) { x.focus(); } }
    d.addEventListener('keydown', onKey);
  }
  function closeQr(fromHistory) {
    if (!layer || !layer.classList.contains('open')) return;
    layer.classList.remove('open');
    d.removeEventListener('keydown', onKey);
    if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (er) { opener.focus(); } }
    if (!fromHistory) {
      if (history.state && history.state.v3qr) history.back();
      else if (location.hash === '#qr') { try { history.replaceState(null, '', location.pathname + location.search); } catch (er) {  } }
    }
  }
  if (layer) {
    each('[data-qr-open]', function (a) { a.addEventListener('click', openQr); });
    each('[data-qr-close]', function (a) { a.addEventListener('click', function (e) { e.preventDefault(); closeQr(false); }); });
    window.addEventListener('popstate', function () { if (location.hash !== '#qr') closeQr(true); });
    if (location.hash === '#qr') { opener = null; layer.classList.add('open'); d.addEventListener('keydown', onKey); }
  }

  // ---------- язык: переход сохраняет раздел, на котором человек сейчас ----------
  var SECTIONS = ['glavnoe', 'sobytiya', 'zadacha', 'proekty', 'uslugi', 'sayty', 'pressa', 'socseti', 'kontakty'];
  function currentSection() {
    var line = (window.innerHeight || 600) * 0.3;
    var best = null;
    var bestTop = -Infinity;
    for (var i = 0; i < SECTIONS.length; i++) {
      var el = d.getElementById(SECTIONS[i]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom > 0 && r.top > bestTop + 0.5) { best = SECTIONS[i]; bestTop = r.top; }
    }
    return best;
  }
  each('.lang-switch a[hreflang], .lhint-a', function (a) {
    var base = (a.getAttribute('href') || '').split('#')[0];
    function upd() {
      var id = currentSection();
      a.setAttribute('href', base + (id && id !== 'glavnoe' ? '#' + id : ''));
    }
    a.addEventListener('click', upd);
    a.addEventListener('focus', upd);
    a.addEventListener('mouseenter', upd);
    a.addEventListener('touchstart', upd, { passive: true });
  });

  // ---------- подсказка языка внизу экрана (QR английской презентации ведет на русскую страницу) ----------
  (function () {
    var bar = d.querySelector('[data-hint]');
    if (!bar) return;
    try { if (localStorage.getItem('ibc-lang-hint')) return; } catch (e) {  }
    var nl = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    var page = h.getAttribute('lang');
    if (!(page === 'ru' ? /^en/.test(nl) : /^ru/.test(nl))) return;
    bar.hidden = false;
    h.classList.add('hint-on');
    var x = bar.querySelector('button');
    if (x) x.addEventListener('click', function () {
      bar.hidden = true;
      h.classList.remove('hint-on');
      try { localStorage.setItem('ibc-lang-hint', '1'); } catch (e) {  }
      queueSat();
    });
  })();

  // ---------- спутник: бордовый квадрат, когда лестница ушла с экрана ----------
  var sats = d.querySelectorAll('.sat');
  var avoid = d.querySelectorAll('[data-avoid]');
  var satTimer = 0;
  function ladderRect() {
    var top = Infinity, bottom = -Infinity, any = false;
    each('.hero .sq', function (s) {
      if (!s.offsetWidth) return;
      var r = s.getBoundingClientRect();
      any = true;
      if (r.top < top) top = r.top;
      if (r.bottom > bottom) bottom = r.bottom;
    });
    return any ? { top: top, bottom: bottom } : null;
  }
  function updateSat() {
    satTimer = 0;
    if (!sats.length) return;
    var vh = window.innerHeight || h.clientHeight;
    var vw = h.clientWidth;
    var lr = ladderRect();
    var show = !lr || lr.bottom <= 0 || lr.top >= vh;
    if (show && layer && layer.classList.contains('open')) show = false;
    if (show) {
      var sat = null;
      for (var j = 0; j < sats.length; j++) if (sats[j].offsetWidth) sat = sats[j];
      if (sat) {
        var size = sat.offsetWidth;
        var cs = window.getComputedStyle(sat);
        var right = vw - (parseFloat(cs.right) || 16);
        var bottomY = vh - (parseFloat(cs.bottom) || 16);
        var zx = right - size - 12;
        var zy = bottomY - size - 12;
        for (var i = 0; i < avoid.length; i++) {
          var a = avoid[i];
          if (!a.offsetWidth) continue;
          var r = a.getBoundingClientRect();
          if (r.right > zx && r.left < right + 4 && r.bottom > zy && r.top < bottomY + 4) { show = false; break; }
        }
      }
    }
    for (var k = 0; k < sats.length; k++) {
      if (show) sats[k].classList.add('on'); else sats[k].classList.remove('on');
      if (show) sats[k].removeAttribute('tabindex'); else sats[k].setAttribute('tabindex', '-1');
    }
  }
  function queueSat() {
    if (satTimer) return;
    satTimer = window.requestAnimationFrame ? window.requestAnimationFrame(updateSat) : setTimeout(updateSat, 16);
  }
  window.addEventListener('scroll', queueSat, { passive: true });
  window.addEventListener('resize', queueSat);

  // ---------- ровная сетка 2x3, если ярлык не помещается (узкий экран, крупный системный шрифт) ----------
  var setkaCss = d.getElementById('setka-css');
  var media0 = setkaCss ? setkaCss.getAttribute('media') : null;
  var fitTimer = 0;
  function overflowing() {
    var bad = false;
    each('.hero .sq', function (s) {
      if (bad || !s.offsetWidth) return;
      if (s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1) bad = true;
    });
    if (!bad && window.innerWidth < 1024) {
      var t = d.querySelector('.hero h1');
      var c = d.querySelector('.hero .c13');
      if (t && c && c.offsetHeight && t.offsetHeight > c.offsetHeight + 1) bad = true;
    }
    return bad;
  }
  function checkFit() {
    fitTimer = 0;
    if (!setkaCss || !media0 || h.classList.contains('setka')) return;
    if (setkaCss.getAttribute('media') !== media0) setkaCss.setAttribute('media', media0);
    h.classList.remove('setka-auto');
    // на компьютере (с 1024 px) лестница-плакат подгоняет размеры сама (style.css), сетка не нужна
    if (window.innerWidth >= 360 && window.innerWidth < 1024 && overflowing()) {
      setkaCss.setAttribute('media', 'all');
      h.classList.add('setka-auto');
    }
    queueSat();
  }
  function queueFit() { if (fitTimer) clearTimeout(fitTimer); fitTimer = setTimeout(checkFit, 60); }
  window.addEventListener('resize', queueFit);

  // ---------- квадраты проектов один раз вырастают от левого нижнего угла ----------
  (function () {
    var proj = d.querySelector('.proj');
    if (!proj) return;
    if (reduce || !('IntersectionObserver' in window)) { proj.classList.add('grown'); return; }
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { proj.classList.add('grown'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(proj);
  })();

  // ---------- старт ----------
  setRegion(saved, false);
  checkFit();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { checkFit(); });
  updateSat();
})();
