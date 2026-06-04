"""Aggregation script: turns raw source files into small (<5MB) clean CSVs for the webpage.
Run from the data/ directory. Idempotent. Sources are NOT shipped to the browser."""
import pandas as pd, warnings, os, json
warnings.filterwarnings('ignore')
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# ============================================================ CLUE ============
clue = pd.read_csv('cafes-and-restaurants-with-seating-capacity.csv')
clue.columns = [c.strip() for c in clue.columns]
cafe = clue[clue['Industry (ANZSIC4) description'] == 'Cafes and Restaurants'].copy()
cafe['venue'] = cafe['Property ID'].astype(str) + '|' + cafe['Trading name'].astype(str)
IND, OUT = 'Seats - Indoor', 'Seats - Outdoor'

# 1. Yearly
def agg_year(g):
    return pd.Series({
        'cafe_count': g['venue'].nunique(),
        'indoor_seats': g.loc[g['Seating type'] == IND, 'Number of seats'].sum(),
        'outdoor_seats': g.loc[g['Seating type'] == OUT, 'Number of seats'].sum(),
    })
yearly = cafe.groupby('Census year').apply(agg_year).reset_index()
yearly.columns = ['year', 'cafe_count', 'indoor_seats', 'outdoor_seats']
yearly['total_seats'] = yearly['indoor_seats'] + yearly['outdoor_seats']
yearly['avg_seats_per_cafe'] = (yearly['total_seats'] / yearly['cafe_count']).round(1)
yearly['outdoor_pct'] = (yearly['outdoor_seats'] / yearly['total_seats'] * 100).round(1)
yearly['yoy_growth'] = (yearly['cafe_count'].pct_change() * 100).round(1)
yearly = yearly.astype({'cafe_count': int, 'indoor_seats': int, 'outdoor_seats': int, 'total_seats': int})
yearly.to_csv('clue_yearly.csv', index=False)

# 2. Zone x Year
def agg_zy(g):
    return pd.Series({'cafe_count': g['venue'].nunique(), 'total_seats': g['Number of seats'].sum()})
zy = cafe.groupby(['Census year', 'CLUE small area']).apply(agg_zy).reset_index()
zy.columns = ['year', 'zone', 'cafe_count', 'total_seats']
zy = zy.astype({'cafe_count': int, 'total_seats': int})
# per-year rank by café count (1 = most cafés) — derived data for the bump chart (3b)
zy['rank'] = zy.groupby('year')['cafe_count'].rank(ascending=False, method='first').astype(int)
zy.to_csv('clue_zone_year.csv', index=False)

# 3. Zone latest (2024) with density
gj = json.load(open('clue_small_areas.geojson'))
areas = {f['properties']['featurenam']: float(f['properties']['shape_area']) / 1e6 for f in gj['features']}
cents = {f['properties']['featurenam']: f['properties']['geo_point_2d'] for f in gj['features']}
latest = cafe[cafe['Census year'] == 2024]
def agg_zl(g):
    return pd.Series({
        'cafe_count': g['venue'].nunique(),
        'indoor_seats': g.loc[g['Seating type'] == IND, 'Number of seats'].sum(),
        'outdoor_seats': g.loc[g['Seating type'] == OUT, 'Number of seats'].sum(),
    })
zl = latest.groupby('CLUE small area').apply(agg_zl).reset_index().rename(columns={'CLUE small area': 'zone'})
zl['total_seats'] = zl['indoor_seats'] + zl['outdoor_seats']
zl['area_km2'] = zl['zone'].map(areas).round(3)
zl['lat'] = zl['zone'].map(lambda z: cents[z]['lat'])
zl['lon'] = zl['zone'].map(lambda z: cents[z]['lon'])
zl['density'] = (zl['cafe_count'] / zl['area_km2']).round(1)
zl['avg_seats'] = (zl['total_seats'] / zl['cafe_count']).round(1)
zl['outdoor_pct'] = (zl['outdoor_seats'] / zl['total_seats'] * 100).round(1)
zl = zl.astype({'cafe_count': int, 'indoor_seats': int, 'outdoor_seats': int, 'total_seats': int})
zl = zl.sort_values('cafe_count', ascending=False)
# Growth since 2002 for diverging-bar chart (3c replacement)
base_2002 = zy[zy['year'] == 2002][['zone', 'cafe_count']].rename(columns={'cafe_count': 'count_2002'})
zl = zl.merge(base_2002, on='zone', how='left')
zl['growth_pct_2002_2024'] = ((zl['cafe_count'] - zl['count_2002']) / zl['count_2002'] * 100).round(1)
zl = zl.drop(columns=['count_2002'])
zl.to_csv('clue_zone_latest.csv', index=False)

