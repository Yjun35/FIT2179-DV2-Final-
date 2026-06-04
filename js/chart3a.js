// 3a. Dot map — every 2024 café as a circle over the City of Melbourne's
// property-parcel fabric (REQUIRED MAP). 10,550 parcels render as a fine urban
// "grain"; rendered via canvas (see usermeta) so the polygon count stays smooth.
const spec3a = base({
  config: CFG, height: 520,
  usermeta: { renderer: 'canvas' },
  projection: { type: 'mercator' },
  layer: [

    // ── property parcels (base-map texture) ─────────────────────────────────
    // Slimmed from the 9.2 MB City of Melbourne parcel GeoJSON by aggregate.py
    // (RDP-simplified, properties stripped). Faint figure-ground so café dots
    // dominate: light parchment fill, hairline warm strokes.
    {
      data: { url: 'data/melb_property_boundaries.json', format: { type: 'json', property: 'features' } },
      mark: {
        type: 'geoshape', fill: '#EAE0CB', fillOpacity: 0.7,
        stroke: '#B9A06B', strokeWidth: 0.35, strokeOpacity: 0.9
      }
    },

    // ── one circle per street address (property parcel), size = total seats ───
    {
      data: { url: 'data/clue_cafe_points.csv' },
      mark: { type: 'circle', opacity: 0.55, color: C.brown, stroke: C.dark, strokeWidth: 0.3 },
      encoding: {
        longitude: { field: 'longitude', type: 'quantitative' },
        latitude:  { field: 'latitude',  type: 'quantitative' },
        size: {
          field: 'total_seats', type: 'quantitative',
          scale: { type: 'sqrt', range: [8, 80] },
          legend: {
            title: 'Total seats', orient: 'bottom-right', titleFont: SERIF,
            values: [30, 100, 200, 400]
          }
        },
        tooltip: [
          { field: 'trading_name',    title: 'Venue',                  type: 'nominal' },
          { field: 'clue_small_area', title: 'Precinct',               type: 'nominal' },
          { field: 'venue_count',     title: 'Venues at this address',  type: 'quantitative', format: ',.0f' },
          { field: 'total_seats',     title: 'Seats here',             type: 'quantitative', format: ',.0f' },
          { field: 'indoor_seats',    title: 'Indoor seats',           type: 'quantitative', format: ',.0f' },
          { field: 'outdoor_seats',   title: 'Outdoor seats',          type: 'quantitative', format: ',.0f' }
        ]
      }
    },

    // ── CLUE zone labels — halo pass (white) ────────────────────────────────
    {
      data: { url: 'data/clue_zone_latest.csv' },
      transform: [{
        calculate: "datum.zone == 'Melbourne (CBD)' ? 'CBD' : datum.zone == 'Melbourne (Remainder)' ? 'Remainder' : datum.zone == 'West Melbourne (Residential)' ? 'West Melbourne' : datum.zone == 'West Melbourne (Industrial)' ? 'W Melb (Ind)' : datum.zone",
        as: 'lbl'
      }],
      mark: { type: 'text', font: FONT, fontSize: 9.5, fontWeight: 700, fill: C.paper, stroke: C.paper, strokeWidth: 3 },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:      { field: 'lbl', type: 'nominal' }
      }
    },

    // ── CLUE zone labels — text pass (dark) ─────────────────────────────────
    {
      data: { url: 'data/clue_zone_latest.csv' },
      transform: [{
        calculate: "datum.zone == 'Melbourne (CBD)' ? 'CBD' : datum.zone == 'Melbourne (Remainder)' ? 'Remainder' : datum.zone == 'West Melbourne (Residential)' ? 'West Melbourne' : datum.zone == 'West Melbourne (Industrial)' ? 'W Melb (Ind)' : datum.zone",
        as: 'lbl'
      }],
      mark: { type: 'text', font: FONT, fontSize: 9.5, fontWeight: 700, fill: C.dark },
      encoding: {
        longitude: { field: 'lon', type: 'quantitative' },
        latitude:  { field: 'lat', type: 'quantitative' },
        text:      { field: 'lbl', type: 'nominal' }
      }
    }

  ]
});
