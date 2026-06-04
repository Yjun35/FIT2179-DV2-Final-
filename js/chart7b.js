// 7b. Grouped bar: a flat white's input costs, ~2019 vs ~2025 (estimate)
const spec7b = base({
  config: CFG, height: 300,
  padding: { left: 10, top: 0, right: 0, bottom: 0 },
  data: { url: 'data/cup_cost_thennow.csv' },
  transform: [
    { calculate: "'+' + format((datum.cost_2025 - datum.cost_2019)/datum.cost_2019, '.0%')", as: 'pctlabel' }
  ],
  encoding: {
    y: {
      field: 'component', type: 'nominal',
      sort: ['Labour', 'Rent & overheads', 'Coffee beans', 'Milk'],
      title: null, axis: { labelFontSize: 11 }
    }
  },
  layer: [
    {
      transform: [
        { fold: ['cost_2019', 'cost_2025'], as: ['yr', 'cost'] },
        { calculate: "datum.yr === 'cost_2019' ? '~2019' : '~2025'", as: 'Year' }
      ],
      mark: { type: 'bar' },
      encoding: {
        x: {
          field: 'cost', type: 'quantitative', title: 'A$ per cup',
          scale: { domain: [0, 1.85] },
          axis: { grid: true, gridColor: C.hair, format: '$.2f' }
        },
        yOffset: { field: 'Year', type: 'nominal' },
        color: {
          field: 'Year', type: 'nominal',
          scale: { domain: ['~2019', '~2025'], range: [C.light, C.accent] },
          legend: { title: null, orient: 'top' }
        },
        tooltip: [
          { field: 'component', title: 'Input' },
          { field: 'Year' },
          { field: 'cost', title: 'A$', format: '$.2f' }
        ]
      }
    },
    {
      transform: [
        { fold: ['cost_2019', 'cost_2025'], as: ['yr', 'cost'] },
        { calculate: "datum.yr === 'cost_2019' ? '~2019' : '~2025'", as: 'Year' }
      ],
      mark: { type: 'text', align: 'left', dx: 4, fontSize: 10, font: FONT, color: C.ink },
      encoding: {
        x: { field: 'cost', type: 'quantitative' },
        yOffset: { field: 'Year', type: 'nominal' },
        text: { field: 'cost', format: '$.2f' }
      }
    },
    {
      mark: { type: 'text', align: 'center', baseline: 'middle', font: SERIF },
      encoding: {
        x: { datum: 1.7, type: 'quantitative' },
        text: { field: 'pctlabel' },
        color: {
          condition: { test: "datum.component === 'Coffee beans'", value: C.accent },
          value: C.brown
        },
        size: {
          condition: { test: "datum.component === 'Coffee beans'", value: 14 },
          value: 11
        }
      }
    }
  ]
});
