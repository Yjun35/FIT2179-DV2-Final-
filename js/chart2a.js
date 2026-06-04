// 2a. HERO: café growth (COVID framing removed — peak annotation kept)
const spec2a = base({
  config: CFG_DARK, height: 380, background: null,
  data: { url: 'data/clue_yearly.csv' },
  encoding: {
    x: {
      field: 'year', type: 'temporal', title: null,
      axis: { format: '%Y', labelAngle: 0, tickCount: 7 }
    }
  },
  layer: [
    {
      mark: {
        type: 'area', line: { color: C.gold, strokeWidth: 3 },
        color: {
          x1: 1, y1: 1, x2: 1, y2: 0, gradient: 'linear',
          stops: [{ offset: 0, color: 'rgba(212,165,116,0.05)' },
          { offset: 1, color: 'rgba(212,165,116,0.45)' }]
        }
      },
      encoding: {
        y: {
          field: 'cafe_count', type: 'quantitative',
          title: 'Cafés', axis: { grid: false }, scale: { zero: true }
        }
      }
    },
    {
      transform: [{ filter: 'datum.year == 2019' }],
      mark: {
        type: 'point', filled: true, color: C.gold, size: 80,
        stroke: '#241307', strokeWidth: 2
      },
      encoding: {
        x: { field: 'year', type: 'temporal' },
        y: { field: 'cafe_count', type: 'quantitative' },
        tooltip: [{ field: 'year', title: 'Year', timeUnit: 'year' },
        { field: 'cafe_count', title: 'Cafés' }]
      }
    },
    {
      transform: [{ filter: 'datum.year == 2019' }],
      mark: {
        type: 'text', align: 'center', dy: -16, font: SERIF, fontSize: 12,
        fontWeight: 700, color: C.gold
      },
      encoding: {
        x: { field: 'year', type: 'temporal' },
        y: { field: 'cafe_count', type: 'quantitative' },
        text: { value: 'Peak: 1,771' }
      }
    },
    {
      mark: { type: 'point', filled: true, opacity: 0, size: 60 },
      encoding: {
        x: { field: 'year', type: 'temporal' },
        y: { field: 'cafe_count', type: 'quantitative' },
        tooltip: [{ field: 'year', title: 'Year', timeUnit: 'year' },
        { field: 'cafe_count', title: 'Cafés' },
        { field: 'total_seats', title: 'Total seats', format: ',.0f' }]
      }
    }
  ]
});
