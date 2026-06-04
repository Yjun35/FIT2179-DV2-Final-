// 6a. Ranked lollipop: per-capita coffee consumption, Australia highlighted
const spec6a = base({
  config: CFG, height: 420,
  data: { url: 'data/coffee_consumption_percapita.csv' },
  encoding: {
    y: {
      field: 'country', type: 'nominal',
      sort: { field: 'kg', order: 'descending' },
      title: null, axis: { labelFontSize: 11 }
    }
  },
  layer: [
    {
      mark: { type: 'rule', color: C.light, strokeWidth: 2 },
      encoding: {
        x: {
          field: 'kg', type: 'quantitative',
          title: 'Coffee per person, kg/year',
          axis: { grid: true, gridColor: C.hair }
        },
        x2: { datum: 0 }
      }
    },
    {
      mark: { type: 'point', filled: true, size: 120, stroke: C.paper, strokeWidth: 0.8 },
      encoding: {
        x: { field: 'kg', type: 'quantitative' },
        color: {
          field: 'grp', type: 'nominal',
          scale: { domain: ['Australia', 'Other'], range: [C.accent, C.brown] },
          legend: null
        },
        tooltip: [
          { field: 'country', title: 'Country' },
          { field: 'kg', title: 'kg/person/yr', format: '.1f' }
        ]
      }
    },
    {
      transform: [{ filter: "datum.grp === 'Australia'" }],
      mark: { type: 'text', align: 'left', dx: 9, font: FONT, fontSize: 10, fontWeight: 700, color: C.accent },
      encoding: {
        x: { field: 'kg', type: 'quantitative' },
        text: { value: 'Australia: 4.6 kg — third from last' }
      }
    }
  ]
});