# 4. Cafe point layer (2024) — one row per unique property (street address).
# A parcel can host several venues, so venue_count exposes the gap between dots
# (addresses) and the venue-level density (cafe_count) used elsewhere.
def agg_pt(g):
    return pd.Series({
        'trading_name':    g['Trading name'].iloc[0],
        'longitude':       g['Longitude'].iloc[0],
        'latitude':        g['Latitude'].iloc[0],
        'clue_small_area': g['CLUE small area'].iloc[0],
        'venue_count':     int(g['venue'].nunique()),
        'indoor_seats':    int(g.loc[g['Seating type'] == IND, 'Number of seats'].sum()),
        'outdoor_seats':   int(g.loc[g['Seating type'] == OUT, 'Number of seats'].sum()),
    })
pts = latest.groupby('Property ID').apply(agg_pt).reset_index(drop=True)
pts['total_seats'] = pts['indoor_seats'] + pts['outdoor_seats']
pts = pts.dropna(subset=['longitude', 'latitude'])
pts[['trading_name','longitude','latitude','clue_small_area','venue_count',
     'indoor_seats','outdoor_seats','total_seats']].to_csv('clue_cafe_points.csv', index=False)

# ============================================== WITS: AUS imports 2023 =========
wits = pd.read_excel('WITS-By-HS6Product.xlsx', sheet_name='By-HS6Product')
wits['Partner'] = wits['Partner'].str.strip()
world_total_1000usd = wits.loc[wits['Partner'] == 'World', 'Trade Value 1000USD'].iloc[0]
wits = wits[~wits['Partner'].isin(['World', 'Australia', 'Other Asia, nes'])].copy()
wits['country'] = wits['Partner'].str.replace(r'\(.*\)', '', regex=True).str.strip()
ISO = {  # ISO numeric codes for vega world-110m TopoJSON join
    'Brazil': 76, 'Colombia': 170, 'Honduras': 340, 'Papua New Guinea': 598, 'Vietnam': 704,
    'Ethiopia': 231, 'India': 356, 'Nicaragua': 558, 'Peru': 604, 'Guatemala': 320,
    'Indonesia': 360, 'Uganda': 800, 'Mexico': 484, 'Costa Rica': 188, 'Kenya': 404,
    'Tanzania': 834, 'El Salvador': 222, 'Rwanda': 646, 'China': 156, 'Timor-Leste': 626,
    'Bolivia': 68, 'Ecuador': 218, 'T*me-Leste': 626, 'Burundi': 108, 'Panama': 591,
    'Thailand': 764, 'Switzerland': 756, 'Italy': 380, 'Germany': 276, 'United States': 840,
    'New Zealand': 554, 'Singapore': 702, 'United Kingdom': 826, 'Malaysia': 458,
    'Dem. Rep. of the Congo': 180, 'Yemen': 887, 'Cameroon': 120, 'Laos': 418,
    'Lao PDR': 418, 'Myanmar': 104, 'Sri Lanka': 144, 'Philippines': 608, 'Japan': 392,
    'Venezuela': 862, 'Dominican Republic': 214, 'Cuba': 192, 'Haiti': 332, 'Jamaica': 388,
    'Zambia': 894, 'Zimbabwe': 716, 'Madagascar': 450, 'France': 250, 'Netherlands': 528,
    'Spain': 724, 'Belgium': 56, 'Canada': 124, 'Korea, Rep.': 410, 'Rep. of Korea': 410,
    'East Timor': 626, 'Chile': 152, 'Denmark': 208, 'Hungary': 348, 'Nepal': 524,
    'Djibouti': 262, 'Western Sahara': 732,
}
wits['iso_n'] = wits['country'].map(ISO)
wits = wits.rename(columns={'Trade Value 1000USD': 'value_1000usd', 'Quantity': 'quantity_kg'})
wits['value_usd_m'] = (wits['value_1000usd'] / 1000).round(2)
wits['quantity_tonnes'] = (wits['quantity_kg'] / 1000).round(0)
wits['share_pct'] = (wits['value_1000usd'] / world_total_1000usd * 100).round(1)
# representative coffee-growing-region centroids (lat, lon) — for origin→Melbourne flow lines
ORIGIN_COORDS = {
    'Brazil': (-15.0, -47.0), 'Colombia': (4.6, -74.1), 'Honduras': (14.8, -86.5),
    'Papua New Guinea': (-6.3, 145.0), 'Vietnam': (14.1, 108.3), 'Ethiopia': (9.1, 40.5),
    'India': (13.0, 77.0), 'Nicaragua': (12.9, -85.2), 'Peru': (-9.2, -75.0),
    'Guatemala': (15.5, -90.3), 'Kenya': (0.5, 37.9), 'Indonesia': (-2.5, 118.0),
    'El Salvador': (13.8, -88.9), 'Costa Rica': (9.9, -84.0), 'Mexico': (17.0, -96.0),
    'Tanzania': (-6.4, 35.0), 'Uganda': (1.3, 32.5), 'Rwanda': (-1.9, 29.9),
    'Burundi': (-3.4, 29.9), 'Ecuador': (-1.5, -78.5), 'Bolivia': (-16.5, -65.0),
    'East Timor': (-8.8, 125.7), 'Yemen': (15.5, 44.2), 'Panama': (8.5, -80.0),
}
wits_out = wits[['country', 'iso_n', 'value_usd_m', 'quantity_tonnes', 'share_pct']].sort_values('value_usd_m', ascending=False).reset_index(drop=True)
wits_out.insert(0, 'rank', range(1, len(wits_out) + 1))
wits_out['origin_lat'] = wits_out['country'].map(lambda c: ORIGIN_COORDS.get(c, (None, None))[0])
wits_out['origin_lon'] = wits_out['country'].map(lambda c: ORIGIN_COORDS.get(c, (None, None))[1])
# A$/kg quality indicator — reveals commodity vs specialty origins
wits_out['value_per_tonne'] = (wits_out['value_aud_m'] * 1000 / wits_out['quantity_tonnes']).round(2)
wits_out.loc[wits_out['quantity_tonnes'] == 0, 'value_per_tonne'] = None
wits_out.to_csv('aus_imports_by_country.csv', index=False)
print("WITS unmapped countries:", wits[wits['iso_n'].isna()]['country'].tolist())

