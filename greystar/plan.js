/* Объемная схема Tashkent Logistics Hub с выбором блоков. Размеры блоков с плана на greystar.asia. Буквы A-D условные. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', K = 0.866, H = 22;
  var BLOCKS = [
    { id: 'A', x0: 24,  y0: 0,  x1: 108, y1: 85,  area: 7140,  docks: 17, size: '84 × 85 м' },
    { id: 'B', x0: 108, y0: 0,  x1: 252, y1: 85,  area: 12240, docks: 30, size: '144 × 85 м' },
    { id: 'C', x0: 0,   y0: 85, x1: 108, y1: 157, area: 7776,  docks: 23, size: '108 × 72 м' },
    { id: 'D', x0: 108, y0: 85, x1: 252, y1: 157, area: 10368, docks: 32, size: '144 × 72 м' }
  ];
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function P(x, y, z) { return [((x - y) * K).toFixed(2), ((x + y) * 0.5 - (z || 0)).toFixed(2)]; }
  function pts(a) { return a.map(function (p) { return P(p[0], p[1], p[2]).join(','); }).join(' '); }
  function el(n, at, parent) { var e = document.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }

  function create(host, onToggle) {
    var c = { ground: 'rgba(255,255,255,0.55)', yard: 'rgba(255,255,255,0.5)', roof: '#ffffff', south: '#071357', east: '#16257a', line: 'rgba(7,19,87,0.16)', door: '#c4d2ea', text: '#071357', sub: '#6984a1', on: '#690107', sky: '#dfe7f4' };
    var svg = el('svg', { viewBox: '-178 -46 420 296', role: 'group', 'aria-label': 'Схема: четыре блока комплекса' }, host);
    svg.style.cssText = 'width:100%;height:auto;display:block;overflow:visible';
    var f = el('filter', { id: 'planShadow', x: '-20%', y: '-20%', width: '140%', height: '170%' }, el('defs', {}, svg));
    el('feDropShadow', { dx: 0, dy: 10, stdDeviation: 9, 'flood-color': '#071357', 'flood-opacity': 0.2 }, f);
    el('polygon', { points: pts([[-14, -30], [266, -30], [266, 200], [-14, 200]]), fill: c.ground }, svg);
    el('polygon', { points: pts([[0, 157], [252, 157], [252, 192], [0, 192]]), fill: c.yard }, svg);
    el('polygon', { points: pts([[24, -24], [252, -24], [252, 0], [24, 0]]), fill: c.yard }, svg);

    var parts = {};
    BLOCKS.forEach(function (b, n) {
      var g = el('g', { class: 'pb', tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': 'Блок ' + b.id + ', ' + fmt(b.area) + ' м²', filter: 'url(#planShadow)' }, svg);
      g.style.cssText = 'cursor:pointer;outline:none;transition:transform .45s cubic-bezier(.25,1,.33,1)';
      el('polygon', { points: pts([[b.x0, b.y1, 0], [b.x1, b.y1, 0], [b.x1, b.y1, H], [b.x0, b.y1, H]]), fill: c.south, stroke: c.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      el('polygon', { points: pts([[b.x1, b.y0, 0], [b.x1, b.y1, 0], [b.x1, b.y1, H], [b.x1, b.y0, H]]), fill: c.east, stroke: c.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      var roof = el('polygon', { points: pts([[b.x0, b.y0, H], [b.x1, b.y0, H], [b.x1, b.y1, H], [b.x0, b.y1, H]]), fill: c.roof, stroke: c.line, 'stroke-width': 0.5, 'stroke-linejoin': 'round' }, g);
      roof.style.transition = 'fill .45s';
      var lines = [];
      for (var s = 1; s <= 3; s++) {
        var yy = b.y0 + (b.y1 - b.y0) * s / 4;
        lines.push(el('line', { x1: P(b.x0 + 8, yy, H)[0], y1: P(b.x0 + 8, yy, H)[1], x2: P(b.x1 - 8, yy, H)[0], y2: P(b.x1 - 8, yy, H)[1], stroke: c.sky, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-dasharray': '5 4' }, g));
      }
      if (b.y1 === 157) {
        var nd = Math.round(b.docks / 2.3);
        for (var i = 0; i < nd; i++) {
          var dx = b.x0 + 7 + (b.x1 - b.x0 - 14) * i / (nd - 1);
          el('polygon', { points: pts([[dx - 2.2, b.y1, 2], [dx + 2.2, b.y1, 2], [dx + 2.2, b.y1, 10], [dx - 2.2, b.y1, 10]]), fill: c.door }, g);
        }
      }
      if (b.x1 === 252) {
        for (var r = 0; r < 2; r++) for (var w = 0; w < 6; w++) {
          var wy = b.y1 - 6 - w * 5.2, wz = 6 + r * 7;
          el('polygon', { points: pts([[b.x1, wy - 3.6, wz], [b.x1, wy, wz], [b.x1, wy, wz + 4.4], [b.x1, wy - 3.6, wz + 4.4]]), fill: '#9fb4d0' }, g);
        }
      }
      var o = P((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, H);
      var t = el('g', { transform: 'matrix(0.866 0.5 -0.866 0.5 ' + o[0] + ' ' + o[1] + ')' }, g);
      var L = el('text', { x: 0, y: -2, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 300, fill: c.text }, t); L.textContent = b.id;
      var A = el('text', { x: 0, y: 12, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: c.sub }, t); A.textContent = fmt(b.area) + ' м²';
      L.style.transition = A.style.transition = 'fill .45s';
      parts[b.id] = { g: g, roof: roof, L: L, A: A, lines: lines, on: false };
      function pick() { if (onToggle) onToggle(b.id); }
      g.addEventListener('click', pick);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      g.addEventListener('mouseenter', function () { if (!parts[b.id].on) g.style.transform = 'translateY(-4px)'; });
      g.addEventListener('mouseleave', function () { if (!parts[b.id].on) g.style.transform = ''; });
    });

    var tg = el('g', {}, svg);
    [10, 26, 44, 61, 80, 122, 139, 156, 190, 207, 226, 241].forEach(function (x) {
      var y0 = 159, y1 = 175, z = 7, w = 2.6, line = 'rgba(7,19,87,0.25)';
      el('polygon', { points: pts([[x - w, y1, 0], [x + w, y1, 0], [x + w, y1, z], [x - w, y1, z]]), fill: '#dfe6ef', stroke: line, 'stroke-width': 0.3 }, tg);
      el('polygon', { points: pts([[x + w, y0, 0], [x + w, y1, 0], [x + w, y1, z], [x + w, y0, z]]), fill: '#eef2f7', stroke: line, 'stroke-width': 0.3 }, tg);
      el('polygon', { points: pts([[x - w, y0, z], [x + w, y0, z], [x + w, y1, z], [x - w, y1, z]]), fill: '#fff', stroke: line, 'stroke-width': 0.3 }, tg);
      el('polygon', { points: pts([[x - w, y1, 0], [x + w, y1, 0], [x + w, y1 + 4, 0], [x + w, y1 + 4, 4.5], [x + w, y1, 4.5], [x - w, y1, 4.5]]), fill: '#690107', stroke: line, 'stroke-width': 0.3 }, tg);
    });

    return {
      setActive: function (ids) {
        BLOCKS.forEach(function (b) {
          var q = parts[b.id], on = ids.indexOf(b.id) !== -1; q.on = on;
          q.g.setAttribute('aria-pressed', on);
          q.g.style.transform = on ? 'translateY(-9px)' : '';
          q.roof.setAttribute('fill', on ? c.on : c.roof);
          q.L.setAttribute('fill', on ? '#fff' : c.text);
          q.A.setAttribute('fill', on ? 'rgba(255,255,255,0.82)' : c.sub);
          q.lines.forEach(function (l) { l.setAttribute('stroke', on ? 'rgba(255,255,255,0.22)' : c.sky); });
        });
      }
    };
  }
  window.TLHPlan = { create: create, BLOCKS: BLOCKS, fmt: fmt };
})();
