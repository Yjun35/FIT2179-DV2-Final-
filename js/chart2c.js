// 2c. Diverging bar: year-on-year café count growth rate.
// Gold = growth years; accent red = contraction. Tells the "momentum" story.
const spec2c = base({
  config: CFG, height: 380,
  data: { url: 'data/clue_yearly.csv' },
  transform: [{ filter: 'datum.yoy_growth != null' }],
  layer: [
    // zero baseline (single-row inline data so the rule is one crisp mark)
    {
      data: { values: [{ zero: 0 }] },
      mark: { type: 'rule', color: C.ink, strokeWidth: 1 },
      encoding: { x: { field: 'zero', type: 'quantitative' } }
    },
    // bars
    {
      mark: { type: 'bar', height: { band: 0.7 } },
      encoding: {
        y: {
          field: 'year', type: 'ordinal', sort: 'descending', title: null,
          axis: { labelFontSize: 11 }
        },
        x: {
          field: 'yoy_growth', type: 'quantitative',
          title: 'Year-on-year growth (%)',
          axis: { grid: true, gridColor: C.hair }
        },
        color: {
          condition: { test: 'datum.yoy_growth >= 0', value: C.gold },
          value: C.accent
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'yoy_growth', title: 'Growth %', format: '.1f' },
          { field: 'cafe_count', title: 'Cafés' }
        ]
      }
    },
    // label the peak growth year (2005, +8.6%)
    {
      transform: [{ filter: 'datum.year == 2005' }],
      mark: {
        type: 'text', align: 'left', dx: 6, font: SERIF,
        fontSize: 11.5, fontWeight: 700, color: C.dark
      },
      encoding: {
        y: { field: 'year', type: 'ordinal', sort: 'descending' },
        x: { field: 'yoy_growth', type: 'quantitative' },
        text: { value: '+8.6% — fastest growth year' }
      }
    },
    // label the worst year (2020) — pandemic closures; left-aligned from bar tip
    {
      transform: [{ filter: 'datum.year == 2020' }],
      mark: {
        type: 'text', align: 'left', dx: 6, font: SERIF,
        fontSize: 11.5, fontWeight: 700, color: C.accent
      },
      encoding: {
        y: { field: 'year', type: 'ordinal', sort: 'descending' },
        x: { field: 'yoy_growth', type: 'quantitative' },
        text: { value: '−6.9% — pandemic closures' }
      }
    }
  ]
});
