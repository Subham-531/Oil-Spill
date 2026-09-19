# PHASE 0 — RECON & INVENTORY

**Audit Date:** 2026-09-18  
**Repository:** Oil Spill Detection & Vessel Attribution System (Swachh Track)  
**Commit:** `bfe6d63a457901550b291c4292e04b6e3420a380` (2026-09-04 01:55:20 +0530)  
**Branch:** `main`

---

## Stack Map

### Backend (Python)
- **Runtime:** Python 3.11
- **Framework:** FastAPI 0.104+, Uvicorn (ASGI server)
- **ML/Detection:** PyTorch 2.0+, torchvision, OpenCV (headless), scikit-learn, scikit-image
- **Geospatial:** rasterio 1.3+, geopandas 0.14+, shapely 2.0+, pyproj 3.6+
- **Drift Simulation:** OpenDrift 1.11+ (OpenOil module), xarray, netCDF4, scipy
- **Data Access:** copernicusmarine 1.0+, cdsapi 0.6+ (Copernicus services)
- **Attribution:** DuckDB 1.0+ (AIS analytics), pandas, numpy
- **Report Generation:** reportlab 4.0+, jinja2 3.1+
- **API/Web:** fastapi, uvicorn, python-multipart, pydantic 2.5+
- **Live AIS:** websockets, certifi (AISStream.io integration)
- **Utils:** python-dotenv, loguru, geojson, matplotlib, h5py, tqdm

### Frontend (JavaScript)
- **Runtime:** Node.js 20
- **Framework:** React 19.2.8, Vite 8.2.2
- **Map Rendering:** Leaflet 1.9.4, react-leaflet 5.0.0
- **3D Visualization:** Three.js 0.185.1, @react-three/fiber 9.7.0, @react-three/drei 10.7.8
- **Animation:** Framer Motion 13.2.0
- **Charts:** Recharts 3.10.1
- **Geospatial:** d3-geo 3.1.1
- **HTTP Client:** axios 1.20.0
- **Icons:** lucide-react 1.40.0, react-icons 5.7.0
- **Fonts:** @fontsource/barlow-condensed, @fontsource/ibm-plex-sans, @fontsource/ibm-plex-mono
- **Linting:** oxlint 1.79.0
- **Build:** @vitejs/plugin-react 6.1.0

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Web Server:** nginx (alpine) for frontend static serving
- **Database:** SQLite3 (WAL mode) for live AIS buffer, DuckDB for AIS analytics

### External Services / APIs
- **Copernicus Data Space:** Sentinel-1 SAR imagery download
- **CMEMS (Copernicus Marine):** Ocean current data (GLOBAL_ANALYSISFORECAST_PHY_001_024)
- **CDS (Climate Data Store):** ERA5 wind reanalysis data
- **AISStream.io:** Real-time vessel position WebSocket stream (optional)
- **MarineCadastre (NOAA):** 7.28M AIS historical archive (Parquet format)

---

## Entry Points

### Backend
1. **`backend/main.py:109`** — Uvicorn entry point (`if __name__ == "__main__"`)
2. **`backend/detection/router.py:27`** — POST `/api/detect/` (SAR detection endpoint)
3. **`backend/drift/router.py:26`** — POST `/api/drift/` (OpenDrift simulation)
4. **`backend/attribution/router.py:32`** — POST `/api/attribute/` (vessel attribution)
5. **`backend/attribution/router.py:254`** — GET `/api/attribute/live` (real-time AIS stream)
6. **`backend/main.py:66`** — GET `/api/health` (health check)
7. **`backend/main.py:76`** — GET `/api/demo/cached` (pre-cached demo results)

### Frontend
1. **`frontend/src/main.jsx:20`** — React root mount
2. **`frontend/src/App.jsx:17`** — Main application component
3. **`frontend/index.html`** — HTML entry point

### Training & Scripts
1. **`models/train_unet.py:688`** — Model training entry point
2. **`scripts/download_data.py:148`** — Data acquisition script
3. **`scripts/generate_demo_cache.py`** — Demo cache pre-computation
4. **`scripts/test_pipeline_e2e.py`** — End-to-end integration test

