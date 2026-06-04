// 3c. Bubble scatter: café count vs average café size; bubble = total seats.
const KEY_ZONES = "['Melbourne (CBD)','Southbank','Carlton','Docklands','South Yarra']";

const spec3c = base({
  config: CFG, height: 380,
  data: { url: 'data/clue_zone_latest.csv' },
  encoding: {
    x: {
      field: 'cafe_count', type: 'quantitative', scale: { type: 'sqrt', nice: false },
      title: 'Number of venues →',
      axis: { grid: false, values: [10, 50, 100, 200, 400, 600, 950] }
    },
    y: {
      field: 'avg_seats', type: 'quantitative', scale: { zero: false },
      title: '↑ Average seats per venue', axis: { grid: false }
    }
  },
  layer: [
    {
      mark: { type: 'circle', opacity: 0.85, stroke: '#FFFDF9', strokeWidth: 1.2 },
      encoding: {
        size: {
          field: 'density', type: 'quantitative',
          scale: { type: 'sqrt', range: [80, 1800] },
          legend: { title: 'Venues per km²', format: '.0f' }
        },
        color: {
          field: 'outdoor_pct', type: 'quantitative',
          scale: { domain: [10, 22, 37], range: ['#EBE0CC', C.gold, C.accent] },
          legend: {
            title: 'Outdoor seats %', orient: 'top-right',
            format: '.0f', titleFont: SERIF, gradientLength: 120
          }
        },
        tooltip: [
          { field: 'zone', title: 'Precinct' }, { field: 'cafe_count', title: 'Venues' },
          { field: 'avg_seats', title: 'Avg seats / venue', format: '.0f' },
          { field: 'density', title: 'Venues per km²', format: '.1f' },
          { field: 'outdoor_pct', title: 'Outdoor seats %', format: '.1f' }
        ]
      }
    },
    {
      transform: [{ filter: 'indexof(' + KEY_ZONES + ', datum.zone) >= 0' }],
      mark: {
        type: 'text', align: 'left', dx: 12, dy: -2, font: FONT,
        fontSize: 11, fontWeight: 700, color: C.dark
      },
      encoding: { text: { field: 'zone' } }
    },
    {
      transform: [{ filter: "datum.zone === 'Southbank'" }],
      mark: {
        type: 'text', align: 'left', dx: 12, dy: 14, font: SERIF,
        fontSize: 11, fontWeight: 600, color: C.accent
      },
      encoding: { text: { value: 'Few venues, but large' } }
    },
    {
      transform: [{ filter: "datum.zone === 'Melbourne (CBD)'" }],
      mark: {
        type: 'text', align: 'right', dx: -6, dy: -36, font: SERIF,
        fontSize: 11, fontWeight: 600, color: C.accent
      },
      encoding: { text: { value: 'Many mid-sized venues' } }
    }
  ]
});
