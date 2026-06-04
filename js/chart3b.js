// 3b. Bump chart: precinct rank by café count over time.
const BUMP_HI = "['Melbourne (CBD)','Docklands','Carlton','Southbank']";

const spec3b = base({
  config: CFG, height: 430,
  data: { url: 'data/clue_zone_year.csv' },
  transform: [
    { filter: 'datum.year >= 2004' },
    { calculate: 'indexof(' + BUMP_HI + ', datum.zone) >= 0', as: 'hi' },
    { calculate: "datum.zone == 'Melbourne (CBD)' ? 'CBD' : datum.zone == 'Melbourne (Remainder)' ? 'Remainder' : datum.zone == 'West Melbourne (Residential)' ? 'W. Melb Res.' : datum.zone == 'West Melbourne (Industrial)' ? 'W. Melb Ind.' : datum.zone", as: 'lbl' }
  ],
  encoding: {
    x: {
      field: 'year', type: 'ordinal', title: null,
      axis: { labelAngle: 0, values: [2004, 2008, 2012, 2016, 2020, 2024] },
      scale: { padding: 0.05 }
    },
    y: {
      field: 'rank', type: 'quantitative', scale: { reverse: true, domain: [1, 13] },
      title: 'Rank by venue count (1 = most)',
      axis: { values: [1, 3, 5, 7, 9, 11, 13], grid: true, gridColor: C.hair }
    }
  },
  layer: [
    // grey background lines
    {
      transform: [{ filter: '!datum.hi' }],
      mark: {
        type: 'line', color: '#DBCFBC', strokeWidth: 1.5,
        point: { filled: true, color: '#DBCFBC', size: 12 }
      },
      encoding: {
        detail: { field: 'zone' },
        tooltip: [{ field: 'zone', title: 'Precinct' }, { field: 'year', title: 'Year' },
        { field: 'rank', title: 'Rank' }, { field: 'cafe_count', title: 'Venues' }]
      }
    },
    // highlighted coloured lines
    {
      transform: [{ filter: 'datum.hi' }],
      mark: { type: 'line', strokeWidth: 3, point: { filled: true, size: 42 } },
      encoding: {
        color: {
          field: 'zone', type: 'nominal',
          scale: {
            domain: ['Melbourne (CBD)', 'Docklands', 'Carlton', 'Southbank'],
            range: [C.accent, C.brown, C.gold, C.medium]
          }, legend: null
        },
        tooltip: [{ field: 'zone', title: 'Precinct' }, { field: 'year', title: 'Year' },
        { field: 'rank', title: 'Rank' }, { field: 'cafe_count', title: 'Venues' }]
      }
    },
    // end labels at 2024 for highlighted zones
    {
      transform: [{ filter: 'datum.hi && datum.year == 2024' }],
      mark: { type: 'text', align: 'left', dx: 8, font: FONT, fontSize: 10.5, fontWeight: 700 },
      encoding: {
        color: {
          field: 'zone', type: 'nominal',
          scale: {
            domain: ['Melbourne (CBD)', 'Docklands', 'Carlton', 'Southbank'],
            range: [C.accent, C.brown, C.gold, C.medium]
          }, legend: null
        },
        text: { field: 'lbl' }
      }
    },
    // end labels at 2024 for grey zones
    {
      transform: [{ filter: '!datum.hi && datum.year == 2024' }],
      mark: { type: 'text', align: 'left', dx: 8, font: FONT, fontSize: 9.5, fontWeight: 400, color: C.faint },
      encoding: { text: { field: 'lbl' } }
    },
    // W. Melbourne Industrial ends at 2015 — label at its last year
    {
      transform: [{ filter: "datum.zone == 'West Melbourne (Industrial)' && datum.year == 2015" }],
      mark: { type: 'text', align: 'left', dx: 8, font: FONT, fontSize: 9.5, fontWeight: 400, color: C.faint },
      encoding: { text: { field: 'lbl' } }
    },
    // CBD annotation: rank 1 every year without exception
    {
      transform: [{ filter: "datum.zone == 'Melbourne (CBD)' && datum.year == 2010" }],
      mark: { type: 'text', align: 'center', dy: 15, font: FONT, fontSize: 9.5, fontStyle: 'italic', color: C.accent, fontWeight: 400 },
      encoding: { text: { value: 'always rank #1' } }
    }
  ]
});
