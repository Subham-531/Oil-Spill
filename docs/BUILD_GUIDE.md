# Build Guide — Step by Step
### SIH PS #26143: Oil Spill Detection & Vessel Attribution System

This guide is written to be handed to an AI coding agent (e.g., in Antigravity) phase by phase. Give it one phase at a time along with `PRD.md` and `WORKFLOW.md` for context.

---

## Phase 0 — Project Setup

**Goal:** Working repo skeleton, environment, and a chosen demo scene.

1. Create repo structure:
   ```
   /data                # raw + processed datasets
   /models               # trained model weights
   /backend              # FastAPI app
     /detection
     /drift
     /attribution
   /frontend             # React + map dashboard
   /notebooks             # exploration/training notebooks
   /docs                  # PRD.md, WORKFLOW.md live here
   docker-compose.yml
   ```
2. Set up Python environment (conda or venv): `python 3.10+`, install `torch`, `rasterio`, `gdal`, `opencv-python`, `geopandas`, `shapely`, `opendrift`, `fastapi`, `uvicorn`.
3. Set up frontend: `React` + `react-leaflet` (or `mapbox-gl`) + a charting lib for the evidence panel.
4. **Pick one demo scenario up front:** a specific Sentinel-1 scene + time window + coastal region. Download and cache everything for it now (imagery, currents, wind, AIS) so the demo never depends on live network calls.

---

## Phase 1 — Data Acquisition

### 1a. SAR Training Data
- Download the **Zenodo Sentinel-1 SAR Oil Spill Dataset** (linked in your PS) — this gives labeled spill/non-spill patches for training the segmentation model.
- Also useful: the **Deep-SAR Oil Spill (SOS) dataset** and Copernicus's own sample scenes if you need more variety — search Zenodo/Kaggle for "Sentinel-1 oil spill segmentation dataset" if you want to augment.

### 1b. Live/Archival SAR Scenes
- Register at **Copernicus Data Space Ecosystem** (dataspace.copernicus.eu) — free account.
- Use their API (STAC or OData) to search/download a Sentinel-1 GRD scene over a real historical oil spill event (many are publicly documented — search for a known spill incident to get a scene with a "ground truth" story for your demo narrative).

### 1c. Environmental Data
- **Ocean currents:** Copernicus Marine Service (marine.copernicus.eu) — register, use their `copernicusmarine` Python toolbox to download current (u/v) NetCDF data for your scene's bounding box and time range.
- **Wind:** Copernicus Climate Data Store (ERA5 reanalysis) via the `cdsapi` Python package, or NOAA GFS if you want forecast-style data instead of reanalysis.

### 1d. AIS Data
- Download a sample from **marinecadastre.gov/accessais** to understand the real AIS schema (MMSI, timestamp, lat/lon, SOG, COG, heading, vessel type, status).
- Since that dataset only covers US waters, **write a synthetic AIS generator** for your chosen Indian-coast demo region:
  - Generate 15-30 vessels with realistic tracks along real shipping lanes near your demo coordinates.
  - Make most vessels "innocent" (clean, continuous tracks, far from the origin window).
  - Make **one vessel the "planted culprit"**: track passes through the estimated origin point/time, has a brief AIS gap right before/after, and a speed drop consistent with slowing down.
  - Keep the schema identical to real AIS so the pipeline code doesn't care whether the source is real or synthetic — this makes swapping in real regional AIS trivial later.
  - (Optional, not required for MVP) If you want a "live data" flavor for the demo, `AISstream.io` offers a free-tier WebSocket AIS feed — useful as a bonus "real-time mode" toggle, but don't depend on it for the core demo.

---

## Phase 2 — Detection Model

1. In a notebook: load the Zenodo dataset, inspect class balance (spill / lookalike / sea / ship).
2. Preprocessing: normalize backscatter values, tile large scenes into fixed-size patches (e.g., 256x256) for training.
3. Train a segmentation model — **U-Net** is a strong, fast-to-train baseline for this; **DeepLabV3+** if you have time/compute for better boundary accuracy.
4. Include the **lookalike class explicitly** (biogenic slicks, low-wind zones, rain cells) — this is what separates a real solution from a toy one, since raw dark-patch detection alone produces tons of false positives.
5. Evaluate with IoU/Dice score; inspect failure cases visually.
6. Wrap inference in a function: `detect_spill(sar_scene_path) -> GeoJSON polygon + properties`.
7. Add polygon extraction (`rasterio.features.shapes` or OpenCV contours) and geometry computation (`shapely`, `geopandas`).

---

## Phase 3 — Drift Module (OpenDrift)

