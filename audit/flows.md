# AUDIT FLOWS — End-to-End Traces & Threat Model

## 1. End-to-End Flow 1: Detection → Drift → Attribution Pipeline

```
[User Action: Run Analysis / Select Scene]
                 │
                 ▼
      1. POST /api/detect/
         ├─► Upload TIFF or select scene_id
         ├─► SpillDetector.detect_spill()
         │    ├─► Tiled U-Net prediction + Test-Time Augmentation (TTA)
         │    ├─► Precision-Recall thresholding + Morphological closing
         │    └─► Polygon vectorization & Bonn Agreement volume estimation
         └─► Returns: GeoJSON FeatureCollection (Spill Polygon)
                 │
                 ▼
      2. POST /api/drift/
         ├─► Pass spill polygon + detection timestamp
         ├─► DriftSimulator.run_simulation()
         │    ├─► OpenDrift (OpenOil) with CMEMS currents + ERA5 wind
         │    └─► Fallback: Kinematic advection model (-0.013 m/s u, -0.012 m/s v)
         └─► Returns: Backward Hindcast (-12h origin) + Forward Forecast (+12h spread)
                 │
                 ▼
      3. POST /api/attribute/
         ├─► Pass origin polygon + time window
         ├─► AttributionAnalyzer.attribute_spill()
         │    ├─► Fetch vessels (Live AIS SQLite / NOAA DuckDB / Corridor Generator)
         │    ├─► Score candidates (Spatial + Temporal + Vessel Type + Anomaly)
         │    └─► Rank suspects (0-100 score)
         └─► Returns: Ranked suspect vessels + track GeoJSON
```

---

## 2. End-to-End Flow 2: Live AIS Ingestion & Replay

```
[AISStream.io WebSocket] ──► LiveAISManager._listen_websocket()
                                      │
                                      ▼
                        Batch Buffer (flush every 5s / 50 msgs)
                                      │
                                      ▼
                        SQLite Database (data/ais/live_ais_buffer.db)
                        [WAL mode enabled, 24h rolling prune]
                                      │
                     ┌────────────────┴────────────────┐
                     ▼                                 ▼
         GET /api/attribute/live           GET /api/attribute/history
         (Live 30-min snapshot)            (Last N-hour track history)
```

---

## 3. Threat Model — Trust Boundaries

### Boundary 1: Browser ↔ API (`http://localhost:8000`)
- **Trust Level:** Untrusted client input.
- **Threats Identified:**
  - Arbitrary file upload without size cap or MIME validation on `/api/detect/` ([F-004]).
  - Path traversal in `scene_id` query parameter on `/api/detect/` ([F-005]).
  - Race condition in global mutable cache `LATEST_ATTRIBUTION_CACHE` on `/api/attribute/report` ([F-006]).

### Boundary 2: API ↔ Third-Party WebServices (AISStream.io)
- **Trust Level:** Authenticated WebSocket connection over TLS.
- **Threats Identified:**
  - Hardcoded API key `645213e4c0454c7c95c9a952579d68eb520d8a37` committed in source code ([F-001]).

### Boundary 3: Dataset Ingestion / Model Training
- **Trust Level:** Remote mirror datasets (Hugging Face / Open CDN).
- **Threats Identified:**
  - Zip Slip vulnerability in `ZipFile.extractall()` without path canonicalization ([F-002]).
  - HTTP download of external zip archives without SHA-256 hash verification ([F-013]).
