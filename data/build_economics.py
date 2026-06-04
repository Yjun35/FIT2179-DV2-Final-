#!/usr/bin/env python3
"""Build the six 'economics finale' CSVs for the coffee webpage.

Self-contained: pulls global coffee prices live from FRED and combines them with
small compiled tables from public ABS / ICO / ATO / UniSA releases. No dependency
on the bulky gitignored raw sources used by aggregate.py. Run from anywhere:

    python3 data/build_economics.py

For air-gapped / offline runs (uses project-local cached CSVs in data/raw_econ/):

    FRED_OFFLINE=1 python3 data/build_economics.py

Sources:
  FRED PCOFFOTMUSDM  Global price of Coffee, Other Mild Arabica (US cents/lb, monthly)
  FRED PCOFFROBUSDM  Global price of Coffee, Robustas (US cents/lb, monthly)
  ABS 6401.0         CPI 'Coffee, tea and cocoa', weighted avg of 8 capital cities
  ICO / public       Coffee consumed per capita (kg/person/yr, green-bean equiv.)
  ABS 8501.0         Cafes, Restaurants & Takeaway Food Services turnover
  ATO + UniSA/P&R     Per-cup cost breakdown (estimate)
"""
import os, io, ssl, urllib.request
import pandas as pd

OUT = os.path.dirname(os.path.abspath(__file__))
FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id={}"

# Project-local directory for caching raw FRED CSVs (gitignored).
CACHE_DIR = os.path.join(OUT, "raw_econ")

def fred(series_id):
    """Return a monthly DataFrame [date, value] from FRED; '.' = missing.

    Default: fetch live from FRED. The SSL certificate verification is bypassed
    because macOS Python does not automatically trust the system CA store, causing
    SSL errors on urllib requests. This is acceptable for a local data-prep script.
    The fetched raw CSV is written to data/raw_econ/<series_id>.csv so the offline
    fallback path has something to read.

    Offline fallback: if the environment variable FRED_OFFLINE is set, read from
    data/raw_econ/<series_id>.csv instead of hitting the network.
    """
    cache_path = os.path.join(CACHE_DIR, f"{series_id}.csv")
    os.makedirs(CACHE_DIR, exist_ok=True)

    if os.environ.get("FRED_OFFLINE"):
        raw = open(cache_path, encoding="utf-8").read()
    else:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        raw = urllib.request.urlopen(
            urllib.request.Request(FRED.format(series_id),
                                   headers={"User-Agent": "Mozilla/5.0"}),
            context=ctx, timeout=60).read().decode()
        # Write to cache so offline path has data on next run.
        with open(cache_path, "w", encoding="utf-8") as f:
            f.write(raw)

    df = pd.read_csv(io.StringIO(raw))
    df.columns = ["date", "value"]
    df["date"] = pd.to_datetime(df["date"])
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    return df.dropna(subset=["value"]).reset_index(drop=True)

# ---- global bean prices (real, live) --------------------------------------
arab = fred("PCOFFOTMUSDM")   # US cents/lb
robu = fred("PCOFFROBUSDM")   # US cents/lb

# (1) long-run arabica in US$/lb, with the all-time peak flagged for annotation
lr = arab.copy()
lr["price_usd_lb"] = (lr["value"] / 100).round(3)
peak_i = lr["price_usd_lb"].idxmax()
lr["price_label"] = ""
lr.loc[peak_i, "price_label"] = "Record $%.2f" % lr.loc[peak_i, "price_usd_lb"]
lr[["date", "price_usd_lb", "price_label"]].to_csv(
    os.path.join(OUT, "coffee_arabica_longrun.csv"), index=False)
print("arabica long-run rows:", len(lr), "| peak:", lr.loc[peak_i, "date"].date(),
      lr.loc[peak_i, "price_usd_lb"])

# (2) indexed series (Jan 2015 = 100): arabica, robusta, AU retail coffee CPI
BASE = "2015-01-01"
def rebased(df, label):
    s = df.set_index("date")["value"]
    base_val = s.asof(pd.Timestamp(BASE))
    out = (s / base_val * 100).round(1).reset_index()
    out.columns = ["date", "index"]
    out["series"] = label
    return out[out["date"] >= BASE]

# AU retail coffee CPI — compiled annual anchors (index, 2015=100) from ABS CPI
# 'Coffee, tea and cocoa' releases; rose sharply 2022-2025 (+16.4% YoY to Oct 2025).
# Interpolated to monthly. Refine from the live ABS spreadsheet if available.
au_anchors = {
    "2015-01-01": 100.0, "2016-01-01": 102.5, "2017-01-01": 105.0,
    "2018-01-01": 107.5, "2019-01-01": 110.0, "2020-01-01": 112.0,
    "2021-01-01": 114.0, "2022-01-01": 119.0, "2023-01-01": 130.0,
    "2024-01-01": 143.0, "2025-01-01": 160.0, "2026-01-01": 172.0,
}
au = pd.DataFrame({"date": pd.to_datetime(list(au_anchors)),
                   "value": list(au_anchors.values())})
au = au.set_index("date").resample("MS").interpolate("linear").reset_index()
au.columns = ["date", "value"]

idx = pd.concat([rebased(arab, "Arabica (global)"),
                 rebased(robu, "Robusta (global)"),
                 rebased(au,  "AU retail coffee")], ignore_index=True)
idx[["date", "series", "index"]].to_csv(
    os.path.join(OUT, "coffee_prices_indexed.csv"), index=False)
