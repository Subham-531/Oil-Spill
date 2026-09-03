# Demo Scenario — Mumbai / Arabian Sea Coast

## Region
- **Area:** Arabian Sea, offshore Mumbai — Jamnagar refinery shipping lane
- **Bounding box:** Approximately 71.5°E to 73.5°E, 18.0°N to 20.5°N
- **Rationale:** This is one of India's busiest tanker corridors. Crude oil is shipped from the Gulf through here to refineries at Jamnagar (world's largest) and Mumbai (BPCL). Tanker traffic density makes oil spill attribution both realistic and practically important.

## Scenario Narrative (for demo)
A Sentinel-1 SAR scene over the northern Arabian Sea shows a dark elongated patch ~2-3 km² consistent with an oil slick. The system:
1. **Detects** the slick and classifies it as oil (not a lookalike low-wind zone or biogenic film).
2. **Traces it backward** ~48h using OpenDrift with CMEMS currents and ERA5 winds to estimate where and when it originated — expressed as a spatial polygon + time window.
3. **Cross-references AIS traffic** in that origin window, filtering 25+ vessels down to ~5 candidates, and ranks them by explainable suspicion score.

The synthetic AIS data includes a **planted culprit tanker** whose track passes through the origin window with a brief AIS gap and speed anomaly — this vessel must rank #1 to validate the attribution pipeline.

## Data Requirements (all pre-cached for offline demo)

| Data | Source | Spatiotemporal Extent |
|---|---|---|
| SAR scene | Copernicus Data Space (Sentinel-1 GRD) | Demo region, specific acquisition TBD |
| Ocean currents | CMEMS | 71-74°E, 17.5-21°N, detection ± 72h |
| Wind (10m) | ERA5 via CDS | Same bbox, same time window |
| AIS data | Synthetic generator | Same region, 15-30 vessels over ~1 week window |

## Sentinel-1 Scene Selection Criteria
- **Mode:** IW (Interferometric Wide swath) — standard mode for maritime
- **Product:** GRD (Ground Range Detected) — not SLC
- **Polarization:** VV (or VV+VH) — oil slicks are most visible in co-pol VV
- **Coverage:** Must include open water in the Mumbai–Jamnagar lane
- **Time:** Ideally coincide with a documented historical spill event for narrative strength; if none found, any scene with a visible dark patch works

## Coordinates Reference
```
Demo center: 72.5°E, 19.5°N (approx. 150km west of Mumbai)
```

This places us squarely in the tanker corridor between Jamnagar and Mumbai — 
realistic for a tanker discharge scenario.