1. Install `opendrift` (`pip install opendrift`).
2. Load your cached current (CMEMS) and wind (ERA5) NetCDF files as OpenDrift "readers".
3. Use the `OpenOil` model — seed particles across your detected spill polygon.
4. **Backward run:** set a negative time step, run for e.g. 48-72 hours back from detection time. Cluster final particle positions (e.g., convex hull or density heatmap) → this is your origin-window estimate.
5. **Forward run:** normal time step, run 24-72h forward from detection time → forecast polygons at each time step.
6. Export both as time-stamped GeoJSON for the frontend to animate.
7. Sanity-check against a real historical spill if you picked one — does the backward-estimated origin roughly match the known real source? This is a great demo talking point.

---

## Phase 4 — AIS Attribution Module

1. Load AIS data (real-schema, synthetic or real) into a GeoDataFrame; reconstruct per-MMSI tracks sorted by time.
2. Build the spatio-temporal filter: keep tracks intersecting the origin-window polygon within the time-window ± buffer.
3. Implement scoring functions:
   - `proximity_score(track, origin_point)`
   - `temporal_score(track, origin_time)`
   - `trajectory_alignment_score(track, current_wind_vector)`
   - `anomaly_score(track)` — detect AIS gaps (missing pings > N minutes), sudden speed drops
4. Combine into a weighted composite (start with equal weights, tune based on your synthetic "planted culprit" — it should rank #1).
5. Output ranked list with sub-scores attached (for the explainability panel).

---

## Phase 5 — Dashboard

1. Build the map view: base tiles + SAR overlay + spill polygon + drift paths + AIS tracks (`react-leaflet` layers, or Mapbox GL layers).
2. Add a timeline slider component driving which time-step of the drift/AIS layers is shown.
3. Build the evidence side-panel: spill properties card + ranked suspect table (expandable rows showing sub-scores).
4. Wire the frontend to FastAPI endpoints:
   - `POST /detect` → spill polygon + properties
   - `POST /drift` → hindcast + forecast tracks
   - `POST /attribute` → ranked suspects
   - `GET /report/{incident_id}` → exportable summary
5. Add a "Export Evidence Report" button (simple PDF/HTML generation is enough for MVP).

---

## Phase 6 — Integration, Polish & Demo Script

1. Wire all modules end-to-end behind a single "Run Analysis" action.
2. Pre-run and cache the full pipeline for your chosen demo scene so the live demo is instant (don't run model inference live on stage unless it's genuinely fast).
3. Prepare a 3-part demo narrative matching the PS's own structure:
   - "Here's the detected spill and its properties."
   - "Here's where and when it likely originated, and where it's heading."
   - "Here's the ranked list of vessels, and here's *why* each one is or isn't a suspect."
4. Have a backup: screenshots/recorded video of the working pipeline in case of live-demo network issues.
5. Prepare answers for likely judge questions: "How do you handle false positives from lookalikes?", "What's your uncertainty on the origin estimate?", "How would this integrate with real Coast Guard AIS feeds?", "What happens with multiple simultaneous spills?"

---

## Quick Reference — Everything in One Table

| Category | Tool/Source | Purpose |
|---|---|---|
| SAR training data | Zenodo Sentinel-1 SAR Oil Spill Dataset | Train segmentation model |
| SAR scenes | Copernicus Data Space Ecosystem | Real imagery for demo scene |
| Ocean currents | Copernicus Marine Service (CMEMS) | Drift simulation input |
| Wind data | Copernicus CDS (ERA5) or NOAA GFS | Drift simulation input |
| Drift engine | OpenDrift (`OpenOil` module) | Backward/forward trajectory simulation |
| AIS schema reference | marinecadastre.gov/accessais | Realistic AIS format |
| AIS demo data | Custom synthetic generator | Region-specific attribution demo |
| AIS live (optional) | AISstream.io | Bonus real-time mode |
| Segmentation model | U-Net / DeepLabV3+ (PyTorch) | Spill detection |
| Geospatial libs | GDAL, Rasterio, Shapely, GeoPandas | Raster/vector processing |
| Backend | FastAPI | Serve all module endpoints |
| Frontend | React + Leaflet/Mapbox GL | Dashboard & map visualization |
| DB (optional) | PostgreSQL + PostGIS | Persist incidents/tracks at scale |

---

## Notes for Using This With Antigravity / an AI Coding Agent

- Feed `PRD.md` and `WORKFLOW.md` as context first, then hand over **one phase at a time** from this guide — don't ask it to build everything in one shot.
- After each phase, ask it to write a short test/sanity-check script before moving to the next phase (e.g., "load one AIS synthetic track and print the computed proximity score" before wiring up the full scorer).
- Keep the synthetic "planted culprit" vessel fixed throughout development — it's your ground truth for verifying the attribution module actually works before you trust it on real data.
