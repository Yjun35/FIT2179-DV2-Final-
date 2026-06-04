// 7a. Top-down coffee-mug donut — where a $5.50 flat white goes (estimate).
// The ring is the coffee surface seen from above; a handle + rim make the mug.
// Costs use a dark->light brown ramp (darkest = dearest); net profit = gold.
const COST_DOMAIN = [
  'Labour', 'Rent & overheads', 'GST, utilities & other',
  'Coffee beans', 'Milk', 'Cup & lid', 'Net profit'
];
const COST_RANGE = [C.dark, C.ink, C.brown, C.medium, C.light, C.muted, C.goldDeep];

const spec7a = base({
  config: CFG, height: 380,
  view: { stroke: null },
  layer: [
    // --- rim: thin ring at the lip of the cup -----------------------------
    {
      data: { values: [{}] },
      mark: {
        type: 'arc', theta: 0, theta2: 6.2832,
        innerRadius: 121, outerRadius: 129, fill: C.light, fillOpacity: 0.7
      }
    },
    // --- handle: rounded looped C on the right (brown body, punched hole) --
    {
      data: { values: [{}] },
      mark: {
        type: 'arc', theta: 0.95, theta2: 2.19,
        innerRadius: 121, outerRadius: 150, cornerRadius: 30,
        fill: C.medium
      }
    },
    {
      data: { values: [{}] },
      mark: {
        type: 'arc', theta: 1.2, theta2: 1.94,
        innerRadius: 130, outerRadius: 141, cornerRadius: 20,
        fill: C.paper
      }
    },
    // --- the coffee: cost + profit slices ---------------------------------
    {
      data: { url: 'data/cup_cost_waterfall.csv' },
      transform: [
        { joinaggregate: [{ op: 'sum', field: 'amount', as: 'total' }] },
        { calculate: 'datum.amount / datum.total', as: 'frac' },
        { calculate: "datum.kind === 'profit' ? 100 : 100 - datum.amount", as: 'ord' }
      ],
      layer: [
        {
          mark: {
            type: 'arc', innerRadius: 70, outerRadius: 120,
            cornerRadius: 2, padAngle: 0.012, stroke: C.paper, strokeWidth: 1.5
          },
          encoding: {
            theta: { field: 'amount', type: 'quantitative', stack: true },
            order: { field: 'ord', type: 'quantitative' },
            color: {
              field: 'label', type: 'nominal',
              scale: { domain: COST_DOMAIN, range: COST_RANGE },
              legend: {
                title: null, orient: 'bottom', direction: 'horizontal',
                symbolType: 'circle', symbolSize: 130, labelFontSize: 11.5,
                columnPadding: 18, offset: 18
              }
            },
            tooltip: [
              { field: 'label', title: 'Component' },
              { field: 'amount', title: 'A$ per cup', format: '$.2f' },
              { field: 'frac', title: 'Share of cup', format: '.1%' }
            ]
          }
        },
        // --- per-slice share labels on the larger slices -----------------
        {
          mark: { type: 'text', radius: 96, font: FONT, fontSize: 10, fontWeight: 700 },
          encoding: {
            theta: { field: 'amount', type: 'quantitative', stack: true },
            order: { field: 'ord', type: 'quantitative' },
            text: { field: 'frac', type: 'quantitative', format: '.0%' },
            opacity: { condition: { test: 'datum.frac >= 0.05', value: 1 }, value: 0 },
            color: {
              condition: { test: "datum.amount > 0.7 && datum.kind !== 'profit'", value: '#FFFFFF' },
              value: C.dark
            }
          }
        }
      ]
    },
    // --- centre of the cup: the headline figure --------------------------
    {
      data: { values: [{ t: '$5.50', sub: 'per cup', note: 'Café keeps 8%' }] },
      mark: { type: 'text', dy: -12, font: SERIF, fontSize: 34, fontWeight: 700, fill: C.dark },
      encoding: { text: { field: 't' } }
    },
    {
      data: { values: [{ sub: 'per cup' }] },
      mark: { type: 'text', dy: 12, font: FONT, fontSize: 12, fill: C.faint },
      encoding: { text: { field: 'sub' } }
    },
    {
      data: { values: [{ note: 'Café keeps 8%' }] },
      mark: { type: 'text', dy: 34, font: SERIF, fontSize: 13, fontWeight: 700, fontStyle: 'italic', fill: C.goldDeep },
      encoding: { text: { field: 'note' } }
    }
  ]
});
