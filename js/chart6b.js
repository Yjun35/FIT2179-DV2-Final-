// 6b. Cafe/restaurant/takeaway turnover, A$bn, split into the two ABS 8501.0
// sub-groups (dine-in vs takeaway) as a stacked area — composition, not just a
// rising total. Total reaches $66.3bn; takeaway's share spikes in 2020.
const DINE6B = 'Dine-in (cafés & restaurants)';
const TAKE6B = 'Takeaway food services';

const spec6b = base({
  config: CFG, height: 320,
  data: { url: 'data/cafe_turnover.csv' },
  encoding: {
    x: {
      field: 'date', type: 'temporal', title: null,
      axis: { format: '%Y', tickCount: 7, labelAngle: 0 }
    }
  },
  layer: [
    // stacked composition
    {
      mark: { type: 'area', line: { strokeWidth: 1, color: 'white' }, opacity: 0.95 },
      encoding: {
        y: {
          field: 'turnover_bn', type: 'quantitative', stack: 'zero',
          title: 'A$ billion / year', scale: { zero: true }
        },
        color: {
          field: 'segment', type: 'nominal',
          scale: { domain: [DINE6B, TAKE6B], range: [C.brown, C.light] },
          legend: { orient: 'top', title: null, symbolType: 'square' }
        },
        order: { field: 'ord', type: 'ordinal' },
        tooltip: [
          { field: 'year', title: 'Year (FY)' },
          { field: 'segment', title: 'Segment' },
          { field: 'turnover_bn', title: 'Turnover (A$bn)', format: '.1f' },
          { field: 'share_pct', title: 'Share of total', format: '.1f' },
          { field: 'year_total', title: 'Industry total (A$bn)', format: '.1f' }
        ]
      }
    },
    // total label at the top of the final-year stack
    {
      transform: [{ filter: "datum.end_label !== ''" }],
      mark: { type: 'text', align: 'right', dx: -4, dy: -8, font: SERIF, fontSize: 13, fontWeight: 700, color: C.dark },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'year_total', type: 'quantitative' },
        text: { field: 'end_label' }
      }
    },
    // 2020 takeaway-share annotation: point on the dip + callout
    {
      transform: [{ filter: 'datum.year == 2020 && datum.segment == "Takeaway food services"' }],
      mark: { type: 'point', filled: true, color: C.gold, size: 70, stroke: '#241307', strokeWidth: 1.2 },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'year_total', type: 'quantitative' }
      }
    },
    {
      transform: [{ filter: 'datum.year == 2020 && datum.segment == "Takeaway food services"' }],
      mark: { type: 'text', align: 'left', dx: 8, dy: -6, font: SERIF, fontSize: 12, fontWeight: 700, color: C.brown, lineBreak: '\n' },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'year_total', type: 'quantitative' },
        text: { value: ['Takeaway held up as', 'dine-in collapsed:', '48% of spend, 2020'] }
      }
    }
  ]
});
