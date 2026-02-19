/* ═══════════════════════════════════════════
   INTERACTIVE MIND MAP
   Axiomatic Systems & Incidence Geometry
   Progressive disclosure with diagrams
   ═══════════════════════════════════════════ */

/* Node center positions (x, y) on a 1500×900 canvas */
const positions = {
  'center':          { x: 750,  y: 430 },
  'structure':       { x: 660,  y: 180 },
  'incidence':       { x: 1100, y: 400 },
  'parallel':        { x: 650,  y: 620 },
  'realworld':       { x: 340,  y: 400 },
  'undef-terms':     { x: 155,  y: 55 },
  'definitions':     { x: 370,  y: 55 },
  'axioms-struct':   { x: 590,  y: 55 },
  'theorems':        { x: 810,  y: 55 },
  'models-struct':   { x: 1040, y: 55 },
  'axioms3':         { x: 1340, y: 220 },
  'finite-models':   { x: 1370, y: 335 },
  'infinite-models': { x: 1370, y: 440 },
  'isomorphism':     { x: 1340, y: 545 },
  'par-definition':  { x: 340,  y: 760 },
  'euclidean':       { x: 540,  y: 825 },
  'elliptic':        { x: 740,  y: 825 },
  'hyperbolic':      { x: 940,  y: 760 },
  'greek-view':      { x: 165,  y: 240 },
  'modern-view':     { x: 110,  y: 340 },
  'big-questions':   { x: 110,  y: 460 },
  'power':           { x: 165,  y: 570 }
};

const expanded = new Set();
const lineElements = {};

/* ═══ RESPONSIVE SCALING ═══ */
function scaleMindmap() {
  const map = document.getElementById('mindmap');
  const baseWidth = 1500;
  const vw = window.innerWidth;
  if (vw < baseWidth) {
    const scale = vw / baseWidth;
    map.style.transform = `scale(${scale})`;
    map.style.height = (900 * scale) + 'px';
  } else {
    map.style.transform = 'scale(1)';
    map.style.height = '900px';
  }
}

