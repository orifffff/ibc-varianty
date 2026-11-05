
(function () {
  'use strict';
  var d = document;
  var h = d.documentElement;
  var b = d.body;
  var each = function (sel, fn, root) { Array.prototype.forEach.call((root || d).querySelectorAll(sel), fn); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) {  } }
  };
  var S = { copied: b.getAttribute('data-s-copied') || '', linkCopied: b.getAttribute('data-s-link-copied') || '' };
  var live = d.getElementById('v1-live');
  function say(t) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = t; }, 40);
  }

  // ---------- 1. «Сегодня» по Алматы или ?data=ГГГГ-ММ-ДД ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    var m = /[?&]data=(\d{4}-\d{2}-\d{2})\b/.exec(location.search);
    if (m) return m[1];
    try {
      var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      var o = {};
      p.forEach(function (x) { o[x.type] = x.value; });
      if (o.year && o.month && o.day) return o.year + '-' + o.month + '-' + o.day;
    } catch (e) {  }
    var t = new Date();
    return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }
  var now = today();
  // событие видно до конца своего дня; строка ролика видна по дату data-until включительно
  each('[data-date]', function (el) { if (el.getAttribute('data-date') < now) el.parentNode.removeChild(el); });
  each('[data-until]', function (el) { if (el.getAttribute('data-until') < now) el.parentNode.removeChild(el); });
  each('[data-dates]', function (box) { if (!box.querySelector('[data-date]')) box.parentNode.removeChild(box); });

  // ---------- 2. Регион ----------
  var contacts = d.getElementById('kontakty');
  var tabs = [];
  each('.tab[data-region]', function (t) { tabs.push(t); });
  function region() { return h.getAttribute('data-region') === 'ru' ? 'ru' : 'ca'; }
  function paintTabs() {
    var r = region();
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-region') === r ? 'true' : 'false'); });
  }
  function setRegion(r) {
    if (r === region()) return;
    if (r === 'ru') h.setAttribute('data-region', 'ru'); else h.removeAttribute('data-region');
    store.set('ibc-region', r);
    paintTabs();
    if (contacts) {
      contacts.classList.remove('swap');
      void contacts.offsetWidth;
      contacts.classList.add('swap');
    }
    onScroll();
  }
  tabs.forEach(function (t) {
    // без скрипта это ссылки на свой регион ниже; со скриптом кнопки-переключатели
    t.setAttribute('role', 'button');
    t.addEventListener('click', function (e) { e.preventDefault(); setRegion(t.getAttribute('data-region')); });
    t.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); setRegion(t.getAttribute('data-region')); }
    });
  });
  paintTabs();

  // ---------- 3. Копирование ----------
  function legacyCopy(text) {
    var ta = d.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
    b.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = d.execCommand('copy'); } catch (e) { ok = false; }
    b.removeChild(ta);
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  // текст значения на 1,5 с сменяется на «Скопировано» с проявлением за 200 мс
  function flash(el, text) {
    if (!el || !text) return;
    if (el.v1Timer) clearTimeout(el.v1Timer); else el.v1Orig = el.innerHTML;
    el.textContent = text;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    el.v1Timer = setTimeout(function () {
      el.innerHTML = el.v1Orig;
      el.classList.remove('flash');
      el.v1Timer = null;
    }, 1500);
    say(text);
  }
  each('.copy[data-copy]', function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy')).then(function (ok) {
        if (!ok) return;
        flash(d.getElementById(btn.getAttribute('data-flash')), S.copied);
        btn.classList.add('is-done');
        clearTimeout(btn.v1Timer);
        btn.v1Timer = setTimeout(function () { btn.classList.remove('is-done'); }, 1500);
      });
    });
  });
  // на компьютере (мышь) нажатие на номер копирует его: звонить с компьютера некуда
  var fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  each('[data-desk-copy]', function (a) {
    a.addEventListener('click', function (e) {
      if (!fine || !fine.matches) return;
      e.preventDefault();
      copyText(a.getAttribute('data-desk-copy')).then(function (ok) {
        if (ok) flash(d.getElementById(a.getAttribute('data-flash')), S.copied);
      });
    });
  });

  // ---------- 4. Поделиться ----------
  each('[data-share]', function (btn) {
    btn.disabled = false;
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-url');
      var label = btn.querySelector('.sh-t');
      if (navigator.share) {
        navigator.share({ title: btn.getAttribute('data-title') || '', text: btn.getAttribute('data-text') || '', url: url }).catch(function () {  });
        return;
      }
      copyText(url).then(function (ok) { if (ok) flash(label, S.linkCopied); });
    });
  });

  // ---------- 5. Язык с сохранением места и подсказка языка ----------
  var langLinks = [];
  each('.lang-switch a[hreflang], .hint-a', function (a) { langLinks.push({ a: a, base: a.getAttribute('href').split('#')[0] }); });
  var spots = [];
  each('#kontakty, main .sec[id]', function (s) { spots.push(s); });
  function currentSpot() {
    var mid = window.innerHeight * 0.45;
    var id = '';
    for (var i = 0; i < spots.length; i++) {
      var r = spots[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom > 0) id = spots[i].id;
    }
    if (window.scrollY < 40) id = '';
    return id;
  }
  var lastSpot = null;
  function updateLang() {
    var id = currentSpot();
    if (id === lastSpot) return;
    lastSpot = id;
    langLinks.forEach(function (x) { x.a.setAttribute('href', x.base + (id ? '#' + id : '')); });
  }

  var dock = d.getElementById('v1-dock');
  var hint = d.getElementById('v1-hint');
  if (dock && hint) {
    var nl = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    var pageLang = (h.getAttribute('lang') || '').toLowerCase();
    var want = pageLang === 'ru' ? nl.indexOf('en') === 0 : nl.indexOf('ru') === 0;
    if (want && store.get('ibc-lang-hint') !== 'closed') dock.classList.add('hint-on');
    var x = hint.querySelector('.hint-x');
    if (x) {
      x.addEventListener('click', function () {
        dock.classList.remove('hint-on');
        store.set('ibc-lang-hint', 'closed');
      });
    }
    d.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && dock.classList.contains('hint-on')) {
        dock.classList.remove('hint-on');
        store.set('ibc-lang-hint', 'closed');
      }
    });
  }

  // ---------- 6. Полоса связи (телефон): видна, когда блок контактов ушел за экран, и не видна у подвала ----------
  var bar = dock ? dock.querySelector('.cbar') : null;
  var foot = d.querySelector('.foot');
  var phone = window.matchMedia ? window.matchMedia('(max-width: 1023.98px)') : null;
  function updateBar() {
    if (!dock || !bar || !contacts) return;
    var vh = window.innerHeight;
    var c = contacts.getBoundingClientRect();
    var f = foot ? foot.getBoundingClientRect() : null;
    var contactsGone = c.bottom < 0;
    var footSeen = f ? f.top < vh : false;
    var on = !!(phone && phone.matches) && contactsGone && !footSeen;
    if (on !== dock.classList.contains('bar-on')) {
      dock.classList.toggle('bar-on', on);
      if (on) h.style.setProperty('--bar-h', bar.offsetHeight + 'px');
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateLang();
      updateBar();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---------- 7. Печать: раскрыть все услуги и публикации, после печати вернуть как было ----------
  var opened = [];
  window.addEventListener('beforeprint', function () {
    opened = [];
    each('details', function (el) { if (!el.open) { el.open = true; opened.push(el); } });
  });
  window.addEventListener('afterprint', function () {
    opened.forEach(function (el) { el.open = false; });
    opened = [];
  });
})();
