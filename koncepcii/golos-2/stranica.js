
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  var t = d.getElementById('today');
  if (t && window.Intl) {
    try {
      var now = new Date();
      var loc = t.getAttribute('data-lang') === 'en' ? 'en-GB' : 'ru-RU';
      var wd = new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(now);
      var parts = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(now);
      var dm = parts.filter(function (p) { return p.type === 'day' || p.type === 'month' || p.type === 'year'; }).map(function (p) { return p.value; });
      t.textContent = wd + ', ' + dm.join(' ');
      t.setAttribute('datetime', now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2));
    } catch (e) {  }
  }

  
  var feed = d.querySelector('.feed');
  var chips = d.querySelector('.chips');
  var more = d.querySelector('[data-more-btn]');
  var expanded = false, filter = 'all';
  function applyFeed() {
    if (!feed) return;
    var items = feed.querySelectorAll('li');
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var ok = filter === 'all' || (filter === 'lang-en' ? li.getAttribute('data-lang') === 'en' : li.getAttribute('data-country') === filter);
      var cut = filter === 'all' && !expanded && li.hasAttribute('data-more');
      li.classList.toggle('off', !ok || cut);
    }
    if (more) {
      more.hidden = filter !== 'all';
      more.textContent = expanded ? more.getAttribute('data-less') : more.getAttribute('data-more-t');
      more.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }
  if (chips) {
    chips.hidden = false;
    chips.addEventListener('click', function (ev) {
      var b = ev.target.closest('.chip'); if (!b) return;
      filter = b.getAttribute('data-f');
      var all = chips.querySelectorAll('.chip');
      for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i] === b ? 'true' : 'false');
      applyFeed();
    });
  }
  if (more) more.addEventListener('click', function () { expanded = !expanded; applyFeed(); });
  applyFeed();

  
  var toast = d.querySelector('.toast'), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }
  function copyText(s, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, function () {});
  }
  var shares = d.querySelectorAll('.share');
  for (var s = 0; s < shares.length; s++) {
    shares[s].hidden = false;
    shares[s].addEventListener('click', function () {
      var url = this.getAttribute('data-url'), title = this.getAttribute('data-title');
      if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      copyText(url, function () { say(toast.getAttribute('data-link-copied')); });
    });
  }
  var copies = d.querySelectorAll('.copy');
  for (var c = 0; c < copies.length; c++) {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) continue;
    copies[c].hidden = false;
    copies[c].addEventListener('click', function () {
      var b = this, ct = b.querySelector('.ct'), was = ct.textContent;
      copyText(b.getAttribute('data-copy'), function () {
        b.classList.add('done'); ct.textContent = b.getAttribute('data-done');
        setTimeout(function () { b.classList.remove('done'); ct.textContent = was; }, 1800);
      });
    });
  }

  
  var sheet = d.getElementById('sheet');
  if (sheet && typeof sheet.showModal === 'function') {
    var opener = d.querySelectorAll('[data-sheet]');
    for (var o = 0; o < opener.length; o++) {
      opener[o].addEventListener('click', function (ev) { ev.preventDefault(); sheet.showModal(); });
    }
    sheet.addEventListener('click', function (ev) {
      if (ev.target === sheet || ev.target.closest('[data-close]')) sheet.close();
    });
    var tabs = sheet.querySelectorAll('[role="tab"]');
    for (var k = 0; k < tabs.length; k++) {
      tabs[k].addEventListener('click', function () {
        for (var j = 0; j < tabs.length; j++) {
          var on = tabs[j] === this;
          tabs[j].setAttribute('aria-selected', on ? 'true' : 'false');
          d.getElementById(tabs[j].getAttribute('aria-controls')).hidden = !on;
        }
      });
    }
  }

  
  var fig = d.querySelector('.chart');
  if (fig) {
    if (!reduce && 'IntersectionObserver' in window) {
      fig.classList.add('wait');
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { fig.classList.remove('wait'); fig.classList.add('go'); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(fig);
    }
    var months = [];
    try { months = JSON.parse(fig.getAttribute('data-months') || '[]'); } catch (e) { months = []; }
    var plot = fig.querySelector('.plot'), tip = fig.querySelector('.tip'), svg = fig.querySelector('svg');
    var rects = svg ? svg.querySelectorAll('rect') : [];
    var step = 9, last = -1;
    function sqr(cls) { return '<span class="lg ' + cls + '"></span> '; }
    function show(clientX) {
      if (!months.length) return;
      var r = svg.getBoundingClientRect();
      var vbW = months.length * step - 1;
      var x = (clientX - r.left) / r.width * vbW;
      var i = Math.max(0, Math.min(months.length - 1, Math.floor(x / step)));
      if (i === last) return; last = i;
      var m = months[i];
      tip.innerHTML = m.m.slice(5) + '.' + m.m.slice(0, 4) + ': ' + (m.ru + m.ca + m.un) + ' &nbsp;' + sqr('r') + m.ru + ' ' + sqr('c') + m.ca + ' ' + sqr('u') + m.un;
      tip.hidden = false;
      var left = (i * step + 4) / vbW * r.width;
      left = Math.max(70, Math.min(r.width - 70, left));
      tip.style.left = left + 'px';
      for (var q = 0; q < rects.length; q++) {
        var rx = +rects[q].getAttribute('x');
        rects[q].classList.toggle('hl', Math.round(rx / step) !== i);
      }
    }
    function hide() { tip.hidden = true; last = -1; for (var q = 0; q < rects.length; q++) rects[q].classList.remove('hl'); }
    if (plot && svg && tip) {
      plot.addEventListener('pointermove', function (ev) { show(ev.clientX); });
      plot.addEventListener('pointerdown', function (ev) { show(ev.clientX); });
      plot.addEventListener('pointerleave', hide);
      plot.addEventListener('pointercancel', hide);
    }
  }
})();
