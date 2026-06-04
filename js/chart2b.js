// 2b. Dual-axis: bars = café count (left y, gold); line = avg seats per café (right y, accent red).
const spec2b = base({
  config: CFG, height: 380,
  data: { url: 'data/clue_yearly.csv' },
  resolve: { scale: { y: 'independent' } },
  layer: [
    // bars — café count (left y-axis, gold)
    {
      mark: { type: 'bar', color: C.gold, opacity: 0.9, cornerRadiusTopLeft: 2, cornerRadiusTopRight: 2 },
      encoding: {
        x: {
          field: 'year', type: 'ordinal', title: null,
          axis: { labelAngle: -45, labelFontSize: 10 }
        },
        y: {
          field: 'cafe_count', type: 'quantitative', title: 'Number of cafés',
          axis: { grid: true, gridColor: C.hair, titleColor: C.brown, titleFontSize: 11 }
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'cafe_count', title: 'Cafés' },
          { field: 'avg_seats_per_cafe', title: 'Avg seats / café', format: '.1f' }
        ]
      }
    },
    // line — avg seats per café (right y-axis, accent red)
    {
      mark: { type: 'line', color: C.accent, strokeWidth: 2.5, point: { color: C.accent, filled: true, size: 40 } },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: {
          field: 'avg_seats_per_cafe', type: 'quantitative', title: 'Avg seats per café',
          scale: { zero: false },
          axis: { orient: 'right', titleColor: C.accent, titleFontSize: 11, grid: false }
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'cafe_count', title: 'Cafés' },
          { field: 'avg_seats_per_cafe', title: 'Avg seats / café', format: '.1f' }
        ]
      }
    },
    // annotation 2002 — fixed pixel below legend, above all bars (2002 bar is near-zero height)
    {
      transform: [{ filter: 'datum.year == 2002' }],
      mark: { type: 'text', align: 'left', dx: 6, font: SERIF, fontSize: 10.5, fontWeight: 700, color: C.accent },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { value: 85 },
        text: { value: '96 seats (2002)' }
      }
    },
    // annotation 2024 — fixed pixel above the 2024 bar top (~54 px from top)
    {
      transform: [{ filter: 'datum.year == 2024' }],
      mark: { type: 'text', align: 'right', dx: -4, font: SERIF, fontSize: 10.5, fontWeight: 700, color: C.accent },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { value: 30 },
        text: { value: '79 seats (2024)' }
      }
    }
  ]
});
