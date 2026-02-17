/* ═══════════════════════════════════════════
   INTERACTIVE MIND MAP
   Axiomatic Systems & Incidence Geometry
   Progressive disclosure with animations
   ═══════════════════════════════════════════ */

/* Node center positions (x, y) on a 1500×900 canvas */
const positions = {
  // Center
  'center':          { x: 750,  y: 430 },

  // Branches (Level 1)
  'structure':       { x: 660,  y: 180 },
  'incidence':       { x: 1100, y: 400 },
  'parallel':        { x: 650,  y: 620 },
  'realworld':       { x: 340,  y: 400 },

  // Structure children
  'undef-terms':     { x: 155,  y: 55 },
  'definitions':     { x: 370,  y: 55 },
  'axioms-struct':   { x: 590,  y: 55 },
  'theorems':        { x: 810,  y: 55 },
  'models-struct':   { x: 1040, y: 55 },

  // Incidence children
  'axioms3':         { x: 1340, y: 220 },
  'finite-models':   { x: 1370, y: 335 },
  'infinite-models': { x: 1370, y: 440 },
  'isomorphism':     { x: 1340, y: 545 },

  // Parallel children
  'par-definition':  { x: 340,  y: 760 },
  'euclidean':       { x: 540,  y: 825 },
  'elliptic':        { x: 740,  y: 825 },
  'hyperbolic':      { x: 940,  y: 760 },

  // Real World children
  'greek-view':      { x: 165,  y: 240 },
  'modern-view':     { x: 110,  y: 340 },
  'big-questions':   { x: 110,  y: 460 },
  'power':           { x: 165,  y: 570 }
};

/* State tracking */
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

  // SVG arrow marker
  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="6"
              refX="8" refY="3" orient="auto" fill="#e48bae">
        <polygon points="0 0, 8 3, 0 6" />
      </marker>
    </defs>`;

  // Position every card
  Object.entries(positions).forEach(([id, pos]) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.left = pos.x + 'px';
      el.style.top  = pos.y + 'px';
    }
  });

  // Attach click handlers
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      handleClick(card.id);
    });
  });
});

/* ═══ CLICK HANDLER ═══ */
function handleClick(id) {
  const children = document.querySelectorAll(`[data-parent="${id}"]`);
  if (children.length === 0) return;          // leaf — nothing to toggle

  // Stop center pulse once user interacts
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

/* ═══ COLLAPSE (recursive) ═══ */
function collapse(parentId) {
  expanded.delete(parentId);
  const children = document.querySelectorAll(`[data-parent="${parentId}"]`);

  children.forEach(child => {
    // Collapse grandchildren first
    if (expanded.has(child.id)) {
      collapse(child.id);
    }
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

  // Animate the stroke drawing
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

/* Quadratic bezier curve between two points */
function getCurvedPath(x1, y1, x2, y2) {
  const dx   = x2 - x1;
  const dy   = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular offset for the control point
  const curvature = Math.min(45, dist * 0.15);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const nx   = -dy / dist;
  const ny   =  dx / dist;
  const cx   = midX + nx * curvature;
  const cy   = midY + ny * curvature;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}
