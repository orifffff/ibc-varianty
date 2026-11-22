/* Схема Tashkent Logistics Hub в двух видах: объемный и план. На кровле точки сетки колонн 12 × 24 м, выбранный блок белый. Размеры блоков с плана на greystar.asia. Буквы A-D условные. */
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
    roof: '#16268a', south: '#0c1767', east: '#101d74', line: 'rgba(255,255,255,0.26)', rack: 'rgba(255,255,255,0.3)',
    text: '#ffffff', sub: 'rgba(255,255,255,0.62)', dock: 'rgba(255,255,255,0.42)', dim: 'rgba(255,255,255,0.5)',
    onRoof: '#ffffff', onSouth: '#b9c8e6', onEast: '#d5dff1', onText: '#071357', onSub: 'rgba(7,19,87,0.72)', onRack: 'rgba(7,19,87,0.3)'
  };
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function P(x, y, z) { return [((x - y) * K).toFixed(2), ((x + y) * 0.5 - (z || 0)).toFixed(2)]; }
  function pts(a) { return a.map(function (p) { return P(p[0], p[1], p[2]).join(','); }).join(' '); }
  function el(n, at, parent) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  function txt(parent, s, at) { var t = el('text', at, parent); t.textContent = s; return t; }

  function create(host, onToggle) {
    var parts = {}, views = {};
    function bind(g, b) {
      g.setAttribute('class', 'pb'); g.setAttribute('data-id', b.id); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
      g.setAttribute('aria-pressed', 'false'); g.setAttribute('aria-label', 'Блок ' + b.id + ', ' + fmt(b.area) + ' м²');
      g.style.cssText = 'cursor:pointer;outline:none;transition:transform .3s ease';
      g.addEventListener('click', function () { if (onToggle) onToggle(b.id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onToggle) onToggle(b.id); } });
    }
    function keep(id, o) { (parts[id] = parts[id] || []).push(o); }

    /* объемный вид */
    var s3 = el('svg', { viewBox: '-150 -20 382 236', role: 'group', 'aria-label': 'Объемная схема: четыре блока' }, host);
    s3.style.cssText = 'width:100%;height:auto;display:block;overflow:visible';
    BLOCKS.forEach(function (b) {
      var n = Math.round(b.docks / 2), i, dx, y = b.side === 'n' ? b.y0 - 9 : b.y1 + 4;
      for (i = 0; i < n; i++) {
        dx = b.x0 + 5 + (b.x1 - b.x0 - 10) * i / (n - 1);
        el('polygon', { points: pts([[dx - 1.9, y], [dx + 1.9, y], [dx + 1.9, y + 5], [dx - 1.9, y + 5]]), fill: C.dock }, s3);
      }
    });
    BLOCKS.forEach(function (b) {
      var x0 = b.x0 + G, x1 = b.x1 - G, y0 = b.y0 + G, y1 = b.y1 - G, g = el('g', {}, s3), o = { on: false, g: g, lift: true, racks: [] }, k, xx, c, L, A;
      bind(g, b);
      o.south = el('polygon', { points: pts([[x0, y1, 0], [x1, y1, 0], [x1, y1, H], [x0, y1, H]]), fill: C.south, stroke: C.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      o.east = el('polygon', { points: pts([[x1, y0, 0], [x1, y1, 0], [x1, y1, H], [x1, y0, H]]), fill: C.east, stroke: C.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      o.roof = el('polygon', { points: pts([[x0, y0, H], [x1, y0, H], [x1, y1, H], [x0, y1, H]]), fill: C.roof, stroke: C.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      for (xx = b.x0 + 12; xx < b.x1 - 3; xx += 12) for (k = b.y0 + 12; k < b.y1 - 6; k += 24) {
        if ((xx < b.x0 + 34 && k < b.y0 + 40) || (xx < b.x0 + 52 && k > b.y1 - 26)) continue;
        o.racks.push(el('circle', { cx: P(xx, k, H)[0], cy: P(xx, k, H)[1], r: 0.9, fill: C.rack }, g));
      }
      c = P(x0 + 20, y0 + 22, H);
      L = txt(el('g', { transform: 'matrix(0.866 0.5 -0.866 0.5 ' + c[0] + ' ' + c[1] + ')' }, g), b.id, { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 21, 'font-weight': 300, fill: C.text });
      c = P(x0 + 8, y1 - 8, H);
      A = txt(el('g', { transform: 'matrix(0.866 0.5 -0.866 0.5 ' + c[0] + ' ' + c[1] + ')' }, g), fmt(b.area) + ' м²', { x: 0, y: 0, 'font-size': 7.4, 'font-family': MONO, 'letter-spacing': 0.4, fill: C.sub });
      o.L = L; o.A = A; o.faces = [o.south, o.east, o.roof, L, A];
      keep(b.id, o);
    });
    views['3d'] = s3;

    /* план */
    var sp = el('svg', { viewBox: '-22 -34 310 226', role: 'group', 'aria-label': 'План: четыре блока' }, host);
    sp.style.cssText = 'width:100%;height:auto;display:none;overflow:visible';
    function dimH(xa, xb, y, s, up) {
      el('line', { x1: xa, y1: y, x2: xb, y2: y, stroke: C.dim, 'stroke-width': 0.4 }, sp);
      [xa, xb].forEach(function (x) { el('line', { x1: x, y1: y - 2.5, x2: x, y2: y + 2.5, stroke: C.dim, 'stroke-width': 0.4 }, sp); });
      txt(sp, s, { x: (xa + xb) / 2, y: y + (up ? -3.5 : 8.5), 'text-anchor': 'middle', 'font-size': 6.6, 'font-family': MONO, fill: C.dim });
    }
    function dimV(x, ya, yb, s) {
      el('line', { x1: x, y1: ya, x2: x, y2: yb, stroke: C.dim, 'stroke-width': 0.4 }, sp);
      [ya, yb].forEach(function (y) { el('line', { x1: x - 2.5, y1: y, x2: x + 2.5, y2: y, stroke: C.dim, 'stroke-width': 0.4 }, sp); });
      txt(sp, s, { x: x + 5, y: (ya + yb) / 2 + 2.3, 'font-size': 6.6, 'font-family': MONO, fill: C.dim });
    }
    dimH(24, 252, -22, '228 м', true); dimH(0, 252, 179, '252 м', false); dimV(262, 0, 85, '85 м'); dimV(262, 85, 157, '72 м');
    BLOCKS.forEach(function (b) {
      var n = Math.round(b.docks / 2), i, dx, y = b.side === 'n' ? b.y0 - 9 : b.y1 + 4;
      for (i = 0; i < n; i++) { dx = b.x0 + 5 + (b.x1 - b.x0 - 10) * i / (n - 1); el('rect', { x: dx - 1.6, y: y, width: 3.2, height: 5, fill: C.dock }, sp); }
    });
    BLOCKS.forEach(function (b) {
      var x0 = b.x0 + G, x1 = b.x1 - G, y0 = b.y0 + G, y1 = b.y1 - G, g = el('g', {}, sp), o = { on: false, g: g, racks: [] }, k, xx;
      bind(g, b);
      o.roof = el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: C.roof, stroke: C.line, 'stroke-width': 0.5 }, g);
      for (xx = b.x0 + 12; xx < b.x1 - 3; xx += 12) for (k = b.y0 + 12; k < b.y1 - 6; k += 24) {
        if ((xx < b.x0 + 30 && k < b.y0 + 34) || (xx < b.x0 + 56 && k > b.y1 - 28)) continue;
        o.racks.push(el('circle', { cx: xx, cy: k, r: 0.9, fill: C.rack }, g));
      }
      o.L = txt(g, b.id, { x: x0 + 8, y: y0 + 24, 'font-size': 22, 'font-weight': 300, fill: C.text });
      o.A = txt(g, fmt(b.area) + ' м²', { x: x0 + 8, y: y1 - 17, 'font-size': 7.4, 'font-family': MONO, 'letter-spacing': 0.4, fill: C.sub });
      o.S = txt(g, b.w + ' × ' + b.d + ' м', { x: x0 + 8, y: y1 - 7, 'font-size': 6.6, 'font-family': MONO, fill: C.sub });
      o.faces = [o.roof, o.L, o.A, o.S];
      keep(b.id, o);
    });
    views.plan = sp;

    [s3, sp].forEach(function (s) { [].forEach.call(s.querySelectorAll('polygon, rect, circle, text'), function (n) { n.style.transition = 'fill .3s ease, stroke .3s ease'; }); });

    function paint(o) {
      var on = o.on;
      o.g.setAttribute('aria-pressed', on);
      if (o.lift) o.g.style.transform = on ? 'translateY(-7px)' : '';
      o.roof.setAttribute('fill', on ? C.onRoof : C.roof);
      if (o.south) { o.south.setAttribute('fill', on ? C.onSouth : C.south); o.east.setAttribute('fill', on ? C.onEast : C.east); }
      o.L.setAttribute('fill', on ? C.onText : C.text);
      o.A.setAttribute('fill', on ? C.onSub : C.sub);
      if (o.S) o.S.setAttribute('fill', on ? C.onSub : C.sub);
      o.racks.forEach(function (l) { l.setAttribute('fill', on ? C.onRack : C.rack); });
    }
    return {
      setActive: function (ids) { BLOCKS.forEach(function (b) { parts[b.id].forEach(function (o) { o.on = ids.indexOf(b.id) !== -1; paint(o); }); }); },
      setView: function (v) { for (var k in views) views[k].style.display = k === v ? 'block' : 'none'; }
    };
  }
  window.TLHPlan = { create: create, BLOCKS: BLOCKS, fmt: fmt };
})();
