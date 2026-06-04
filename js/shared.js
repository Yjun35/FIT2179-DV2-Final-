/* ============================================================================
   Melbourne's Coffee Culture — shared config
   Palette, typography, Vega-Lite config objects, and the base() helper.
   Every chart file depends on this; load it first.
   ============================================================================ */

const EMBED_OPTIONS = { mode: 'vega-lite', renderer: 'svg', actions: false };

const WORLD = 'https://cdn.jsdelivr.net/npm/vega-datasets/data/world-110m.json';

// Shared import-data URL (used by chart1a)
const IMP = 'data/aus_imports_by_country.csv';

// ---- palette (mirrors css/style.css) --------------------------------------
const C = {
  dark: '#2C1810', brown: '#6F4E37', medium: '#8B6F47', light: '#D2B48C',
  cream: '#F5F1E8', paper: '#FFFDF9', accent: '#C85A54', gold: '#D4A574',
  goldDeep: '#C28F3C',
  ink: '#5A4636', faint: '#8A7866', hair: '#E5DCCB', muted: '#D8C6B2'
};
const FONT = 'Source Sans 3', SERIF = 'Playfair Display';

// ---- shared config (light cards) ------------------------------------------
const CFG = {
  font: FONT,
  view: { stroke: null },
  title: {
    font: SERIF, fontSize: 14, fontWeight: 700, color: C.dark, anchor: 'start',
    subtitleFont: FONT, subtitleColor: C.faint, subtitleFontSize: 11.5
  },
  axis: {
    labelFont: FONT, titleFont: FONT, labelColor: C.ink, titleColor: C.ink,
    titleFontWeight: 600, labelFontSize: 11, titleFontSize: 12,
    grid: false, domainColor: C.hair, tickColor: C.hair
  },
  legend: {
    labelFont: FONT, titleFont: FONT, titleColor: C.ink, labelColor: C.ink,
    titleFontWeight: 600, labelFontSize: 11, titleFontSize: 11
  }
};
// dark config for the featured hero cards
const CFG_DARK = JSON.parse(JSON.stringify(CFG));
CFG_DARK.title.color = '#FFF';
CFG_DARK.title.subtitleColor = '#D8C6B2';
CFG_DARK.axis.labelColor = '#D8C6B2';
CFG_DARK.axis.titleColor = '#D8C6B2';
CFG_DARK.axis.domainColor = '#4a3220';
CFG_DARK.axis.tickColor = '#4a3220';
CFG_DARK.legend.labelColor = '#D8C6B2';
CFG_DARK.legend.titleColor = '#D8C6B2';

const base = (extra) => Object.assign({
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  width: 'container',
  autosize: { type: 'fit', contains: 'padding' }
}, extra);