### Docker
1. **`docker-compose.yml:10`** — Multi-service orchestration (backend + frontend)
2. **`backend/Dockerfile:23`** — Backend container entry
3. **`frontend/Dockerfile:18`** — Frontend production build + nginx

---

## Complete File Manifest

### Backend Layer (Python) — 10 files, ~2,871 lines

| File | Lines | Description |
|------|-------|-------------|
| `backend/main.py` | 113 | FastAPI app initialization, CORS, routers, health/demo endpoints |
| `backend/detection/detector.py` | 346 | U-Net model, SpillDetector class, tiled inference with TTA |
| `backend/detection/router.py` | 97 | Detection API endpoint, scene upload/selection handling |
| `backend/drift/drifter.py` | 219 | OpenDrift simulation wrapper, kinematic fallback |
| `backend/drift/router.py` | 74 | Drift API endpoint (hindcast + forecast) |
| `backend/attribution/analyzer.py` | 472 | Vessel scoring engine, AIS data fetching (DuckDB/live/synthetic) |
| `backend/attribution/router.py` | 361 | Attribution API, PDF report generation, live AIS endpoints |
| `backend/attribution/live_ais.py` | 453 | WebSocket AIS ingestion, SQLite rolling buffer, live query API |
| `backend/requirements.txt` | 53 | Python dependencies with versions |
| `backend/Dockerfile` | 24 | Backend container definition |
| **4 `__init__.py` files** | 0 | Python package markers |

**Total Backend Source:** ~2,212 lines (excluding requirements/Dockerfile)

### Frontend Layer (React/JSX) — 39 files, ~4,800 lines (estimated)

**Main App:**
- `frontend/src/main.jsx` (25 lines) — React root
- `frontend/src/App.jsx` (427 lines) — Main application logic, state management, API integration
- `frontend/src/App.css` — Main styles

**Console Components (8 files):**
- `frontend/src/components/console/ConsoleTopBar.jsx`
- `frontend/src/components/console/ConsoleMapView.jsx`
- `frontend/src/components/console/ConsoleSidebar.jsx`
- `frontend/src/components/console/ConsoleBottomStrip.jsx`
- `frontend/src/components/console/MapTimelineSlider.jsx`
- `frontend/src/components/console/MapLegend.jsx`
- `frontend/src/components/console/EvidencePdfModal.jsx`

**Landing Components (11 files):**
- `frontend/src/components/landing/LandingPage.jsx`
- `frontend/src/components/landing/HeroSection.jsx`
- `frontend/src/components/landing/GlobeHero3D.jsx`
- `frontend/src/components/landing/StatsBand.jsx`
- `frontend/src/components/landing/FeaturesGrid.jsx`
- `frontend/src/components/landing/PipelineSection.jsx`
- `frontend/src/components/landing/ConsolePreviewSection.jsx`
- `frontend/src/components/landing/UseCasesSection.jsx`
- `frontend/src/components/landing/EvidenceSection.jsx`
- `frontend/src/components/landing/FinalCtaSection.jsx`
- `frontend/src/components/landing/LandingNav.jsx`
- `frontend/src/components/landing/LandingFooter.jsx`

**Primitive Components (9 files):**
- `frontend/src/components/primitives/BezelScreen.jsx`
- `frontend/src/components/primitives/BtnCap.jsx`
- `frontend/src/components/primitives/Dial.jsx`
- `frontend/src/components/primitives/Lamp.jsx`
- `frontend/src/components/primitives/MetalPanel.jsx`
- `frontend/src/components/primitives/PaperTape.jsx`
- `frontend/src/components/primitives/Plaque.jsx`
- `frontend/src/components/primitives/Stamp.jsx`
- `frontend/src/components/primitives/Toggle.jsx`