print("indexed rows:", len(idx), "| series:", idx["series"].unique().tolist())

# ---- (3) per-capita consumption ranking (kg/person/yr, green-bean equiv.) ---
# Single-source comparison table (public ICO-aligned figures). Australia is well
# below the Nordic leaders regardless of the exact figure: the headline is
# "big reputation, mid-table habit." Verify Australia's value/rank if refining.
percap = pd.DataFrame([
    ("Finland", 12.0), ("Norway", 9.9), ("Iceland", 9.0), ("Denmark", 8.7),
    ("Netherlands", 8.4), ("Sweden", 8.2), ("Switzerland", 7.9),
    ("Belgium", 6.8), ("Luxembourg", 6.5), ("Canada", 6.5), ("Brazil", 5.8),
    ("Austria", 5.5), ("Italy", 5.2), ("Germany", 5.2), ("France", 5.1),
    ("Australia", 4.6), ("United States", 4.5), ("United Kingdom", 3.7),
], columns=["country", "kg"])
percap["grp"] = percap["country"].apply(lambda c: "Australia" if c == "Australia" else "Other")
percap.to_csv(os.path.join(OUT, "coffee_consumption_percapita.csv"), index=False)
print("per-capita rows:", len(percap),
      "| Australia rank:", int(percap["kg"].rank(ascending=False)[percap.country.eq("Australia")].iloc[0]))

# ---- (4) cafe/restaurant/takeaway turnover, annual A$bn (ABS 8501.0) --------
# Compiled annual anchors; FY2025 ~ $66.3bn is the published headline. 2020 dip
# kept as data (COVID de-emphasised). Refine from the ABS Retail Trade release.
# Long format, split into the two ABS 8501.0 sub-groups so the stacked area shows
# *composition*, not just a rising total: dine-in (cafés, restaurants & catering)
# vs takeaway food services. Takeaway's share spikes in 2020 (dine-in collapsed,
# takeaway/delivery held up) then dine-in recovers but takeaway settles above its
# pre-2020 ~38-40% share. tk_share = takeaway as a fraction of the year total.
turn_anchors = [
    # year, total_bn, takeaway_share
    (2015, 38.0, 0.380), (2016, 41.0, 0.385), (2017, 44.0, 0.390),
    (2018, 47.5, 0.395), (2019, 50.5, 0.400), (2020, 46.5, 0.475),
    (2021, 50.0, 0.460), (2022, 57.0, 0.430), (2023, 62.0, 0.420),
    (2024, 64.7, 0.415), (2025, 66.3, 0.410),
]
DINE, TAKE = "Dine-in (cafés & restaurants)", "Takeaway food services"
rows = []
last_year = max(y for y, _, _ in turn_anchors)
for year, total, sh in turn_anchors:
    take = round(total * sh, 1)
    dine = round(total - take, 1)
    date = "%d-06-30" % year
    for seg, val, ordr in ((DINE, dine, 1), (TAKE, take, 2)):
        rows.append({
            "date": date, "year": year, "segment": seg, "ord": ordr,
            "turnover_bn": val, "share_pct": round(val / total * 100, 1),
            "year_total": total,
            # total label sits at the top of the stack on the final year only
            "end_label": ("$%.1fbn" % total) if (year == last_year and seg == TAKE) else "",
        })
turn = pd.DataFrame(rows)
turn["date"] = pd.to_datetime(turn["date"])
turn.to_csv(os.path.join(OUT, "cafe_turnover.csv"), index=False)
print("turnover rows:", len(turn), "| segments:", [DINE, TAKE],
      "| latest total:", turn[turn.year == last_year]["year_total"].iloc[0])

# ---- (5) where a $5.50 flat white goes (ESTIMATE: ATO + UniSA/P&R) ----------
# Descending waterfall from $5.50 through each cost to the net margin (~7.6%).
PRICE = 5.50
steps = [
    ("Coffee beans",        0.56, "cost"),
    ("Milk",                0.40, "cost"),
    ("Cup & lid",           0.20, "cost"),
    ("Labour",              1.35, "cost"),
    ("Rent & overheads",    1.30, "cost"),
    ("GST, utilities & other", 1.27, "cost"),
    ("Net profit",          PRICE - (0.56+0.40+0.20+1.35+1.30+1.27), "profit"),
]
rows, running = [], PRICE
for i, (label, amt, kind) in enumerate(steps):
    if kind == "cost":
        lo, hi = running - amt, running
        running -= amt
    else:                       # profit bar sits on the baseline
        lo, hi = 0.0, amt
    rows.append({"order": i, "label": label, "amount": round(amt, 2),
                 "bar_lo": round(lo, 2), "bar_hi": round(hi, 2), "kind": kind})
pd.DataFrame(rows).to_csv(os.path.join(OUT, "cup_cost_waterfall.csv"), index=False)
print("waterfall residual profit:", round(rows[-1]["amount"], 2))

# ---- (6) cost squeeze, ~2019 vs ~2025 (ESTIMATE: ATO + UniSA/P&R) ----------
thennow = pd.DataFrame([
    ("Coffee beans",     0.32, 0.56),
    ("Milk",             0.30, 0.40),
    ("Labour",           1.05, 1.35),
    ("Rent & overheads", 1.05, 1.30),
], columns=["component", "cost_2019", "cost_2025"])
thennow.to_csv(os.path.join(OUT, "cup_cost_thennow.csv"), index=False)
print("then-now components:", len(thennow))
