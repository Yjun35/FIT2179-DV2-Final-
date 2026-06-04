// 5a. HERO: the pass-through — % price change since 2015, global beans vs AU retail
const spec5a = base({
  config: CFG_DARK, height: 380, background: null,
  data: { url: 'data/coffee_prices_indexed.csv' },
  transform: [{ calculate: 'datum.index - 100', as: 'pct' }],
  encoding: {
    x: {
      field: 'date', type: 'temporal', title: null,
      axis: { format: '%Y', tickCount: 8, labelAngle: 0 }
    }
  },
  layer: [
    // 0% reference — the 2015 price level
    {
      data: { values: [{ pct: 0 }] },
      mark: { type: 'rule', color: C.muted, opacity: 0.5 },
      encoding: { y: { field: 'pct', type: 'quantitative' } }
    },
    {
      data: { values: [{ pct: 0, label: '2015 level' }] },
      mark: { type: 'text', align: 'left', dx: 2, dy: -6, font: FONT, fontSize: 10, color: C.muted },
      encoding: { x: { value: 4 }, y: { field: 'pct', type: 'quantitative' }, text: { field: 'label' } }
    },
    // 2024-25 Brazil drought marker
    {
      data: { values: [{ date: '2024-09-01' }] },
      mark: { type: 'rule', color: C.muted, strokeDash: [3, 3], opacity: 0.55 },
      encoding: { x: { field: 'date', type: 'temporal' } }
    },
    {
      data: { values: [{ date: '2024-09-01', label: 'Brazil drought' }] },
      mark: { type: 'text', align: 'right', dx: -6, dy: 8, font: FONT, fontSize: 10, color: C.muted },
      encoding: { x: { field: 'date', type: 'temporal' }, y: { value: 12 }, text: { field: 'label' } }
    },
    // the three series, as cumulative % change
    {
      mark: { type: 'line', strokeWidth: 2.5, interpolate: 'monotone' },
      encoding: {
        y: {
          field: 'pct', type: 'quantitative',
          title: 'Price change since Jan 2015 (%)',
          axis: { grid: true, gridOpacity: 0.08, labelExpr: "(datum.value > 0 ? '+' : '') + datum.value + '%'" },
          scale: { zero: true }
        },
        color: {
          field: 'series', type: 'nominal',
          scale: {
            domain: ['Arabica (global)', 'Robusta (global)', 'AU retail coffee'],
            range: [C.gold, C.medium, C.accent]
          },
          legend: { title: null, orient: 'top' }
        },
        tooltip: [
          { field: 'series', title: 'Series' },
          { field: 'date', title: 'Month', timeUnit: 'yearmonth' },
          { field: 'pct', title: 'Change since 2015', format: '+.0f' }
        ]
      }
    },
    {
      mark: { type: 'point', filled: true, opacity: 0, size: 60 },
      encoding: {
        y: { field: 'pct', type: 'quantitative' },
        color: { field: 'series', type: 'nominal', legend: null },
        tooltip: [
          { field: 'series', title: 'Series' },
          { field: 'date', title: 'Month', timeUnit: 'yearmonth' },
          { field: 'pct', title: 'Change since 2015', format: '+.0f' }
        ]
      }
    },
    // annotation: the bean spike
    {
      data: { values: [{ date: '2025-02-01', pct: 168.7, label: 'Beans spiked +169%' }] },
      mark: { type: 'text', align: 'center', dy: -12, font: SERIF, fontSize: 12, fontWeight: 700, color: C.light },
      encoding: { x: { field: 'date', type: 'temporal' }, y: { field: 'pct', type: 'quantitative' }, text: { field: 'label' } }
    },
    // annotation: the slower cup
    {
      data: { values: [{ date: '2025-08-01', pct: 72, label: 'The cup lagged: +72%' }] },
      mark: { type: 'text', align: 'left', dx: 6, dy: 12, font: SERIF, fontSize: 12, fontWeight: 700, color: C.accent },
      encoding: { x: { field: 'date', type: 'temporal' }, y: { field: 'pct', type: 'quantitative' }, text: { field: 'label' } }
    }
  ]
});