**React Bits (5 files):**
- `frontend/src/components/reactbits/AnimatedContent.jsx`
- `frontend/src/components/reactbits/CountUp.jsx`
- `frontend/src/components/reactbits/Particles.jsx`
- `frontend/src/components/reactbits/SplitText.jsx`
- `frontend/src/components/reactbits/SpotlightCard.jsx`

**Data & Config:**
- `frontend/src/data/demoData.js` — Demo fallback data
- `frontend/src/design/tokens.css` — Design system tokens
- `frontend/package.json` (37 lines) — Dependencies, scripts
- `frontend/vite.config.js` — Vite build config
- `frontend/index.html` — HTML entry
- `frontend/nginx.conf` — Production nginx config
- `frontend/Dockerfile` (19 lines) — Multi-stage build
- `frontend/.env` — Frontend environment
- `frontend/.oxlintrc.json` — Linter config

### Models Layer — 2 files, ~691 lines

| File | Lines | Description |
|------|-------|-------------|
| `models/train_unet.py` | 691 | Complete U-Net training pipeline, dataset loader, loss functions |
| `notebooks/train_unet.ipynb` | N/A | Jupyter notebook version of training script |
| `models/unet_spill_weights.pt` | N/A | Trained model weights (binary file) |

### Scripts Layer — 13 files, ~1,200 lines (estimated)

**Core Scripts:**
- `scripts/download_data.py` (150 lines) — CMEMS/ERA5/AIS data acquisition
- `scripts/generate_demo_cache.py` — Pre-compute demo results
- `scripts/test_pipeline_e2e.py` — Integration test
- `scripts/test_sample_images.py` — Sample image validation

**Audit Scripts (Phase 1-5):**
- `scripts/audit/check_env.py` — Environment validation
- `scripts/audit/check_keys.py` — API key verification
- `scripts/audit/hunt_bluffs.py` — Code authenticity check
- `scripts/audit/phase1_investigation.py` — Initial audit
- `scripts/audit/phase1_weights_forensics.py` — Model weight forensics
- `scripts/audit/phase2_sar_authenticity.py` — SAR data validation
- `scripts/audit/phase4_data_authenticity.py` — Data authenticity
- `scripts/audit/phase5_api_test.py` — API endpoint testing
- `scripts/audit/run_scene_audit.py` — Scene validation
- `scripts/audit/search_metrics.py` — Metrics extraction
- `scripts/audit/test_live_ais.py` — Live AIS integration test
- `scripts/audit/test_zenodo.py` — Zenodo dataset validation
- `scripts/audit/build_colab_notebook.py` — Colab notebook generator

### Configuration Layer — 5 files

| File | Lines | Description |
|------|-------|-------------|
| `docker-compose.yml` | 55 | Multi-service orchestration |
| `.env.example` | 23 | Environment variable template |
| `.gitignore` | ~50 | Git ignore patterns |
| `frontend/.gitignore` | ~20 | Frontend-specific ignores |
| `README.md` | 85 | Project documentation |

### Documentation Layer — 6 files, ~1,500 lines (estimated)

- `docs/PRD.md` — Product requirements
- `docs/WORKFLOW.md` — Technical workflow
- `docs/BUILD_GUIDE.md` — Phase-by-phase build guide
- `docs/demo_scenario.md` — Demo scenario description
- `docs/demo_script.md` — Demo presentation script
- `docs/AUDIT_MODEL_VERIFICATION.md` — Model verification audit
- `PROJECT_CONTEXT.md` — Project context

### Data Layer (non-source)

**Binary/Generated Files:**
- `data/sar/demo/*.tif` (15 files) — SAR scene imagery
- `data/sar/demo/*.png` (8 files) — Preview images
- `data/sar/demo/scenes_index.json` — Scene metadata
- `data/currents/demo_currents.nc` — Ocean current NetCDF
- `data/wind/demo_wind.nc` — Wind data NetCDF
- `data/natural_earth/*.shp, .dbf, .shx, .prj, .cpg` — Land boundary shapefile
- `data/ais/live_ais_buffer.db` — SQLite rolling AIS buffer
- `data/ais/reference/marinecadastre_sample.csv` — AIS schema reference
- `data/demo_cache/*.json` (3 files) — Cached demo results
- `test_images/*.tif, *.jpg` (10 files) — Test imagery and ground truth

