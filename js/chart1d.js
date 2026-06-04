// 1d. Bar chart: roasted coffee export boom, YOY direction encoded as bar colour
const spec1d = base({
  config: CFG, height: 320,
  data: { url: 'data/aus_coffee_exports.csv' },
  transform: [
    {
      calculate: 'datum.export_yoy == null || datum.export_yoy >= 0 ? "Growth year" : "Decline year"',
      as: 'dir'
    }
  ],
  layer: [
    {
      mark: { type: 'bar', cornerRadiusTopLeft: 2, cornerRadiusTopRight: 2 },
      encoding: {
        x: {
          field: 'year', type: 'ordinal', title: 'Year',
          axis: { labelAngle: -45, labelFontSize: 10.5 }
        },
        y: {
          field: 'export_value_aud_m', type: 'quantitative',
          title: 'A$ millions', axis: { grid: true, gridColor: C.hair }
        },
        color: {
          field: 'dir', type: 'nominal',
          scale: { domain: ['Growth year', 'Decline year'], range: [C.gold, C.accent] },
          legend: { title: null, orient: 'bottom', direction: 'horizontal', symbolSize: 120, labelFontSize: 11 }
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'export_value_aud_m', title: 'Export value (A$M)', format: '.1f' },
          { field: 'export_yoy', title: 'YOY growth %', format: '+.1f' }
        ]
      }
    },
    // 2011 surge annotation (+35% YOY)
    {
      transform: [
        { filter: 'datum.year == 2011' },
        { calculate: '"+" + format(datum.export_yoy, ".0f") + "% surge"', as: 'lbl' }
      ],
      mark: {
        type: 'text', align: 'center', dy: -11, font: SERIF,
        fontSize: 11, fontWeight: 600, color: C.dark
      },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'export_value_aud_m', type: 'quantitative' },
        text: { field: 'lbl' }
      }
    },
    // 2019 dip annotation (-17% YOY)
    {
      transform: [
        { filter: 'datum.year == 2019' },
        { calculate: 'format(datum.export_yoy, ".0f") + "% drop"', as: 'lbl' }
      ],
      mark: {
        type: 'text', align: 'center', dy: -11, font: SERIF,
        fontSize: 11, fontWeight: 600, color: C.accent
      },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'export_value_aud_m', type: 'quantitative' },
        text: { field: 'lbl' }
      }
    },
    // 2025 record peak annotation
    {
      transform: [
        { filter: 'datum.year == 2025' },
        { calculate: '"A$" + format(datum.export_value_aud_m, ".0f") + "M record"', as: 'lbl' }
      ],
      mark: {
        type: 'text', align: 'right', dx: -4, dy: -12, font: SERIF,
        fontSize: 12, fontWeight: 700, color: C.dark
      },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'export_value_aud_m', type: 'quantitative' },
        text: { field: 'lbl' }
      }
    }
  ]
});
