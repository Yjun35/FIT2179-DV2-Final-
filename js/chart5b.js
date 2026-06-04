// 5b. Long-run arabica price with the all-time record flagged
const spec5b = base({
  config: CFG, height: 340,
  data: { url: 'data/coffee_arabica_longrun.csv' },
  // US$/lb -> A$/kg: x2.20462 (lb->kg) / 0.65 (assumed A$1 = US$0.65)
  transform: [
    { calculate: 'datum.price_usd_lb * 3.39172', as: 'price_aud_kg' },
    { calculate: "datum.price_label ? 'Record A$' + format(datum.price_usd_lb * 3.39172, '.2f') + '/kg' : ''", as: 'kg_label' }
  ],
  encoding: {
    x: {
      field: 'date', type: 'temporal', title: null,
      axis: { format: '%Y', tickCount: 8, labelAngle: 0 }
    }
  },
  layer: [
    {
      mark: {
        type: 'area', line: { color: C.brown, strokeWidth: 1.5 },
        color: {
          x1: 1, y1: 1, x2: 1, y2: 0, gradient: 'linear',
          stops: [{ offset: 0, color: 'rgba(111,78,55,0.04)' },
          { offset: 1, color: 'rgba(111,78,55,0.35)' }]
        }
      },
      encoding: {
        y: {
          field: 'price_aud_kg', type: 'quantitative',
          title: 'A$ / kg', scale: { zero: true }
        },
        tooltip: [
          { field: 'date', title: 'Month', timeUnit: 'yearmonth' },
          { field: 'price_aud_kg', title: 'A$/kg', format: '.2f' }
        ]
      }
    },
    {
      transform: [{ filter: 'datum.price_label' }],
      mark: { type: 'point', filled: true, color: C.accent, size: 80, stroke: '#FFFDF9', strokeWidth: 1.5 },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'price_aud_kg', type: 'quantitative' },
        tooltip: [
          { field: 'date', title: 'Record month', timeUnit: 'yearmonth' },
          { field: 'price_aud_kg', title: 'A$/kg', format: '.2f' }
        ]
      }
    },
    {
      transform: [{ filter: 'datum.price_label' }],
      mark: { type: 'text', align: 'end', dx: -8, dy: -4, font: SERIF, fontSize: 12, fontWeight: 700, color: C.accent },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'price_aud_kg', type: 'quantitative' },
        text: { field: 'kg_label' }
      }
    }
  ]
});