**Total Data Files:** ~50 files (mostly binary)

---

## Explicit Skip List

### Reason: Binary / Generated Assets
- `*.pt` (PyTorch model weights) — 1 file
- `*.tif, *.tiff` (SAR imagery) — 20 files
- `*.png, *.jpg, *.jpeg` (preview images) — 18 files
- `*.nc` (NetCDF ocean/wind data) — 2 files
- `*.db, *.db-wal, *.db-shm` (SQLite databases) — 3 files
- `*.shp, *.shx, *.dbf, *.prj, *.cpg` (shapefiles) — 6 files
- `*.svg` (vector graphics) — 1 file
- `frontend/public/data/ne_50m_land.json` — GeoJSON land boundaries (large)
- `frontend/dist/**/*` — Vite build output

### Reason: Vendored / Dependencies
- `frontend/node_modules/**/*` — ~20,000 npm packages
- `backend/__pycache__/**/*.pyc` — Python bytecode
- `scripts/__pycache__/**/*.pyc` — Python bytecode
- `models/__pycache__/**/*.pyc` — Python bytecode

### Reason: Version Control Metadata
- `.git/**/*` — Git repository metadata

### Reason: IDE / Editor
- `.vscode/` — VS Code settings (if present)
- `.idea/` — JetBrains IDE (if present)

### Reason: Logs (runtime artifacts)
- `backend.log` — Backend runtime log
- `backend_err.log` — Backend error log

### Reason: Already Audited (scripts/audit/)
- `scripts/audit/results/*.json` — Audit result outputs (10 files)
- These are audit artifacts, not source code

---

## Audit Batch Plan

Files are partitioned into batches of ≤10 files or ~1,500 total lines each, grouped by feature/module for contextual review.

### **B01: Core Backend Infrastructure** (DONE in this inventory)
- `backend/main.py` (113 lines)
- `backend/requirements.txt` (53 lines)
- `backend/Dockerfile` (24 lines)
- `docker-compose.yml` (55 lines)
- `.env.example` (23 lines)
- **Total:** 5 files, 268 lines

### **B02: Detection Module (U-Net Inference)**
- `backend/detection/detector.py` (346 lines)
- `backend/detection/router.py` (97 lines)
- **Total:** 2 files, 443 lines

### **B03: Drift Module (OpenDrift)**
- `backend/drift/drifter.py` (219 lines)
- `backend/drift/router.py` (74 lines)
- **Total:** 2 files, 293 lines

### **B04: Attribution Module (Vessel Scoring)**
- `backend/attribution/analyzer.py` (472 lines)
- `backend/attribution/router.py` (361 lines)
- **Total:** 2 files, 833 lines

### **B05: Live AIS Integration**
- `backend/attribution/live_ais.py` (453 lines)
- **Total:** 1 file, 453 lines

### **B06: Model Training Pipeline**
- `models/train_unet.py` (691 lines)
- **Total:** 1 file, 691 lines

### **B07: Data Acquisition Scripts**
- `scripts/download_data.py` (150 lines)
- `scripts/generate_demo_cache.py` (~150 lines est.)
- `scripts/test_pipeline_e2e.py` (~100 lines est.)
- `scripts/test_sample_images.py` (~80 lines est.)
- **Total:** 4 files, ~480 lines

### **B08: Frontend Core & State**
- `frontend/src/main.jsx` (25 lines)
- `frontend/src/App.jsx` (427 lines)
- `frontend/src/data/demoData.js` (~200 lines est.)
- `frontend/vite.config.js` (~20 lines est.)
- **Total:** 4 files, ~672 lines

### **B09: Console UI Components (Part 1)**
- `frontend/src/components/console/ConsoleTopBar.jsx` (~150 lines est.)
- `frontend/src/components/console/ConsoleMapView.jsx` (~300 lines est.)
- `frontend/src/components/console/ConsoleSidebar.jsx` (~250 lines est.)
- **Total:** 3 files, ~700 lines

