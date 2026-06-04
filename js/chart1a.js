// 1a. Flow map: the bean journey. Origins in muted earth tones; flow-lines and
// dots in bright gold so it reads as a flow map, not a choropleth.
const MEL_LON = 144.96, MEL_LAT = -37.81;

const spec1a = base({
  config: CFG_DARK, height: 540, background: null,
  projection: { type: 'naturalEarth1' },
  layer: [
    // land base — dark so the bright flows pop
    {
      data: { url: WORLD, format: { type: 'topojson', feature: 'countries' } },
      transform: [{ filter: 'datum.id !== 10' }],
      mark: { type: 'geoshape', fill: '#543018', stroke: '#6B4226', strokeWidth: 0.4 }
    },
    // coffee-origin countries — lighter tan so they stand out from the base land
    {
      data: { url: WORLD, format: { type: 'topojson', feature: 'countries' } },
      transform: [
        {
          lookup: 'id', from: {
            data: { url: IMP },
            key: 'iso_n', fields: ['value_aud_m', 'country', 'share_pct']
          }
        },
        { filter: 'datum.value_aud_m != null' }
      ],
      mark: { type: 'geoshape', fill: '#8B5E28', stroke: '#A07030', strokeWidth: 0.5 },
      encoding: {
        tooltip: [
          { field: 'country', title: 'Origin' },
          { field: 'value_aud_m', title: 'Value (A$M)', format: '.1f' },
          { field: 'share_pct', title: 'Share of imports %', format: '.1f' }]
      }
    },
    // flow lines: origin -> Melbourne, thickness = import value (bright gold)
    {
      data: { url: IMP },
      transform: [{ filter: 'datum.origin_lat != null && datum.rank <= 15' }],
      mark: { type: 'rule', color: '#FFCE4A', opacity: 0.9, strokeCap: 'round' },
      encoding: {
        longitude: { field: 'origin_lon', type: 'quantitative' },
        latitude: { field: 'origin_lat', type: 'quantitative' },
        longitude2: { datum: MEL_LON }, latitude2: { datum: MEL_LAT },
        strokeWidth: {
          field: 'value_aud_m', type: 'quantitative',
          scale: { range: [0.7, 4.5] }, legend: null
        }
      }
    },
    // origin source dots, sized by value
    {
      data: { url: IMP },
      transform: [{ filter: 'datum.origin_lat != null && datum.rank <= 15' }],
      mark: { type: 'circle', color: '#FFF3D6', stroke: '#2C1810', strokeWidth: 0.7, opacity: 1 },
      encoding: {
        longitude: { field: 'origin_lon', type: 'quantitative' },
        latitude: { field: 'origin_lat', type: 'quantitative' },
        size: {
          field: 'value_aud_m', type: 'quantitative', scale: { range: [30, 520] },
          legend: null
        },
        tooltip: [{ field: 'country', title: 'Origin' },
        { field: 'value_aud_m', title: 'A$M', format: '.1f' },
        { field: 'share_pct', title: 'Share %', format: '.1f' }]
      }
    },
    // labels for the top origins (white text + dark halo)
    {
      data: { url: IMP },
      transform: [{ filter: 'datum.rank <= 6' }],
      mark: {
        type: 'text', font: FONT, fontSize: 12, fontWeight: 700,
        fill: '#FFFFFF', stroke: '#231206', strokeWidth: 3, dy: -12
      },
      encoding: {
        longitude: { field: 'origin_lon', type: 'quantitative' },
        latitude: { field: 'origin_lat', type: 'quantitative' },
        text: { field: 'country', type: 'nominal' }
      }
    },
    {
      data: { url: IMP },
      transform: [{ filter: 'datum.rank <= 6' }],
      mark: { type: 'text', font: FONT, fontSize: 12, fontWeight: 700, fill: '#FFFFFF', dy: -12 },
      encoding: {
        longitude: { field: 'origin_lon', type: 'quantitative' },
        latitude: { field: 'origin_lat', type: 'quantitative' },
        text: { field: 'country', type: 'nominal' }
      }
    },
    // Melbourne destination hub + label
    {
      data: { values: [{ lon: MEL_LON, lat: MEL_LAT }] },
      mark: {
        type: 'point', shape: 'circle', filled: true, color: C.accent,
        size: 170, stroke: '#FFFFFF', strokeWidth: 2
      },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude: { field: 'lat', type: 'quantitative' }
      }
    },
    {
      data: { values: [{ lon: MEL_LON, lat: MEL_LAT, t: 'MELBOURNE' }] },
      mark: {
        type: 'text', font: SERIF, fontSize: 14, fontWeight: 700,
        fill: '#FFFFFF', stroke: '#231206', strokeWidth: 3, dy: 20
      },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude: { field: 'lat', type: 'quantitative' },
        text: { field: 't', type: 'nominal' }
      }
    },
    {
      data: { values: [{ lon: MEL_LON, lat: MEL_LAT, t: 'MELBOURNE' }] },
      mark: { type: 'text', font: SERIF, fontSize: 14, fontWeight: 700, fill: '#FFFFFF', dy: 20 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude: { field: 'lat', type: 'quantitative' },
        text: { field: 't', type: 'nominal' }
      }
    },
    // ── LEGEND: two stacked boxes, LEFT edges aligned at lon -174 (Southern Ocean) ──
    // Box 1: lon -174→-134 (40° wide).  Box 2: lon -174→-124 (50° wide).
    // 1.5° gap between boxes; no land/flow-line overlap at these southern latitudes.

    // Box 1: COLOUR KEY
    // lon1=-151 compensates for naturalEarth1 horizontal compression at lat≈-58
    // vs Box 2 at lat≈-72 — both project to the same pixel x at their respective latitudes.
    { data: { values: [{ lon1: -151, lat1: -52, lon2: -111, lat2: -64 }] },
      mark: { type: 'rect', fill: '#F5F1E8', opacity: 0.97,
              stroke: '#8B5E28', strokeWidth: 1.5, cornerRadius: 3 },
      encoding: {
        longitude:  { field: 'lon1', type: 'quantitative' },
        latitude:   { field: 'lat1', type: 'quantitative' },
        longitude2: { field: 'lon2' },
        latitude2:  { field: 'lat2' }
      }
    },
    { data: { values: [{ lon: -148, lat: -54, label: 'COLOUR KEY' }] },
      mark: { type: 'text', align: 'left', font: FONT, fontSize: 10, fontWeight: 700 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:  { field: 'label', type: 'nominal' },
        color: { value: '#2C1810' }
      }
    },
    { data: { values: [{ lon: -149.5, lat: -58 }] },
      mark: { type: 'point', shape: 'square', size: 55, filled: true, color: '#8B5E28' },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' }
      }
    },
    { data: { values: [{ lon: -149.5, lat: -62 }] },
      mark: { type: 'point', shape: 'square', size: 55, filled: true, color: '#543018' },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' }
      }
    },
    { data: { values: [
        { lon: -146.5, lat: -58, label: 'Coffee-origin country' },
        { lon: -146.5, lat: -62, label: 'Other country' }
      ] },
      mark: { type: 'text', align: 'left', font: FONT, fontSize: 10, fontWeight: 400 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:  { field: 'label', type: 'nominal' },
        color: { value: '#3D2010' }
      }
    },

    // Box 2: IMPORT VALUE (50° wide, bigger — lon -174→-124, lat -65.5→-82)
    { data: { values: [{ lon1: -174, lat1: -65.5, lon2: -124, lat2: -82 }] },
      mark: { type: 'rect', fill: '#F5F1E8', opacity: 0.97,
              stroke: '#8B5E28', strokeWidth: 1.5, cornerRadius: 3 },
      encoding: {
        longitude:  { field: 'lon1', type: 'quantitative' },
        latitude:   { field: 'lat1', type: 'quantitative' },
        longitude2: { field: 'lon2' },
        latitude2:  { field: 'lat2' }
      }
    },
    { data: { values: [{ lon: -171, lat: -67.5, label: 'IMPORT VALUE (A$M)' }] },
      mark: { type: 'text', align: 'left', font: FONT, fontSize: 10, fontWeight: 700 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:  { field: 'label', type: 'nominal' },
        color: { value: '#2C1810' }
      }
    },
    // ramp: -172 → -127.5, 44.5° span (10 × 4° + 9 × 0.5°)
    { data: { values: [
        { lon: -172.0, lon2: -168.0, sw: 0.7  },
        { lon: -167.5, lon2: -163.5, sw: 1.1  },
        { lon: -163.0, lon2: -159.0, sw: 1.5  },
        { lon: -158.5, lon2: -154.5, sw: 1.9  },
        { lon: -154.0, lon2: -150.0, sw: 2.35 },
        { lon: -149.5, lon2: -145.5, sw: 2.75 },
        { lon: -145.0, lon2: -141.0, sw: 3.15 },
        { lon: -140.5, lon2: -136.5, sw: 3.55 },
        { lon: -136.0, lon2: -132.0, sw: 4.0  },
        { lon: -131.5, lon2: -127.5, sw: 4.5  }
      ] },
      mark: { type: 'rule', color: '#FFCE4A', strokeCap: 'round' },
      encoding: {
        longitude:  { field: 'lon',  type: 'quantitative' },
        latitude:   { datum: -72 },
        longitude2: { field: 'lon2' },
        latitude2:  { datum: -72 },
        strokeWidth: { field: 'sw', type: 'quantitative', scale: null, legend: null }
      }
    },
    // value labels proportional to A$ value (ramp -172 → -127.5, span 44.5°)
    { data: { values: [
        { lon: -172.0, lat: -77.5, label: 'A$9M'   },
        { lon: -160.5, lat: -77.5, label: 'A$50M'  },
        { lon: -146.6, lat: -77.5, label: 'A$100M' },
        { lon: -127.5, lat: -77.5, label: 'A$168M' }
      ] },
      mark: { type: 'text', align: 'center', font: FONT, fontSize: 10, fontWeight: 500 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:  { field: 'label', type: 'nominal' },
        color: { value: '#5A3A1E' }
      }
    }
  ]
});