# ===================================== DFAT: AUS coffee trade over time ========
dfat = pd.read_excel('country-sitc-pivot-table-calendar-years.xlsx', sheet_name='Pivot', header=14)
coffee_row = dfat[dfat['Row Labels'].astype(str).str.contains('Coffee', na=False)].iloc[0]
years = [c for c in dfat.columns if isinstance(c, int)]
trade = pd.DataFrame({'year': years, 'export_value_aud_m': [round(coffee_row[y] / 1000, 1) for y in years]})
trade['export_yoy'] = (trade['export_value_aud_m'].pct_change() * 100).round(1)
trade.to_csv('aus_coffee_exports.csv', index=False)

# ===================================== ICO: world production (latest) ==========
prod = pd.read_csv('archive (4)/total-production.csv')
prod.columns = [str(c).strip() for c in prod.columns]
prod = prod.rename(columns={'total_production': 'country'})
prod['country'] = prod['country'].str.strip()
prod_ranked = prod[['country', '2018']].dropna().rename(columns={'2018': 'production_2018'})
prod_ranked['production_2018'] = prod_ranked['production_2018'].round(0)
prod_ranked = prod_ranked.sort_values('production_2018', ascending=False).reset_index(drop=True)
prod_ranked['producer_rank'] = range(1, len(prod_ranked) + 1)
prodl = prod_ranked[['country', 'production_2018']].head(15)
prodl.to_csv('world_production_top.csv', index=False)

# ===================== Slope chart (1c): world-producer rank → AUS-supplier rank =====
# Derived join of two sources. Producer rank from the FULL ICO list (so near-neighbours
# like PNG, a minor world producer but a major supplier to us, get a real rank).
prod_ranked['cmatch'] = prod_ranked['country'].replace({'Viet Nam': 'Vietnam'})
sup = wits_out[['country', 'rank', 'value_usd_m']].rename(columns={'rank': 'supplier_rank'})
slope = (sup[sup['supplier_rank'] <= 10]
         .merge(prod_ranked[['cmatch', 'producer_rank', 'production_2018']],
                left_on='country', right_on='cmatch', how='left')
         .drop(columns='cmatch'))
slope['producer_rank'] = slope['producer_rank'].astype('Int64')
slope = slope[['country', 'producer_rank', 'supplier_rank', 'production_2018', 'value_usd_m']]
slope.to_csv('producers_vs_suppliers.csv', index=False)

print("\n=== zone_latest ===")
print(zl.to_string())
print("\n=== imports top 12 ===")
print(wits_out.head(12).to_string())
print("\n=== aus coffee exports ===")
print(trade.to_string())
print("\n=== world production top ===")
print(prodl.to_string())

# ======================================================= SUBURB BOUNDARIES ===
# Fetch VIC suburb boundaries, filter to inner Melbourne bounding box, save
# a small GeoJSON (~15-20 suburbs) for the dot-map base layer in chart3a.
import urllib.request
VIC_SUBURBS_URL = (
    'https://raw.githubusercontent.com/tonywr71/GeoJson-Data/master/suburb-2-vic.geojson'
)
LON_MIN, LON_MAX = 144.89, 145.01
LAT_MIN, LAT_MAX = -37.87, -37.76

def _flatten_coords(item):
    if isinstance(item, (int, float)):
        return [item]
    flat = []
    for x in item:
        flat.extend(_flatten_coords(x))
    return flat

