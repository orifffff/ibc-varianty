/* Схема Tashkent Logistics Hub. Один рисунок, который плавно перекладывается из объемного вида в план и обратно.
   На кровле точки сетки колонн 12 × 24 м, выбранный блок белый. Размеры блоков с плана на greystar.asia. Буквы A-D условные. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', K = 0.866, H = 9, G = 1.6;
  var MONO = 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Consolas, monospace';
  var BLOCKS = [
    { id: 'A', x0: 24,  y0: 0,  x1: 108, y1: 85,  area: 7140,  docks: 17, w: 84,  d: 85, side: 'n' },
    { id: 'B', x0: 108, y0: 0,  x1: 252, y1: 85,  area: 12240, docks: 30, w: 144, d: 85, side: 'n' },
    { id: 'C', x0: 0,   y0: 85, x1: 108, y1: 157, area: 7776,  docks: 23, w: 108, d: 72, side: 's' },
    { id: 'D', x0: 108, y0: 85, x1: 252, y1: 157, area: 10368, docks: 32, w: 144, d: 72, side: 's' }
  ];
  var C = {
    roof: '#16268a', south: '#0c1767', east: '#101d74', line: 'rgba(255,255,255,0.26)', dot: 'rgba(255,255,255,0.3)',
    text: '#ffffff', sub: 'rgba(255,255,255,0.62)', dock: 'rgba(255,255,255,0.42)', dim: 'rgba(255,255,255,0.5)',
    onRoof: '#ffffff', onSouth: '#b9c8e6', onEast: '#d5dff1', onText: '#071357', onSub: 'rgba(7,19,87,0.72)', onDot: 'rgba(7,19,87,0.3)'
  };
  var VB3 = [-150, -30, 382, 255], VBP = [-36, -34, 339, 226];   /* поля вида: объем и план, одно соотношение сторон */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function el(n, at, parent) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function lerp(a, b, k) { return a + (b - a) * k; }

  function create(host, onToggle) {
    var t = 0, upd = [], parts = {}, raf = 0;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* точка: при t = 0 объемная проекция, при t = 1 вид сверху */
    function pr(x, y, z) { return [lerp((x - y) * K, x, t), lerp((x + y) * 0.5 - (z || 0), y, t)]; }
    function pts(a) { return a.map(function (p) { var q = pr(p[0], p[1], p[2]); return q[0].toFixed(2) + ',' + q[1].toFixed(2); }).join(' '); }
    function poly(parent, a, at) { var e = el('polygon', at, parent); upd.push(function () { e.setAttribute('points', pts(a)); }); return e; }
    /* надпись лежит на кровле и поворачивается вместе с ней */
    function label(parent, s, at, pos) {
      var g = el('g', {}, parent), e = el('text', at, g); e.textContent = s;
      upd.push(function () {
        var p = pos(), q = pr(p[0], p[1], H);
        g.setAttribute('transform', 'matrix(' + lerp(K, 1, t).toFixed(4) + ' ' + lerp(0.5, 0, t).toFixed(4) + ' ' + lerp(-K, 0, t).toFixed(4) + ' ' + lerp(0.5, 1, t).toFixed(4) + ' ' + q[0].toFixed(2) + ' ' + q[1].toFixed(2) + ')');
      });
      return e;
    }

    var svg = el('svg', { role: 'group', 'aria-label': 'Схема: четыре блока комплекса' }, host);
    svg.style.cssText = 'width:100%;height:auto;display:block;overflow:visible';

    /* размеры: видны только на плане */
    var dims = el('g', {}, svg);
    function dimH(xa, xb, y, s, up) {
      el('line', { x1: xa, y1: y, x2: xb, y2: y, stroke: C.dim, 'stroke-width': 0.4 }, dims);
      [xa, xb].forEach(function (x) { el('line', { x1: x, y1: y - 2.5, x2: x, y2: y + 2.5, stroke: C.dim, 'stroke-width': 0.4 }, dims); });
      el('text', { x: (xa + xb) / 2, y: y + (up ? -3.5 : 8.5), 'text-anchor': 'middle', 'font-size': 6.6, 'font-family': MONO, fill: C.dim }, dims).textContent = s;
    }
    function dimV(x, ya, yb, s) {
      el('line', { x1: x, y1: ya, x2: x, y2: yb, stroke: C.dim, 'stroke-width': 0.4 }, dims);
      [ya, yb].forEach(function (y) { el('line', { x1: x - 2.5, y1: y, x2: x + 2.5, y2: y, stroke: C.dim, 'stroke-width': 0.4 }, dims); });
      el('text', { x: x + 5, y: (ya + yb) / 2 + 2.3, 'font-size': 6.6, 'font-family': MONO, fill: C.dim }, dims).textContent = s;
    }
    dimH(24, 252, -22, '228 м', true); dimH(0, 252, 179, '252 м', false); dimV(262, 0, 85, '85 м'); dimV(262, 85, 157, '72 м');

    /* доки */
    BLOCKS.forEach(function (b) {
      var n = Math.round(b.docks / 2), y = b.side === 'n' ? b.y0 - 9 : b.y1 + 4;
      for (var i = 0; i < n; i++) (function (dx) {
        poly(svg, [[dx - 1.7, y], [dx + 1.7, y], [dx + 1.7, y + 5], [dx - 1.7, y + 5]], { fill: C.dock });
      })(b.x0 + 5 + (b.x1 - b.x0 - 10) * i / (n - 1));
    });

    /* блоки */
    BLOCKS.forEach(function (b) {
      var x0 = b.x0 + G, x1 = b.x1 - G, y0 = b.y0 + G, y1 = b.y1 - G, g = el('g', {}, svg), o = { on: false, g: g, dots: [] };
      g.setAttribute('class', 'pb'); g.setAttribute('data-id', b.id); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
      g.setAttribute('aria-pressed', 'false'); g.setAttribute('aria-label', 'Блок ' + b.id + ', ' + fmt(b.area) + ' м²');
      g.style.cssText = 'cursor:pointer;outline:none;transition:transform .3s ease';
      el('title', {}, g).textContent = 'Блок ' + b.id + ': ' + fmt(b.area) + ' м², доков: ' + b.docks + ', ' + b.w + ' × ' + b.d + ' м';
      g.addEventListener('click', function () { if (onToggle) onToggle(b.id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onToggle) onToggle(b.id); } });
      var side = { stroke: C.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' };
      o.south = poly(g, [[x0, y1, 0], [x1, y1, 0], [x1, y1, H], [x0, y1, H]], side); o.south.setAttribute('fill', C.south);
      o.east = poly(g, [[x1, y0, 0], [x1, y1, 0], [x1, y1, H], [x1, y0, H]], side); o.east.setAttribute('fill', C.east);
      o.roof = poly(g, [[x0, y0, H], [x1, y0, H], [x1, y1, H], [x0, y1, H]], side); o.roof.setAttribute('fill', C.roof);
      for (var xx = b.x0 + 12; xx < b.x1 - 3; xx += 12) for (var yy = b.y0 + 12; yy < b.y1 - 6; yy += 24) (function (cx, cy) {
        if ((cx < b.x0 + 30 && cy < b.y0 + 34) || (cx < b.x0 + 56 && cy > b.y1 - 28)) return;
        var c = el('circle', { r: 0.9, fill: C.dot }, g); o.dots.push(c);
        upd.push(function () { var q = pr(cx, cy, H); c.setAttribute('cx', q[0].toFixed(2)); c.setAttribute('cy', q[1].toFixed(2)); });
      })(xx, yy);
      o.L = label(g, b.id, { 'font-size': 22, 'font-weight': 300, fill: C.text }, function () { return [x0 + 8, y0 + 25]; });
      o.A = label(g, fmt(b.area) + ' м²', { 'font-size': 7.4, 'font-family': MONO, 'letter-spacing': 0.4, fill: C.sub }, function () { return [x0 + 8, y1 - 7 - 10 * t]; });
      o.S = label(g, b.w + ' × ' + b.d + ' м', { 'font-size': 6.6, 'font-family': MONO, fill: C.sub }, function () { return [x0 + 8, y1 - 7]; });
      parts[b.id] = o;
    });
    [].forEach.call(svg.querySelectorAll('polygon, circle, text'), function (n) { n.style.transition = 'fill .3s ease'; });

    function paint(o) {
      var on = o.on;
      o.g.setAttribute('aria-pressed', on);
      o.g.style.transform = on && t < 0.999 ? 'translateY(' + (-7 * (1 - t)).toFixed(2) + 'px)' : '';
      o.roof.setAttribute('fill', on ? C.onRoof : C.roof);
      o.south.setAttribute('fill', on ? C.onSouth : C.south); o.east.setAttribute('fill', on ? C.onEast : C.east);
      o.L.setAttribute('fill', on ? C.onText : C.text);
      o.A.setAttribute('fill', on ? C.onSub : C.sub); o.S.setAttribute('fill', on ? C.onSub : C.sub);
      o.dots.forEach(function (d) { d.setAttribute('fill', on ? C.onDot : C.dot); });
    }
    function draw() {
      var vb = VB3.map(function (v, i) { return lerp(v, VBP[i], t).toFixed(2); }), far = Math.max(0, (t - 0.55) / 0.45), flat = t > 0.995;
      svg.setAttribute('viewBox', vb.join(' '));
      for (var i = 0; i < upd.length; i++) upd[i]();
      dims.setAttribute('opacity', far.toFixed(3));
      BLOCKS.forEach(function (b) {
        var o = parts[b.id];
        o.S.setAttribute('opacity', far.toFixed(3));
        o.south.style.display = o.east.style.display = flat ? 'none' : '';
        o.g.style.transform = o.on && !flat ? 'translateY(' + (-7 * (1 - t)).toFixed(2) + 'px)' : '';
      });
    }
    draw();

    return {
      setActive: function (ids) { BLOCKS.forEach(function (b) { var o = parts[b.id]; o.on = ids.indexOf(b.id) !== -1; paint(o); }); },
      /* плавный переход между видами, около секунды */
      setView: function (v) {
        var to = v === 'plan' ? 1 : 0, from = t, t0 = null, dur = 950;
        cancelAnimationFrame(raf);
        if (still || from === to) { t = to; draw(); return; }
        BLOCKS.forEach(function (b) { parts[b.id].g.style.transition = 'none'; });
        function step(ts) {
          if (t0 === null) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          t = lerp(from, to, e); draw();
          if (k < 1) raf = requestAnimationFrame(step);
          else BLOCKS.forEach(function (b) { parts[b.id].g.style.transition = 'transform .3s ease'; });
        }
        raf = requestAnimationFrame(step);
      }
    };
  }
  window.TLHPlan = { create: create, BLOCKS: BLOCKS, fmt: fmt };
})();
