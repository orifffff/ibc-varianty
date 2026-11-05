
(function () {
  'use strict';
  var KEY = 'ibc-track';
  var MAX = 300;

  function read() {
    try { return JSON.parse(window.localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }

  function save(list) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); } catch (e) {  }
  }

  function send(ev) {
    var list = read();
    list.push(ev);
    save(list);
    if (window.console && console.log) console.log('[track]', ev.id + (ev.place ? ' @ ' + ev.place : ''), ev);
  }

  function onPress(e) {
    if (e.type === 'auxclick' && e.button !== 1) return; // средняя кнопка мыши: открыть в новой вкладке
    var el = e.currentTarget;
    send({
      id: el.getAttribute('data-track'),
      place: el.getAttribute('data-track-place') || '',
      href: el.getAttribute('href') || '',
      lang: document.documentElement.getAttribute('lang') || '',
      time: new Date().toISOString(),
      page: (location.pathname.split('/').pop() || 'index.html')
    });
  }

  function bind() {
    var els = document.querySelectorAll('[data-track]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-track-bound')) continue;
      el.setAttribute('data-track-bound', '1');
      el.addEventListener('click', onPress);
      el.addEventListener('auxclick', onPress);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  window.ibcTrack = {
    list: read,
    clear: function () { save([]); },
    bind: bind
  };
})();