def _in_bbox(coords_flat):
    for i in range(0, len(coords_flat) - 1, 2):
        lon, lat = coords_flat[i], coords_flat[i+1]
        if LON_MIN <= lon <= LON_MAX and LAT_MIN <= lat <= LAT_MAX:
            return True
    return False

try:
    print('\nFetching VIC suburb boundaries...')
    with urllib.request.urlopen(VIC_SUBURBS_URL, timeout=60) as resp:
        vic_gj = json.loads(resp.read().decode('utf-8'))
    inner_mel = [f for f in vic_gj['features']
                 if _in_bbox(_flatten_coords(f['geometry']['coordinates']))]
    print(f'Filtered {len(vic_gj["features"])} VIC suburbs → {len(inner_mel)} inner Melbourne')
    mel_gj = {'type': 'FeatureCollection', 'features': inner_mel}
    with open('melbourne_suburbs.geojson', 'w') as fh:
        json.dump(mel_gj, fh)
    print('Wrote melbourne_suburbs.geojson')
except Exception as e:
    print(f'WARNING: Could not fetch suburb boundaries: {e}')


# ====================================================== PROPERTY PARCELS ===
# Slim the 9.2 MB City of Melbourne property-boundary GeoJSON (15,327 parcels)
# into a light texture layer for chart3a: strip all properties, simplify each
# ring with Ramer-Douglas-Peucker at ~5 m (finer than the ~11 m/px the chart
# renders, so invisible), round to 5 dp. Output ~2 MB, rendered via canvas.
#
# CRITICAL: the source is RFC-7946-wound (counter-clockwise exterior rings), but
# d3-geo — which Vega's geoshape uses — treats winding spherically and reads a
# CCW ring as its complement (almost the whole globe). Left unfixed, every parcel
# fills the viewport and the projection auto-fit collapses. So we REWIND to d3's
# convention: clockwise exterior rings, counter-clockwise holes.
PARCEL_EPS = 0.00006  # ~5 m in degrees; tuned for texture-coverage vs size

def _signed_area(ring):
    """Shoelace signed area; > 0 is counter-clockwise, < 0 is clockwise."""
    a = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        a += x1 * y2 - x2 * y1
    return a / 2.0

def _rewind(ring, want_clockwise):
    """Reverse the ring if its winding doesn't match the d3-geo convention."""
    is_ccw = _signed_area(ring) > 0
    return ring[::-1] if is_ccw == want_clockwise else ring

def _rdp(points, eps):
    """Iterative Ramer-Douglas-Peucker on a ring (list of [lon, lat])."""
    n = len(points)
    if n < 3:
        return points
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack, e2 = [(0, n - 1)], eps * eps
    while stack:
        s, e = stack.pop()
        ax, ay = points[s]
        bx, by = points[e]
        dx, dy = bx - ax, by - ay
        seg2 = dx * dx + dy * dy
        dmax, idx = -1.0, -1
        for i in range(s + 1, e):
            px, py = points[i]
            if seg2 == 0:
                ddx, ddy = px - ax, py - ay
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / seg2
                t = 0.0 if t < 0 else 1.0 if t > 1 else t
                ddx, ddy = px - (ax + t * dx), py - (ay + t * dy)
            d2 = ddx * ddx + ddy * ddy
            if d2 > dmax:
                dmax, idx = d2, i
        if dmax > e2 and idx != -1:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [points[i] for i in range(n) if keep[i]]

try:
    print('\nSlimming property boundaries...')
    raw = json.load(open('property-boundaries.geojson'))
    parcels = []
    for f in raw['features']:
        rings = []
        for ri, ring in enumerate(f['geometry']['coordinates']):
            simp = [[round(p[0], 5), round(p[1], 5)] for p in _rdp(ring, PARCEL_EPS)]
            dedup = [simp[0]]
            for p in simp[1:]:
                if p != dedup[-1]:
                    dedup.append(p)
            if dedup[0] != dedup[-1]:
                dedup.append(dedup[0])  # close ring
            if len(dedup) >= 4:
                # ring 0 is the exterior (want clockwise); the rest are holes (CCW)
                rings.append(_rewind(dedup, want_clockwise=(ri == 0)))
        if rings:
            parcels.append({'type': 'Feature', 'properties': {},
                            'geometry': {'type': 'Polygon', 'coordinates': rings}})
    out = {'type': 'FeatureCollection', 'features': parcels}
    with open('melb_property_boundaries.json', 'w') as fh:
        json.dump(out, fh, separators=(',', ':'))
    print(f'Slimmed {len(raw["features"])} parcels → {len(parcels)} '
          f'(wrote melb_property_boundaries.json)')
except FileNotFoundError:
    print('WARNING: property-boundaries.geojson not found; skipping parcel slim')
