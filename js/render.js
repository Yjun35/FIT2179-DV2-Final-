// ============================================================================
// RENDER — registry + embed helpers
// ============================================================================
const CHARTS = {
  chart1a: spec1a, chart1c: spec1c, chart1d: spec1d,
  chart2a: spec2a, chart2b: spec2b, chart2c: spec2c,
  chart3a: spec3a, chart3b: spec3b, chart3c: spec3c,
  chart5a: spec5a, chart5b: spec5b,
  chart6a: spec6a,
  chart7a: spec7a, chart7b: spec7b
};

// Reading clientWidth forces a synchronous layout, so the measured width is
// always correct even if the script runs before the browser's first paint.
function measuredWidth(el) {
  return el.clientWidth || (el.parentElement && el.parentElement.clientWidth) || 600;
}

function renderChart(id, spec) {
  const el = document.getElementById(id);
  if (!el) return;
  const s = JSON.parse(JSON.stringify(spec));
  if (s.facet) { delete s.width; delete s.autosize; } // faceted view sizes itself
  else if (s.width === 'container') { s.width = measuredWidth(el); }
  // Per-spec renderer override (e.g. chart3a uses canvas for 10k+ parcels);
  // everything else stays on the shared SVG renderer.
  const opts = s.usermeta && s.usermeta.renderer
    ? Object.assign({}, EMBED_OPTIONS, { renderer: s.usermeta.renderer })
    : EMBED_OPTIONS;
  vegaEmbed('#' + id, s, opts)
    .catch(err => {
      console.error('Render failed for', id, err);
      el.innerHTML = '<p style="color:#C85A54;font-size:0.85rem">Chart failed to load.</p>';
    });
}

function renderAll() { Object.entries(CHARTS).forEach(([id, spec]) => renderChart(id, spec)); }

// Re-flow charts on resize (debounced) for a responsive layout.
let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(renderAll, 250);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAll);
} else { renderAll(); }

// Scroll-triggered reveals — add .visible when each section enters the viewport.
(function () {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.row, .takeaway, .intro').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.row, .takeaway, .intro').forEach(function (el) { obs.observe(el); });
}());