### **B10: Console UI Components (Part 2)**
- `frontend/src/components/console/ConsoleBottomStrip.jsx` (~80 lines est.)
- `frontend/src/components/console/MapTimelineSlider.jsx` (~120 lines est.)
- `frontend/src/components/console/MapLegend.jsx` (~100 lines est.)
- `frontend/src/components/console/EvidencePdfModal.jsx` (~150 lines est.)
- **Total:** 4 files, ~450 lines

### **B11: Landing Page Components (Part 1)**
- `frontend/src/components/landing/LandingPage.jsx` (~100 lines est.)
- `frontend/src/components/landing/HeroSection.jsx` (~150 lines est.)
- `frontend/src/components/landing/GlobeHero3D.jsx` (~200 lines est.)
- `frontend/src/components/landing/StatsBand.jsx` (~80 lines est.)
- **Total:** 4 files, ~530 lines

### **B12: Landing Page Components (Part 2)**
- `frontend/src/components/landing/FeaturesGrid.jsx` (~150 lines est.)
- `frontend/src/components/landing/PipelineSection.jsx` (~120 lines est.)
- `frontend/src/components/landing/ConsolePreviewSection.jsx` (~100 lines est.)
- `frontend/src/components/landing/UseCasesSection.jsx` (~120 lines est.)
- **Total:** 4 files, ~490 lines

### **B13: Landing Page Components (Part 3)**
- `frontend/src/components/landing/EvidenceSection.jsx` (~100 lines est.)
- `frontend/src/components/landing/FinalCtaSection.jsx` (~80 lines est.)
- `frontend/src/components/landing/LandingNav.jsx` (~120 lines est.)
- `frontend/src/components/landing/LandingFooter.jsx` (~80 lines est.)
- **Total:** 4 files, ~380 lines

### **B14: Primitive UI Components**
- `frontend/src/components/primitives/*.jsx` (9 files, ~100 lines each)
- **Total:** 9 files, ~900 lines est.

### **B15: React Bits & Utilities**
- `frontend/src/components/reactbits/*.jsx` (5 files, ~80 lines each)
- **Total:** 5 files, ~400 lines est.

### **B16: Configuration & Package Manifests**
- `frontend/package.json` (37 lines)
- `frontend/.oxlintrc.json` (~20 lines est.)
- `frontend/nginx.conf` (~30 lines est.)
- `frontend/Dockerfile` (19 lines)
- `frontend/index.html` (~30 lines est.)
- **Total:** 5 files, ~136 lines

### **B17: Documentation**
- `README.md` (85 lines)
- `PROJECT_CONTEXT.md` (~200 lines est.)
- `docs/PRD.md` (~300 lines est.)
- **Total:** 3 files, ~585 lines

### **B18: More Documentation**
- `docs/WORKFLOW.md` (~250 lines est.)
- `docs/BUILD_GUIDE.md` (~300 lines est.)
- `docs/demo_scenario.md` (~150 lines est.)
- **Total:** 3 files, ~700 lines

---

## Summary Statistics

**Total Source Files to Audit:** ~80 files  
**Estimated Total Lines of Code:** ~12,000 lines  
**Total Batches:** 18  
**Binary/Data Files Skipped:** ~50 files  
**Vendored Dependencies Skipped:** ~20,000+ npm packages, Python site-packages

**Languages:**
- Python: ~4,500 lines (backend + scripts + training)
- JavaScript/JSX: ~6,500 lines (frontend)
- Configuration: ~500 lines (Docker, JSON, YAML, env)
- Documentation: ~500 lines (Markdown)

**Architecture Layers:**
- Backend API: 3 modules (detection, drift, attribution) + live AIS
- Frontend: React SPA with 3D visualization, 32+ components
- ML: U-Net semantic segmentation
- Infrastructure: Docker Compose, nginx
- External: 4 Copernicus APIs, AISStream WebSocket

**Test Coverage:** No automated test suite detected (manual E2E script only)
