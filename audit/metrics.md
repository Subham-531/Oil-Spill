# CODEBASE METRICS & COMPLEXITY HOTSPOTS

## 1. Lines of Code by Layer

| Layer | Language | Files | Lines of Code (approx) |
|-------|----------|-------|------------------------|
| Backend API | Python | 10 | ~2,212 |
| ML / Models | Python | 2 | ~691 |
| Scripts & Tools | Python | 13 | ~1,200 |
| Frontend | JSX / JS / CSS | 39 | ~4,800 |
| Configuration / Infra | Docker / YAML / Env | 5 | ~200 |
| Documentation | Markdown | 6 | ~1,500 |
| **Total** | | **75+** | **~10,600** |

---

## 2. Top Complexity Hotspots (Functions / Modules)

| Rank | Module / Function | Lines | Cyclomatic Complexity / Risk Factor |
|------|-------------------|-------|-------------------------------------|
| 1 | `models/train_unet.py:Sentinel1SARDataset` | ~180 | High (Data decoding, synthetic physics generator, augmentations) |
| 2 | `backend/attribution/analyzer.py:fetch_real_ais_vessels` | ~135 | High (DuckDB SQL, synthetic corridor generator, hash kinematics) |
| 3 | `backend/detection/detector.py:SpillDetector.tiled_predict` | ~60 | High (Sliding window, Gaussian blending, TTA 4-way ensemble) |
| 4 | `backend/attribution/live_ais.py:LiveAISManager._listen_websocket` | ~90 | High (Async WebSocket loop, JSON decoding, SQLite batching) |
| 5 | `backend/detection/detector.py:SpillDetector.detect_spill` | ~140 | Medium-High (Polygon vectorization, Geod area, Bonn agreement) |
| 6 | `backend/drift/drifter.py:DriftSimulator.run_simulation` | ~115 | Medium (OpenDrift seeding, netCDF readers, convex hull GeoJSON) |
| 7 | `backend/attribution/router.py:get_report` | ~160 | Medium (ReportLab PDF doc template, tables, styling) |
| 8 | `frontend/src/App.jsx:handleRunAnalysis` | ~135 | Medium (3-step async pipeline execution with fallbacks) |

---

## 3. Duplication Clusters

1. **Synthetic Fairway Corridor Traffic Generator:**
   - Location 1: `backend/attribution/analyzer.py:110-199`
   - Location 2: `scripts/generate_demo_cache.py:136-180`
   - Description: Both functions contain duplicated vessel lists ("MT SWAN HIGHWAY", "MV PACIFIC VOYAGER", "SAGAR JYOTI", "ARABIAN EXPRESS") and kinematics calculations.

2. **Kinematic Drift Fallback Calculation:**
   - Location 1: `backend/drift/drifter.py:46-90`
   - Location 2: `scripts/generate_demo_cache.py:56-102`
   - Description: Duplicated advection drift displacement vector loop (`-0.0035 * h` dx, `0.0042 * h` dy) and diffusion ellipse construction.

---

## 4. Dependencies & Security Audit Summary

| Ecosystem | Manifest | Total Deps | Vulnerabilities / Risks |
|-----------|----------|------------|------------------------|
| Python | `backend/requirements.txt` | 20+ | Unpinned `>=` constraints; `opendrift` commented out |
| Node.js | `frontend/package.json` | 21 | Unpinned `^` constraints |
