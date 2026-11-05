
(function () {
  'use strict';
  var d = document, h = d.documentElement, b = d.body;
  var live = d.getElementById('k1-live');
  var timer = 0;

  function toast(text) {
    if (!live || !text) return;
    live.textContent = text;
    live.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { live.classList.remove('on'); live.textContent = ''; }, 1500);
  }

  function copyText(text, done) {
    function fallback() {
      var t = d.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
      b.appendChild(t); t.select();
      try { d.execCommand('copy'); done(); } catch (e) {  }
      b.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  // регион
  var tabs = d.querySelectorAll('.tab[data-r]');
  function setRegion(r, save) {
    h.setAttribute('data-region', r);
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute('aria-pressed', tabs[i].getAttribute('data-r') === r ? 'true' : 'false');
    if (save) { try { localStorage.setItem('ibc-region', r); } catch (e) {  } }
  }
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].setAttribute('role', 'button');
    tabs[i].addEventListener('click', function (ev) { ev.preventDefault(); setRegion(this.getAttribute('data-r'), true); });
    tabs[i].addEventListener('keydown', function (ev) { if (ev.key === ' ') { ev.preventDefault(); this.click(); } });
  }
  setRegion(h.getAttribute('data-region') === 'ru' ? 'ru' : 'ca', false);

  // копирование
  d.addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('[data-copy]') : null;
    if (!btn) return;
    copyText(btn.getAttribute('data-copy'), function () {
      btn.classList.add('done');
      setTimeout(function () { btn.classList.remove('done'); }, 1500);
      toast(b.getAttribute('data-s-copied'));
    });
  });

  // «Поделиться»: системное меню, без него адрес копируется
  var sh = d.querySelector('[data-share]');
  if (sh) {
    sh.disabled = false;
    sh.addEventListener('click', function () {
      var url = sh.getAttribute('data-url');
      if (navigator.share) {
        navigator.share({ title: sh.getAttribute('data-title'), text: sh.getAttribute('data-text'), url: url }).catch(function () {});
      } else {
        copyText(url, function () { toast(b.getAttribute('data-s-link-copied')); });
      }
    });
  }

  // нижняя панель: видна, когда ряд действий ушел вверх за экран
  var act = d.getElementById('svyaz'), dock = d.getElementById('k1-dock');
  if (act && dock && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var e0 = en[0];
      dock.classList.toggle('on', !e0.isIntersecting && e0.boundingClientRect.top < 0);
    }).observe(act);
  }

  // статус офиса: точка темно-синяя пн-пт 9:00-18:00 по Алматы (UTC+5), иначе серая; праздники не учитываются
  var dot = d.getElementById('k1-dot');
  if (dot) {
    var a = new Date(Date.now() + 5 * 3600 * 1000);
    var day = a.getUTCDay(), hr = a.getUTCHours();
    dot.classList.toggle('off', !(day >= 1 && day <= 5 && hr >= 9 && hr < 18));
  }

  // прошедшие события скрываются по дате телефона (сборка уже убрала прошедшие на дату сборки)
  var m = /[?&]data=(\d{4}-\d{2}-\d{2})/.exec(location.search);
  var today = m ? m[1] : new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
  var evs = d.querySelectorAll('.ev[data-date]'), left = 0;
  for (var j = 0; j < evs.length; j++) {
    if (evs[j].getAttribute('data-date') < today) evs[j].hidden = true; else left++;
  }
  var vids = d.querySelectorAll('[data-until]');
  for (var k = 0; k < vids.length; k++) if (vids[k].getAttribute('data-until') < today) vids[k].hidden = true;
  if (evs.length && !left) { var list = d.querySelector('.evs'); if (list) list.classList.add('empty'); }
})();