/* ═══ INIT ═══ */
document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('lines');

  scaleMindmap();
  window.addEventListener('resize', scaleMindmap);

  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6"
              refX="8" refY="3" orient="auto" fill="rgba(200,200,220,0.6)">
        <polygon points="0 0, 8 3, 0 6" />
      </marker>
    </defs>`;

  Object.entries(positions).forEach(([id, pos]) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.left = pos.x + 'px';
      el.style.top  = pos.y + 'px';
    }
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (card.classList.contains('leaf')) {
        openDiagram(card.id);
      } else {
        handleClick(card.id);
      }
    });
  });

  // Diagram overlay close handlers
  const overlay = document.getElementById('diagram-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDiagram();
  });
  document.getElementById('diagram-close').addEventListener('click', closeDiagram);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDiagram();
  });
});

/* ═══ CLICK HANDLER ═══ */
function handleClick(id) {
  const children = document.querySelectorAll(`[data-parent="${id}"]`);
  if (children.length === 0) return;

  if (id === 'center') {
    document.getElementById('center').style.animation = 'none';
  }

  if (expanded.has(id)) {
    collapse(id);
  } else {
    expand(id);
  }
}

/* ═══ EXPAND ═══ */
function expand(parentId) {
  expanded.add(parentId);
  const children = document.querySelectorAll(`[data-parent="${parentId}"]`);
  children.forEach((child, i) => {
    setTimeout(() => {
      child.classList.remove('hidden');
      drawLine(parentId, child.id);
    }, i * 120);
  });
}

/* ═══ COLLAPSE ═══ */
function collapse(parentId) {
  expanded.delete(parentId);
  const children = document.querySelectorAll(`[data-parent="${parentId}"]`);
  children.forEach(child => {
    if (expanded.has(child.id)) collapse(child.id);
    child.classList.add('hidden');
    removeLine(parentId, child.id);
  });
}

/* ═══ SVG LINE DRAWING ═══ */
function drawLine(parentId, childId) {
  const svg = document.getElementById('lines');
  const p = positions[parentId];
  const c = positions[childId];
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', getCurvedPath(p.x, p.y, c.x, c.y));
  path.setAttribute('class', 'connection');
  path.setAttribute('marker-end', 'url(#arrowhead)');
  path.id = `line-${parentId}-${childId}`;
  svg.appendChild(path);

  const length = path.getTotalLength();
  path.style.strokeDasharray  = length;
  path.style.strokeDashoffset = length;
  path.style.transition       = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      path.style.transition       = 'stroke-dashoffset 0.6s ease';
      path.style.strokeDashoffset = '0';
    });
  });
  lineElements[`${parentId}-${childId}`] = path;
}

function removeLine(parentId, childId) {
  const key  = `${parentId}-${childId}`;
  const path = lineElements[key];
  if (!path) return;
  const length = path.getTotalLength();
  path.style.transition       = 'stroke-dashoffset 0.3s ease, opacity 0.3s ease';
  path.style.strokeDashoffset = length;
  path.style.opacity          = '0';
  setTimeout(() => path.remove(), 350);
  delete lineElements[key];
}

function getCurvedPath(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(45, dist * 0.15);
  const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2;
  const nx = -dy / dist, ny = dx / dist;
  const cx = midX + nx * curvature, cy = midY + ny * curvature;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

/* ═══════════════════════════════════════════
   DIAGRAM POPUP SYSTEM
   ═══════════════════════════════════════════ */

function openDiagram(leafId) {
  const diagram = diagrams[leafId];
  if (!diagram) return;

  const overlay = document.getElementById('diagram-overlay');
  const titleEl = document.getElementById('diagram-title');
  const svgEl   = document.getElementById('diagram-svg');

  titleEl.textContent = diagram.title;
  svgEl.innerHTML = '';
  diagram.draw(svgEl);

  // Animate SVG strokes
  setTimeout(() => {
    svgEl.querySelectorAll('.draw').forEach((el, i) => {
      const length = el.getTotalLength ? el.getTotalLength() : 300;
      el.style.strokeDasharray  = length;
      el.style.strokeDashoffset = length;
      el.style.transition       = 'none';
      setTimeout(() => {
        el.style.transition       = `stroke-dashoffset 0.8s ease ${i * 0.12}s`;
        el.style.strokeDashoffset = '0';
      }, 30);
    });
  }, 50);

  overlay.classList.add('open');
}

function closeDiagram() {
  document.getElementById('diagram-overlay').classList.remove('open');
}

/* Helper to create SVG elements */
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function svgText(x, y, text, opts = {}) {
  const t = svgEl('text', {
    x, y,
    fill: opts.fill || 'rgba(232,230,227,0.85)',
    'font-size': opts.size || '13',
    'font-family': 'Segoe UI, Arial, sans-serif',
    'text-anchor': opts.anchor || 'middle',
    'dominant-baseline': opts.baseline || 'middle'
  });
  t.textContent = text;
  return t;
}

function svgCircle(cx, cy, r, fill) {
  return svgEl('circle', { cx, cy, r, fill: fill || '#a4bfdd' });
}

function svgLine(x1, y1, x2, y2, color) {
  return svgEl('line', {
    x1, y1, x2, y2,
    stroke: color || 'rgba(232,230,227,0.6)',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    class: 'draw'
  });
}

function svgPath(d, color) {
  return svgEl('path', {
    d, fill: 'none',
    stroke: color || 'rgba(232,230,227,0.6)',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    class: 'draw'
  });
}

/* ═══════════════════════════════════════════
   17 DIAGRAMS
   ═══════════════════════════════════════════ */

const diagrams = {

  /* ── STRUCTURE CHILDREN ── */

  'undef-terms': {
    title: 'Undefined Terms: Point, Line, Lie On',
    draw(svg) {
      // Points
      svg.appendChild(svgCircle(100, 140, 6, '#a4bfdd'));
      svg.appendChild(svgText(100, 165, 'P'));
      svg.appendChild(svgCircle(225, 140, 6, '#a4bfdd'));
      svg.appendChild(svgText(225, 165, 'Q'));
      svg.appendChild(svgCircle(350, 140, 6, '#a4bfdd'));
      svg.appendChild(svgText(350, 165, 'R'));
      // Line through P and Q
      svg.appendChild(svgLine(50, 140, 400, 140, '#7b9cc4'));
      // Label
      svg.appendChild(svgText(225, 60, 'Points lie on a line', { size: '15', fill: '#a4bfdd' }));
      svg.appendChild(svgText(225, 85, 'These are accepted without definition', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
      // Line label
      svg.appendChild(svgText(410, 130, 'ℓ', { size: '16', fill: '#7b9cc4' }));
      // "Lie on" arrows
      svg.appendChild(svgPath('M 100 125 L 100 115', '#a4bfdd'));
      svg.appendChild(svgPath('M 225 125 L 225 115', '#a4bfdd'));
      svg.appendChild(svgText(162, 108, 'lie on', { size: '10', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'definitions': {
    title: 'Definitions: Built from Undefined Terms',
    draw(svg) {
      // Collinear: 3 points on a line
      svg.appendChild(svgText(150, 35, 'Collinear', { size: '14', fill: '#a4bfdd' }));
      svg.appendChild(svgLine(30, 70, 270, 70, '#7b9cc4'));
      svg.appendChild(svgCircle(70, 70, 5, '#a4bfdd'));
      svg.appendChild(svgCircle(150, 70, 5, '#a4bfdd'));
      svg.appendChild(svgCircle(230, 70, 5, '#a4bfdd'));
      svg.appendChild(svgText(150, 95, 'All on the same line ✓', { size: '11', fill: 'rgba(232,230,227,0.4)' }));

      // Non-collinear: triangle
      svg.appendChild(svgText(370, 35, 'Non-collinear', { size: '14', fill: '#a4bfdd' }));
      svg.appendChild(svgCircle(340, 90, 5, '#a4bfdd'));
      svg.appendChild(svgCircle(400, 90, 5, '#a4bfdd'));
      svg.appendChild(svgCircle(370, 55, 5, '#a4bfdd'));
      svg.appendChild(svgText(370, 115, 'No single line ✗', { size: '11', fill: 'rgba(232,230,227,0.4)' }));

      // Definition flow
      svg.appendChild(svgText(225, 165, 'Undefined Terms', { size: '13', fill: 'rgba(232,230,227,0.5)' }));
      svg.appendChild(svgPath('M 225 178 L 225 200', '#7b9cc4'));
      svg.appendChild(svgText(225, 220, 'Definitions', { size: '15', fill: '#a4bfdd' }));
      svg.appendChild(svgText(225, 245, 'eg: collinear, parallel, intersect', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'axioms-struct': {
    title: 'Axioms: Starting Points of a System',
    draw(svg) {
      // Axiom box
      const r1 = svgEl('rect', { x: 140, y: 40, width: 170, height: 45, rx: 10, fill: 'none', stroke: '#7b9cc4', 'stroke-width': '2', class: 'draw' });
      svg.appendChild(r1);
      svg.appendChild(svgText(225, 62, 'AXIOM', { size: '16', fill: '#a4bfdd' }));

      // Properties
      svg.appendChild(svgPath('M 160 95 L 160 130', '#7b9cc4'));
      svg.appendChild(svgPath('M 290 95 L 290 130', '#7b9cc4'));

      svg.appendChild(svgText(160, 148, 'Accepted', { size: '12', fill: 'rgba(232,230,227,0.7)' }));
      svg.appendChild(svgText(160, 165, 'without proof', { size: '12', fill: 'rgba(232,230,227,0.7)' }));

      svg.appendChild(svgText(290, 148, 'Starting', { size: '12', fill: 'rgba(232,230,227,0.7)' }));
      svg.appendChild(svgText(290, 165, 'point', { size: '12', fill: 'rgba(232,230,227,0.7)' }));

      // Foundation visual
      svg.appendChild(svgLine(100, 220, 350, 220, '#7b9cc4'));
      svg.appendChild(svgLine(100, 220, 100, 200, '#7b9cc4'));
      svg.appendChild(svgLine(350, 220, 350, 200, '#7b9cc4'));
      svg.appendChild(svgText(225, 250, 'The foundation everything else is built on', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'theorems': {
    title: 'Theorems: Proved from Axioms',
    draw(svg) {
      // Chain: Axiom → Lemma → Theorem → Corollary
      const boxes = [
        { x: 30,  label: 'Axiom',     color: '#7b9cc4' },
        { x: 135, label: 'Lemma',     color: '#8baad0' },
        { x: 240, label: 'Theorem',   color: '#a4bfdd' },
        { x: 345, label: 'Corollary', color: '#b8d0e8' }
      ];

      boxes.forEach((b, i) => {
        const r = svgEl('rect', { x: b.x, y: 110, width: 95, height: 40, rx: 8, fill: 'none', stroke: b.color, 'stroke-width': '2', class: 'draw' });
        svg.appendChild(r);
        svg.appendChild(svgText(b.x + 47, 130, b.label, { size: '12', fill: b.color }));

        if (i < boxes.length - 1) {
          svg.appendChild(svgPath(`M ${b.x + 98} 130 L ${boxes[i + 1].x - 3} 130`, b.color));
          // Arrow
          svg.appendChild(svgPath(`M ${boxes[i + 1].x - 8} 126 L ${boxes[i + 1].x - 2} 130 L ${boxes[i + 1].x - 8} 134`, b.color));
        }
      });

      svg.appendChild(svgText(225, 60, 'Proof Chain', { size: '15', fill: '#a4bfdd' }));
      svg.appendChild(svgText(225, 80, 'Each step proved from the ones before', { size: '11', fill: 'rgba(232,230,227,0.4)' }));

      svg.appendChild(svgText(80, 195, '"Helper" result', { size: '10', fill: 'rgba(232,230,227,0.35)' }));
      svg.appendChild(svgPath('M 135 185 L 165 155', 'rgba(232,230,227,0.2)'));

      svg.appendChild(svgText(370, 195, '"Follows easily"', { size: '10', fill: 'rgba(232,230,227,0.35)' }));
      svg.appendChild(svgPath('M 370 185 L 388 155', 'rgba(232,230,227,0.2)'));
    }
  },

  'models-struct': {
    title: 'Models: Where Axioms Come Alive',
    draw(svg) {
      // Two models satisfying same axioms
      svg.appendChild(svgText(225, 35, 'Same axioms, different interpretations', { size: '13', fill: 'rgba(232,230,227,0.5)' }));

      // Model 1: dots
      const r1 = svgEl('rect', { x: 30, y: 60, width: 170, height: 160, rx: 12, fill: 'none', stroke: '#7b9cc4', 'stroke-width': '1.5', class: 'draw' });
      svg.appendChild(r1);
      svg.appendChild(svgText(115, 82, 'Model A: Points', { size: '12', fill: '#a4bfdd' }));
      svg.appendChild(svgCircle(70, 130, 5, '#7b9cc4'));
      svg.appendChild(svgCircle(160, 130, 5, '#7b9cc4'));
      svg.appendChild(svgCircle(115, 180, 5, '#7b9cc4'));
      svg.appendChild(svgLine(70, 130, 160, 130, '#7b9cc4'));
      svg.appendChild(svgLine(70, 130, 115, 180, '#7b9cc4'));
      svg.appendChild(svgLine(160, 130, 115, 180, '#7b9cc4'));

      // Model 2: table
      const r2 = svgEl('rect', { x: 250, y: 60, width: 170, height: 160, rx: 12, fill: 'none', stroke: '#7b9cc4', 'stroke-width': '1.5', class: 'draw' });
      svg.appendChild(r2);
      svg.appendChild(svgText(335, 82, 'Model B: Numbers', { size: '12', fill: '#a4bfdd' }));
      svg.appendChild(svgText(335, 120, 'Points: {1, 2, 3}', { size: '11', fill: 'rgba(232,230,227,0.6)' }));
      svg.appendChild(svgText(335, 145, 'Lines: {1,2} {1,3} {2,3}', { size: '11', fill: 'rgba(232,230,227,0.6)' }));
      svg.appendChild(svgText(335, 180, 'Same structure!', { size: '12', fill: '#a4bfdd' }));

      // Arrow between
      svg.appendChild(svgPath('M 205 140 L 245 140', '#a4bfdd'));
      svg.appendChild(svgText(225, 130, '≅', { size: '18', fill: '#a4bfdd' }));

      svg.appendChild(svgText(225, 255, 'A model is an interpretation where all axioms hold true', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  /* ── INCIDENCE GEOMETRY CHILDREN ── */

  'axioms3': {
    title: 'The Three Incidence Axioms',
    draw(svg) {
      // Axiom 1: Two points → unique line
      svg.appendChild(svgText(110, 25, 'Axiom 1', { size: '12', fill: '#7daf8e' }));
      svg.appendChild(svgCircle(60, 60, 5, '#a4d4b4'));
      svg.appendChild(svgCircle(160, 60, 5, '#a4d4b4'));
      svg.appendChild(svgLine(40, 60, 180, 60, '#7daf8e'));
      svg.appendChild(svgText(110, 85, 'Two pts → one unique line', { size: '10', fill: 'rgba(232,230,227,0.5)' }));

      // Axiom 2: Line has ≥ 2 points
      svg.appendChild(svgText(320, 25, 'Axiom 2', { size: '12', fill: '#7daf8e' }));
      svg.appendChild(svgLine(250, 60, 400, 60, '#7daf8e'));
      svg.appendChild(svgCircle(290, 60, 5, '#a4d4b4'));
      svg.appendChild(svgCircle(360, 60, 5, '#a4d4b4'));
      svg.appendChild(svgText(320, 85, 'Every line has ≥ 2 pts', { size: '10', fill: 'rgba(232,230,227,0.5)' }));

      // Axiom 3: Three non-collinear
      svg.appendChild(svgText(225, 130, 'Axiom 3', { size: '12', fill: '#7daf8e' }));
      svg.appendChild(svgCircle(175, 180, 5, '#a4d4b4'));
      svg.appendChild(svgCircle(275, 180, 5, '#a4d4b4'));
      svg.appendChild(svgCircle(225, 155, 5, '#a4d4b4'));
      svg.appendChild(svgText(225, 210, '∃ three non-collinear points', { size: '10', fill: 'rgba(232,230,227,0.5)' }));

      svg.appendChild(svgText(225, 260, 'These three axioms define Incidence Geometry', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'finite-models': {
    title: 'Finite Models',
    draw(svg) {
      // 3-point plane (triangle)
      svg.appendChild(svgText(115, 25, '3-Point Plane', { size: '13', fill: '#a4d4b4' }));
      svg.appendChild(svgCircle(75, 60, 5, '#7daf8e'));
      svg.appendChild(svgCircle(155, 60, 5, '#7daf8e'));
      svg.appendChild(svgCircle(115, 110, 5, '#7daf8e'));
      svg.appendChild(svgLine(75, 60, 155, 60, '#7daf8e'));
      svg.appendChild(svgLine(75, 60, 115, 110, '#7daf8e'));
      svg.appendChild(svgLine(155, 60, 115, 110, '#7daf8e'));
      svg.appendChild(svgText(115, 135, '3 pts, 3 lines', { size: '10', fill: 'rgba(232,230,227,0.4)' }));

      // Fano's plane (7 points, 7 lines)
      svg.appendChild(svgText(340, 25, "Fano's Plane", { size: '13', fill: '#a4d4b4' }));
      // Triangle
      const fx = 340, fy = 100;
      const pts = [
        [fx, fy - 50],           // top
        [fx - 45, fy + 30],     // bottom-left
        [fx + 45, fy + 30],     // bottom-right
        [fx, fy + 30],          // bottom-mid
        [fx - 22, fy - 10],     // left-mid
        [fx + 22, fy - 10],     // right-mid
        [fx, fy - 5]            // center
      ];
      // Lines
      svg.appendChild(svgLine(pts[0][0], pts[0][1], pts[1][0], pts[1][1], '#7daf8e'));
      svg.appendChild(svgLine(pts[0][0], pts[0][1], pts[2][0], pts[2][1], '#7daf8e'));
      svg.appendChild(svgLine(pts[1][0], pts[1][1], pts[2][0], pts[2][1], '#7daf8e'));
      svg.appendChild(svgLine(pts[0][0], pts[0][1], pts[3][0], pts[3][1], '#7daf8e'));
      svg.appendChild(svgLine(pts[1][0], pts[1][1], pts[5][0], pts[5][1], '#7daf8e'));
      svg.appendChild(svgLine(pts[2][0], pts[2][1], pts[4][0], pts[4][1], '#7daf8e'));
      // Circle through midpoints
      svg.appendChild(svgEl('circle', { cx: fx, cy: fy + 5, r: 25, fill: 'none', stroke: '#7daf8e', 'stroke-width': '1.5', class: 'draw' }));
      // Points on top
      pts.forEach(p => svg.appendChild(svgCircle(p[0], p[1], 4, '#a4d4b4')));
      svg.appendChild(svgText(340, 148, '7 pts, 7 lines', { size: '10', fill: 'rgba(232,230,227,0.4)' }));

      svg.appendChild(svgText(225, 250, 'Finite models have a fixed number of points', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'infinite-models': {
    title: 'Infinite Models: The Cartesian Plane',
    draw(svg) {
      // Axes
      svg.appendChild(svgLine(60, 230, 420, 230, '#7daf8e'));  // x-axis
      svg.appendChild(svgLine(100, 260, 100, 30, '#7daf8e'));   // y-axis
      // Arrow tips
      svg.appendChild(svgPath('M 415 225 L 420 230 L 415 235', '#7daf8e'));
      svg.appendChild(svgPath('M 95 35 L 100 30 L 105 35', '#7daf8e'));

      // Grid lines (subtle)
      for (let i = 1; i <= 4; i++) {
        svg.appendChild(svgEl('line', { x1: 100 + i * 60, y1: 225, x2: 100 + i * 60, y2: 235, stroke: 'rgba(232,230,227,0.2)', 'stroke-width': '1' }));
        svg.appendChild(svgEl('line', { x1: 95, y1: 230 - i * 40, x2: 105, y2: 230 - i * 40, stroke: 'rgba(232,230,227,0.2)', 'stroke-width': '1' }));
      }

      // A line y = 0.5x + 1
      svg.appendChild(svgLine(100, 190, 380, 50, '#a4d4b4'));

      // Points on the line
      svg.appendChild(svgCircle(160, 160, 4, '#a4d4b4'));
      svg.appendChild(svgCircle(220, 130, 4, '#a4d4b4'));
      svg.appendChild(svgCircle(280, 100, 4, '#a4d4b4'));

      svg.appendChild(svgText(430, 230, 'x', { size: '13', fill: '#7daf8e' }));
      svg.appendChild(svgText(100, 20, 'y', { size: '13', fill: '#7daf8e' }));
      svg.appendChild(svgText(225, 270, 'ℝ² — infinitely many points & lines', { size: '12', fill: 'rgba(232,230,227,0.5)' }));
    }
  },

  'isomorphism': {
    title: 'Isomorphism: Same Structure, Different Labels',
    draw(svg) {
      // Model A
      svg.appendChild(svgText(115, 30, 'Model A', { size: '14', fill: '#a4d4b4' }));
      svg.appendChild(svgCircle(75, 80, 5, '#7daf8e'));
      svg.appendChild(svgText(75, 100, 'A', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgCircle(155, 80, 5, '#7daf8e'));
      svg.appendChild(svgText(155, 100, 'B', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgCircle(115, 50, 5, '#7daf8e'));
      svg.appendChild(svgText(115, 40, 'C', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgLine(75, 80, 155, 80, '#7daf8e'));
      svg.appendChild(svgLine(75, 80, 115, 50, '#7daf8e'));
      svg.appendChild(svgLine(155, 80, 115, 50, '#7daf8e'));

      // Mapping arrows
      svg.appendChild(svgPath('M 185 65 L 260 65', '#a4d4b4'));
      svg.appendChild(svgPath('M 255 60 L 260 65 L 255 70', '#a4d4b4'));
      svg.appendChild(svgText(222, 55, '≅', { size: '20', fill: '#a4d4b4' }));

      // Model B
      svg.appendChild(svgText(340, 30, 'Model B', { size: '14', fill: '#a4d4b4' }));
      svg.appendChild(svgCircle(300, 80, 5, '#7daf8e'));
      svg.appendChild(svgText(300, 100, '1', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgCircle(380, 80, 5, '#7daf8e'));
      svg.appendChild(svgText(380, 100, '2', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgCircle(340, 50, 5, '#7daf8e'));
      svg.appendChild(svgText(340, 40, '3', { fill: '#a4d4b4', size: '12' }));
      svg.appendChild(svgLine(300, 80, 380, 80, '#7daf8e'));
      svg.appendChild(svgLine(300, 80, 340, 50, '#7daf8e'));
      svg.appendChild(svgLine(380, 80, 340, 50, '#7daf8e'));

      // Mapping details
      svg.appendChild(svgText(225, 155, 'A ↔ 1     B ↔ 2     C ↔ 3', { size: '13', fill: 'rgba(232,230,227,0.6)' }));
      svg.appendChild(svgText(225, 200, 'Structure-preserving bijection', { size: '13', fill: '#a4d4b4' }));
      svg.appendChild(svgText(225, 225, 'Relationships are identical, only names differ', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  /* ── PARALLEL POSTULATES CHILDREN ── */

  'par-definition': {
    title: 'Parallel Lines: Definition',
    draw(svg) {
      // Two parallel lines
      svg.appendChild(svgLine(60, 80, 390, 80, '#d4b896'));
      svg.appendChild(svgLine(60, 140, 390, 140, '#d4b896'));
      svg.appendChild(svgText(405, 80, 'ℓ₁', { size: '14', fill: '#e0c8a0' }));
      svg.appendChild(svgText(405, 140, 'ℓ₂', { size: '14', fill: '#e0c8a0' }));

      // Arrows showing they don't meet
      svg.appendChild(svgText(225, 112, '∞ — never intersect', { size: '12', fill: 'rgba(232,230,227,0.5)' }));

      // Not parallel to itself
      svg.appendChild(svgLine(100, 210, 350, 210, '#d4b896'));
      svg.appendChild(svgText(225, 200, 'ℓ', { size: '14', fill: '#e0c8a0' }));
      // Strike through
      svg.appendChild(svgLine(180, 230, 270, 230, 'rgba(220,100,100,0.6)'));
      svg.appendChild(svgText(225, 250, 'A line is NOT parallel to itself', { size: '11', fill: 'rgba(220,100,100,0.6)' }));
    }
  },

  'euclidean': {
    title: 'Euclidean Parallel Postulate',
    draw(svg) {
      // The given line
      svg.appendChild(svgLine(60, 180, 400, 180, '#d4b896'));
      svg.appendChild(svgText(410, 180, 'ℓ', { size: '14', fill: '#e0c8a0' }));

      // Point P above
      svg.appendChild(svgCircle(225, 100, 6, '#e0c8a0'));
      svg.appendChild(svgText(240, 90, 'P', { size: '14', fill: '#e0c8a0' }));

      // Exactly one parallel through P
      svg.appendChild(svgLine(80, 100, 370, 100, '#d4b896'));
      svg.appendChild(svgText(380, 100, 'm', { size: '14', fill: '#e0c8a0' }));

      svg.appendChild(svgText(225, 50, 'Exactly ONE line through P parallel to ℓ', { size: '13', fill: '#e0c8a0' }));
      svg.appendChild(svgText(225, 240, 'Example: the Cartesian plane', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'elliptic': {
    title: 'Elliptic Parallel Postulate',
    draw(svg) {
      // Sphere-like circle
      svg.appendChild(svgEl('circle', { cx: 225, cy: 140, r: 80, fill: 'none', stroke: '#d4b896', 'stroke-width': '2', class: 'draw' }));

      // Great circles (arcs) that all intersect
      svg.appendChild(svgEl('ellipse', { cx: 225, cy: 140, rx: 80, ry: 30, fill: 'none', stroke: '#e0c8a0', 'stroke-width': '1.5', class: 'draw' }));
      svg.appendChild(svgEl('ellipse', { cx: 225, cy: 140, rx: 30, ry: 80, fill: 'none', stroke: '#e0c8a0', 'stroke-width': '1.5', class: 'draw' }));

      svg.appendChild(svgText(225, 40, 'NO parallels exist', { size: '14', fill: '#e0c8a0' }));
      svg.appendChild(svgText(225, 250, 'All lines (great circles) intersect', { size: '12', fill: 'rgba(232,230,227,0.5)' }));
      svg.appendChild(svgText(225, 270, 'Example: 3-point plane', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'hyperbolic': {
    title: 'Hyperbolic Parallel Postulate',
    draw(svg) {
      // The given line
      svg.appendChild(svgLine(60, 200, 400, 200, '#d4b896'));
      svg.appendChild(svgText(410, 200, 'ℓ', { size: '14', fill: '#e0c8a0' }));

      // Point P above
      svg.appendChild(svgCircle(225, 100, 6, '#e0c8a0'));
      svg.appendChild(svgText(240, 88, 'P', { size: '14', fill: '#e0c8a0' }));

      // Two+ parallels through P
      svg.appendChild(svgLine(80, 100, 370, 100, '#d4b896'));
      svg.appendChild(svgText(380, 95, 'm₁', { size: '12', fill: '#e0c8a0' }));

      svg.appendChild(svgLine(100, 60, 350, 140, '#d4b896'));
      svg.appendChild(svgText(360, 140, 'm₂', { size: '12', fill: '#e0c8a0' }));

      svg.appendChild(svgText(225, 40, 'At least TWO parallels through P', { size: '13', fill: '#e0c8a0' }));
      svg.appendChild(svgText(225, 245, 'Neither m₁ nor m₂ intersects ℓ', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  /* ── REAL WORLD CHILDREN ── */

  'greek-view': {
    title: 'Greek View: Ideal Forms',
    draw(svg) {
      // Temple columns
      for (let i = 0; i < 5; i++) {
        const x = 115 + i * 55;
        svg.appendChild(svgLine(x, 80, x, 200, '#a893c4'));
        svg.appendChild(svgEl('rect', { x: x - 8, y: 72, width: 16, height: 10, rx: 2, fill: 'none', stroke: '#a893c4', 'stroke-width': '1.5', class: 'draw' }));
      }
      // Roof
      svg.appendChild(svgLine(95, 75, 225, 35, '#a893c4'));
      svg.appendChild(svgLine(225, 35, 355, 75, '#a893c4'));
      svg.appendChild(svgLine(95, 75, 355, 75, '#a893c4'));
      // Base
      svg.appendChild(svgLine(95, 200, 355, 200, '#a893c4'));

      svg.appendChild(svgText(225, 235, '"Geometry is about perfect, ideal objects"', { size: '12', fill: 'rgba(232,230,227,0.5)' }));
      svg.appendChild(svgText(225, 258, 'Axioms = self-evident truths about reality', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'modern-view': {
    title: 'Modern View: Interpretation Matters',
    draw(svg) {
      // Central axiom
      const r = svgEl('rect', { x: 162, y: 50, width: 126, height: 36, rx: 8, fill: 'none', stroke: '#a893c4', 'stroke-width': '2', class: 'draw' });
      svg.appendChild(r);
      svg.appendChild(svgText(225, 68, 'Axiom A', { size: '13', fill: '#c4b0dc' }));

      // Multiple interpretations
      const interps = [
        { x: 80,  y: 160, label: '? chairs' },
        { x: 225, y: 175, label: '? lines' },
        { x: 370, y: 160, label: '? songs' }
      ];
      interps.forEach(ip => {
        svg.appendChild(svgPath(`M 225 88 L ${ip.x} ${ip.y - 25}`, '#a893c4'));
        svg.appendChild(svgEl('rect', { x: ip.x - 45, y: ip.y - 22, width: 90, height: 30, rx: 8, fill: 'none', stroke: '#8a72a8', 'stroke-width': '1.5', class: 'draw' }));
        svg.appendChild(svgText(ip.x, ip.y - 7, ip.label, { size: '11', fill: 'rgba(232,230,227,0.6)' }));
      });

      svg.appendChild(svgText(225, 230, '"Point" and "line" can mean anything', { size: '12', fill: 'rgba(232,230,227,0.5)' }));
      svg.appendChild(svgText(225, 255, 'Truth depends on the model chosen', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'big-questions': {
    title: 'Big Questions in Geometry',
    draw(svg) {
      // Question marks
      svg.appendChild(svgText(225, 50, '?', { size: '40', fill: 'rgba(168,147,196,0.3)' }));

      const questions = [
        { y: 100, q: 'Are theorems actually true?' },
        { y: 140, q: 'What really are "point" and "line"?' },
        { y: 180, q: 'Which axioms fit our reality?' },
        { y: 220, q: 'Can geometry describe the universe?' }
      ];

      questions.forEach((item, i) => {
        svg.appendChild(svgCircle(80, item.y, 4, '#a893c4'));
        svg.appendChild(svgText(90, item.y, item.q, { size: '13', fill: 'rgba(232,230,227,0.65)', anchor: 'start' }));
      });

      svg.appendChild(svgText(225, 260, 'These questions drive mathematical philosophy', { size: '11', fill: 'rgba(232,230,227,0.4)' }));
    }
  },

  'power': {
    title: 'The Power of Abstraction',
    draw(svg) {
      // Concrete → Abstract → Power
      // Concrete examples
      svg.appendChild(svgEl('rect', { x: 30, y: 80, width: 110, height: 50, rx: 10, fill: 'none', stroke: '#8a72a8', 'stroke-width': '1.5', class: 'draw' }));
      svg.appendChild(svgText(85, 100, 'Concrete', { size: '12', fill: '#c4b0dc' }));
      svg.appendChild(svgText(85, 118, 'examples', { size: '10', fill: 'rgba(232,230,227,0.4)' }));

      svg.appendChild(svgPath('M 145 105 L 175 105', '#a893c4'));
      svg.appendChild(svgPath('M 170 100 L 175 105 L 170 110', '#a893c4'));

      svg.appendChild(svgEl('rect', { x: 180, y: 80, width: 110, height: 50, rx: 10, fill: 'none', stroke: '#a893c4', 'stroke-width': '2', class: 'draw' }));
      svg.appendChild(svgText(235, 100, 'Abstract', { size: '13', fill: '#c4b0dc' }));
      svg.appendChild(svgText(235, 118, 'axioms', { size: '10', fill: 'rgba(232,230,227,0.4)' }));

      svg.appendChild(svgPath('M 295 105 L 325 105', '#a893c4'));
      svg.appendChild(svgPath('M 320 100 L 325 105 L 320 110', '#a893c4'));

      svg.appendChild(svgEl('rect', { x: 330, y: 80, width: 100, height: 50, rx: 10, fill: 'none', stroke: '#c4b0dc', 'stroke-width': '2', class: 'draw' }));
      svg.appendChild(svgText(380, 100, 'Applies', { size: '13', fill: '#c4b0dc' }));
      svg.appendChild(svgText(380, 118, 'everywhere', { size: '10', fill: 'rgba(232,230,227,0.4)' }));

      // Fan out from "Applies everywhere"
      const targets = ['Physics', 'Art', 'CS', 'Music'];
      targets.forEach((t, i) => {
        const tx = 280 + i * 55;
        const ty = 200;
        svg.appendChild(svgPath(`M 380 135 L ${tx} ${ty - 15}`, '#8a72a8'));
        svg.appendChild(svgText(tx, ty, t, { size: '11', fill: 'rgba(232,230,227,0.5)' }));
      });

      svg.appendChild(svgText(225, 250, 'Abstraction gives math its universal strength', { size: '12', fill: '#c4b0dc' }));
    }
  }
};
