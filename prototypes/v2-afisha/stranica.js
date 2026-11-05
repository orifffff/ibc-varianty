
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
  var qsa = function (sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); };
  var data = {};
  try { data = JSON.parse(d.getElementById('v2-dannye').textContent); } catch (e) { data = {}; }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =====================================================================================
  // Часть 1. Общая механика
  // =====================================================================================

  // ---------- «сегодня»: дата по Алматы; ?data=2027-04-16 показывает страницу на эту дату ----------
  function almatyToday() {
    try {
      var s = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    } catch (e) {  }
    return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
  }
  var q = /[?&]data=(\d{4}-\d{2}-\d{2})(?:&|$)/.exec(location.search);
  var today = q ? q[1] : almatyToday();
  var days = function (a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); };

  // ---------- живая строка для диктора ----------
  var live = d.createElement('p');
  live.className = 'sr-live';
  live.setAttribute('aria-live', 'polite');
  d.body.appendChild(live);
  function say(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }

  // ---------- копирование ----------
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).catch(function () { return fallbackCopy(t); });
    }
    return fallbackCopy(t);
  }
  function fallbackCopy(t) {
    return new Promise(function (ok, fail) {
      var ta = d.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
      d.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = d.execCommand('copy'); } catch (e) { done = false; }
      d.body.removeChild(ta);
      if (done) ok(); else fail(new Error('copy'));
    });
  }
  // значение в строке на 1,5 с сменяется на «Скопировано»
  function flash(row, btn) {
    var val = row ? row.querySelector('[data-val]') : null;
    if (val && !val.getAttribute('data-was')) {
      val.setAttribute('data-was', val.innerHTML);
      val.textContent = data.copied || '';
    }
    if (btn) btn.classList.add('is-done');
    say(data.copied || '');
    clearTimeout(row && row._t);
    var t = setTimeout(function () {
      if (val && val.getAttribute('data-was') != null) { val.innerHTML = val.getAttribute('data-was'); val.removeAttribute('data-was'); }
      if (btn) btn.classList.remove('is-done');
    }, 1500);
    if (row) row._t = t;
  }
  qsa('button[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var row = b.closest('.reg-row');
      copyText(b.getAttribute('data-copy')).then(function () { flash(row, b); }, function () {});
    });
  });
  // звонок на компьютере (мышь) копирует номер; ссылка tel: остается для телефона и без скрипта
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    qsa('a[data-call-copy]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var row = a.closest('.reg-row');
        copyText(a.getAttribute('data-call-copy')).then(function () { flash(row, row ? row.querySelector('button[data-copy]') : null); }, function () {});
      });
    });
  }

  // ---------- «Поделиться»: системное окно или копия адреса ----------
  qsa('.share-s').forEach(function (s) {
    s.addEventListener('click', function (ev) {
      ev.preventDefault();
      var sh = data.share || {};
      if (navigator.share) {
        navigator.share({ title: sh.title, text: sh.text, url: sh.url }).catch(function () {});
        return;
      }
      var label = s.querySelector('[data-share-t]');
      copyText(sh.url || location.href).then(function () {
        if (!label) return;
        if (!label.getAttribute('data-was')) label.setAttribute('data-was', label.textContent);
        label.textContent = data.linkCopied || '';
        say(data.linkCopied || '');
        setTimeout(function () { label.textContent = label.getAttribute('data-was'); label.removeAttribute('data-was'); }, 1500);
      }, function () { s.parentNode.open = !s.parentNode.open; });
    });
  });

  // ---------- регион: «Центральная Азия | Россия» ----------
  var tabs = qsa('.reg-tab[data-region]');
  function setRegion(r, save) {
    if (r === 'ru') html.setAttribute('data-region', 'ru'); else html.removeAttribute('data-region');
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-region') === (r === 'ru' ? 'ru' : 'ca') ? 'true' : 'false'); });
    if (save) { try { localStorage.setItem('ibc-region', r === 'ru' ? 'ru' : 'ca'); } catch (e) {  } }
  }
  tabs.forEach(function (t) {
    t.setAttribute('role', 'button');
    t.addEventListener('click', function (ev) { ev.preventDefault(); setRegion(t.getAttribute('data-region'), true); });
    t.addEventListener('keydown', function (ev) { if (ev.key === ' ') { ev.preventDefault(); setRegion(t.getAttribute('data-region'), true); } });
  });
  setRegion(html.getAttribute('data-region') === 'ru' ? 'ru' : 'ca', false);

  // ---------- язык с сохранением места: к ссылке RU | EN дописывается раздел, который сейчас на экране ----------
  var langLinks = qsa('a[data-track="links.ru.lang_switch"]');
  langLinks.forEach(function (a) { a.setAttribute('data-base', a.getAttribute('href').split('#')[0]); });
  var secIds = ['bilet', 'sobytiya', 'zadacha', 'uslugi', 'pressa', 'sayty', 'socseti', 'kontakty'];
  if ('IntersectionObserver' in window) {
    var current = '';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target.id; });
      if (window.scrollY < 40) current = '';
      langLinks.forEach(function (a) { a.setAttribute('href', a.getAttribute('data-base') + (current ? '#' + current : '')); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secIds.forEach(function (id) { var el = d.getElementById(id); if (el) io.observe(el); });
  }

  // ---------- подсказка языка: слой над панелью связи, страница под ним не сдвигается ----------
  (function () {
    var h = data.hint;
    if (!h) return;
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf(h.when) !== 0) return;
    try { if (localStorage.getItem('ibc-lang-hint')) return; } catch (e) {  }
    var box = d.createElement('div');
    box.className = 'hint';
    var a = d.createElement('a');
    a.className = 'hint-a';
    a.href = h.href;
    a.lang = h.lang;
    a.hreflang = h.lang;
    a.setAttribute('data-track', 'links.ru.lang_switch');
    a.setAttribute('data-track-place', (data.place || 'v2') + '.podskazka');
    var at = d.createElement('span');
    at.textContent = h.text;
    a.appendChild(at);
    a.insertAdjacentHTML('beforeend', '<svg class="ico" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/></svg>');
    var x = d.createElement('button');
    x.type = 'button';
    x.className = 'hint-x';
    x.setAttribute('aria-label', h.close);
    x.innerHTML = '<svg class="ico" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var close = function () {
      if (box.parentNode) box.parentNode.removeChild(box);
      d.removeEventListener('keydown', onEsc);
      try { localStorage.setItem('ibc-lang-hint', '1'); } catch (e) {  }
    };
    var onEsc = function (ev) { if (ev.key === 'Escape') close(); };
    x.addEventListener('click', close);
    d.addEventListener('keydown', onEsc);
    box.appendChild(a);
    box.appendChild(x);
    d.body.appendChild(box);
    if (window.ibcTrack && ibcTrack.bind) ibcTrack.bind();
  })();

  // =====================================================================================
  // Часть 2. Билет, программа, капсулы
  // =====================================================================================

  // ---------- «через N дней» по формам из content.json ----------
  function cherez(n) {
    var f = data.cherez || [];
    var put = function (s) { return String(s || '').replace('{n} ', n + ' ').replace('{n}', n); };
    if (data.lang === 'ru') {
      if (n === 0) return f[3] || '';
      if (n === 1) return f[4] || '';
      var a = n % 100, b = n % 10;
      return put(a > 10 && a < 20 ? f[2] : b === 1 ? f[0] : b >= 2 && b <= 4 ? f[1] : f[2]);
    }
    if (n === 0) return f[2] || '';
    if (n === 1) return f[3] || '';
    return put(n === 1 ? f[0] : f[1]);
  }

  // ---------- выбор билета: первое событие не раньше сегодняшнего дня (Алматы) ----------
  var tickets = qsa('[data-bilet]');
  var first = null;
  tickets.forEach(function (t) { if (!first && t.getAttribute('data-date') >= today) first = t; });
  tickets.forEach(function (t) { t.hidden = t !== first; });
  qsa('[data-prog]').forEach(function (r) {
    r.hidden = r.getAttribute('data-date') < today || (!!first && r.getAttribute('data-key') === first.getAttribute('data-key'));
  });
  qsa('[data-until]').forEach(function (r) { r.hidden = today > r.getAttribute('data-until'); });
  var empty = d.querySelector('[data-pusto]');
  if (empty) empty.hidden = !!first;
  var sob = d.getElementById('sobytiya');
  if (sob) sob.classList.toggle('is-pusto', !first);
  if (first) {
    var c = first.querySelector('[data-cherez]');
    if (c) c.textContent = cherez(days(today, first.getAttribute('data-date')));
  }

  // ---------- перещелкивание даты (один раз за сеанс) и перфорация ----------
  function endFlip() { html.classList.remove('flip-wait'); }
  (function () {
    if (!html.classList.contains('flip-wait')) return;
    try { sessionStorage.setItem('ibc-v2-flip', '1'); } catch (e) {  }
    var num = first ? first.querySelector('[data-num]') : null;
    var holes = first ? first.querySelector('.holes') : null;
    if (reduce || !num || !num.animate) { endFlip(); return; }
    var lh = parseFloat(getComputedStyle(num).lineHeight) || num.getBoundingClientRect().height;
    var ds = qsa('.d', num);
    var anims = [];
    var last = 0;
    // настоящая дата остается в разметке (ее читает диктор), на время прокрутки она прозрачна под полосой цифр
    num.classList.add('rolling');
    ds.forEach(function (el, i) {
      var v = parseInt(el.textContent, 10) || 0;
      var reel = d.createElement('span');
      reel.className = 'reel';
      reel.setAttribute('aria-hidden', 'true');
      for (var k = 0; k <= v; k++) { var s = d.createElement('span'); s.textContent = String(k); reel.appendChild(s); }
      el.appendChild(reel);
      last = Math.max(last, i * 70 + 600);
      anims.push(reel.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-v * lh) + 'px)' }],
        { duration: 600, delay: i * 70, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'both' }
      ));
    });
    // перфорация проявляется сразу после даты: запускается вместе с ней, с задержкой (одна шкала времени)
    if (holes && holes.animate) {
      anims.push(holes.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 300, delay: last, easing: 'ease-out', fill: 'backwards' }));
    }
    endFlip();
    var done = function () {
      qsa('.reel', num).forEach(function (r) { r.parentNode.removeChild(r); });
      num.classList.remove('rolling');
    };
    Promise.all(anims.map(function (a) { return a.finished; })).then(done, done);
  })();

  // ---------- капсулы задач: WhatsApp выбранного региона с готовой фразой и задачей ----------
  qsa('[data-kap]').forEach(function (a) {
    a.addEventListener('click', function () {
      var wa = (data.wa || {})[html.getAttribute('data-region') === 'ru' ? 'ru' : 'ca'];
      var t = a.querySelector('.kap-t');
      var task = (t ? t.textContent : '').replace(/\s+/g, ' ').trim();
      if (wa) a.setAttribute('href', wa + '?text=' + encodeURIComponent((data.prefill || '') + (task ? ' ' + task : '')));
    });
  });
})();
