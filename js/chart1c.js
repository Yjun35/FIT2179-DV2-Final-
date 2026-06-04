// 1c. Slope chart: world-producer rank -> Australia-supplier rank.
// Crossing lines reveal the role of distance (PNG jumps up, Vietnam drops).
const SLOPE = 'data/producers_vs_suppliers.csv';
const SLOPE_HI = "['Papua New Guinea','Vietnam']";
const slopeBase = {
  data: { url: SLOPE },
  transform: [
    { fold: ['producer_rank', 'supplier_rank'], as: ['side', 'rank'] },
    { calculate: "datum.side === 'producer_rank' ? 'World grower' : 'Our supplier'", as: 'col' },
    { calculate: 'indexof(' + SLOPE_HI + ', datum.country) >= 0', as: 'hi' }
  ]
};

const spec1c = base({
  config: CFG, height: 430,
  data: slopeBase.data,
  transform: slopeBase.transform,
  encoding: {
    x: {
      field: 'col', type: 'nominal', sort: ['World grower', 'Our supplier'], title: null,
      scale: { padding: 0.55 },
      axis: {
        orient: 'top', labelFont: SERIF, labelFontSize: 12.5, labelFontWeight: 700,
        labelColor: C.dark, domain: false, ticks: false, labelPadding: 10
      }
    },
    y: { field: 'rank', type: 'quantitative', scale: { reverse: true }, title: null, axis: null }
  },
  layer: [
    // non-highlighted slopes (grey)
    {
      transform: [{ filter: '!datum.hi' }],
      mark: { type: 'line', color: '#CBBBA4', strokeWidth: 1.6 },
      encoding: { detail: { field: 'country' } }
    },
    // highlighted slopes (accent, thick)
    {
      transform: [{ filter: 'datum.hi' }],
      mark: { type: 'line', color: C.accent, strokeWidth: 3 },
      encoding: { detail: { field: 'country' } }
    },
    // points
    {
      mark: { type: 'circle', size: 80, opacity: 1 },
      encoding: {
        color: { condition: { test: 'datum.hi', value: C.accent }, value: C.brown },
        tooltip: [{ field: 'country', title: 'Country' }, { field: 'col', title: 'Ranked as' },
        { field: 'rank', title: 'Rank' }]
      }
    },
    // labels on the grower (left) side
    {
      transform: [{ filter: "datum.col === 'World grower'" }],
      mark: { type: 'text', align: 'right', dx: -9, font: FONT, fontSize: 11 },
      encoding: {
        text: { field: 'country' },
        color: { condition: { test: 'datum.hi', value: C.accent }, value: C.ink }
      }
    },
    // labels on the supplier (right) side
    {
      transform: [{ filter: "datum.col === 'Our supplier'" }],
      mark: { type: 'text', align: 'left', dx: 9, font: FONT, fontSize: 11 },
      encoding: {
        text: { field: 'country' },
        color: { condition: { test: 'datum.hi', value: C.accent }, value: C.ink }
      }
    }
  ]
});
