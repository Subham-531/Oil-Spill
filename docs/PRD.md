# Product Requirements Document (PRD)
## SIH Problem Statement #26143 — Oil Spill Detection & Vessel Attribution System

**Organization:** National Technical Research Organisation (NTRO)
**Category:** Software | **Theme:** Disaster Management

---

## 1. Problem Summary

Marine oil spills are frequently detected but rarely attributed to the responsible vessel. The system must do three things in sequence:

1. **Detect** oil spills from satellite radar/optical imagery and describe their shape, size, and approximate age.
2. **Hindcast/Forecast** the slick's drift — trace it *backward* to find where and when it likely originated, and *forward* to predict where it will spread.
3. **Attribute** the spill to a vessel by cross-referencing the estimated origin window (space + time) against AIS ship-traffic data, filtering out irrelevant traffic, and ranking suspect vessels by a composite suspicion score.

All of this needs a visual interface so a human analyst can review evidence and confirm/reject the system's conclusion (this is decision-support, not full automation — legal/enforcement action requires human sign-off).

---

## 2. Goals & Success Criteria

| Goal | Success Metric |
|---|---|
| Detect oil slicks in SAR imagery | IoU/Dice score ≥ 0.7 on held-out Sentinel-1 test set; false positive rate on lookalikes (algae, low-wind zones, biogenic film) minimized |
| Characterize spill geometry | Area, perimeter, length/width, centroid, orientation auto-computed and displayed |
| Estimate spill age (stretch goal) | Qualitative bucket (fresh / 6-24h / >24h) based on elongation & fragmentation, not exact hours |
| Backward drift / origin estimation | Origin point estimated within a plausible search radius (e.g., <10 km) and time window (e.g., ±3-6h) given current/wind uncertainty |
| Forward drift prediction | 24-72h forecast trajectory rendered on map |
| Vessel attribution | Ranked list of top-N suspect vessels with explainable scoring (proximity, heading alignment, AIS gaps, speed anomalies) |
| Usability | A non-technical analyst can go from "upload/select a SAR scene" to "see ranked suspects on a map" in under 2 minutes for a demo scene |
| Demo readiness (hackathon-specific) | Works fully offline/pre-cached for judging — no dependency on live API uptime during demo |

---

## 3. Users & Stakeholders

- **Primary user:** Maritime surveillance / pollution-control analyst (e.g., Indian Coast Guard, Ministry of Environment, NTRO analyst).
- **Secondary user:** Judges/evaluators at SIH — need to see the pipeline explainably, not just a final answer.
- **Downstream consumer:** Enforcement/legal team who would need an evidence trail (this shapes the UI: show *why* a vessel was flagged, not just a name).

---

## 4. Functional Requirements

### Module A — Oil Spill Detection & Characterization
- FR-A1: Ingest a Sentinel-1 SAR GRD scene (or pre-processed patch) covering a maritime area.
- FR-A2: Preprocess: calibration, speckle filtering, land masking, geocoding.
- FR-A3: Run a semantic segmentation model to classify each pixel as: sea / oil spill / lookalike (biogenic slick, low-wind area, rain cells) / ship.
- FR-A4: Convert the spill mask into a georeferenced polygon.
- FR-A5: Compute geometric properties: area (km²), perimeter, major/minor axis length, centroid (lat/lon), orientation angle.
- FR-A6: (Stretch) Estimate a relative age bucket from shape features (fresh spills are more compact/circular; older spills are elongated/fragmented due to weathering and spreading).

### Module B — Drift Hindcasting & Forecasting
- FR-B1: Ingest ocean surface current data and wind data for the scene's time and location.
- FR-B2: Run a backward Lagrangian particle-drift simulation seeded at the spill polygon, stepping backward in time to estimate a probable **origin point and time window**.
- FR-B3: Run a forward simulation from the detected spill to predict drift over the next 24-72 hours.
- FR-B4: Visualize both trajectories as animated/timestamped paths on a map, with uncertainty shown as a spreading cone/ellipse (since backward drift is inherently uncertain).

### Module C — AIS-Based Vessel Attribution
- FR-C1: Ingest historical AIS data (real or synthetic) for the region.
- FR-C2: Define a spatio-temporal "suspect window" = origin point/time from Module B, expanded by an uncertainty buffer.
- FR-C3: Filter AIS tracks to only vessels present inside that window (discard irrelevant global traffic).
- FR-C4: For each candidate vessel, compute a **suspicion score** from weighted sub-scores:
  - Proximity score (distance from vessel track to estimated origin point)
  - Temporal alignment score (how close vessel's presence is to estimated origin time)
  - Trajectory/heading consistency (does the vessel's course align with where a spill would trail behind it?)
  - Behavioral anomaly score (AIS gaps/"dark periods", sudden speed drops, deviation from normal shipping lanes — classic tanker-flushing/illegal-discharge indicators)
  - Vessel type prior (tankers/cargo ships weighted higher than e.g. passenger vessels, if type data available)
- FR-C5: Rank and output a Top-N suspect list with the contributing sub-scores shown (explainability).

### Module D — Visualization / Dashboard
- FR-D1: Interactive map (base layer + SAR overlay + spill polygon + drift paths + AIS tracks).
- FR-D2: Timeline scrubber to move through backward/forward drift animation.
- FR-D3: Side panel: spill properties, ranked suspect vessels with scores and evidence breakdown.
- FR-D4: Export/report generation (PDF/JSON) summarizing evidence for a given incident — important for the "attribution" use case to feel credible.

---

## 5. Non-Functional Requirements

- **Explainability:** Every attribution score must be traceable to its components — this is for evidentiary use, black-box scoring is unacceptable.
- **Offline-first for demo:** Pre-cache/download all imagery, environmental, and AIS data used in the demo; do not depend on live external API latency/uptime during judging.
- **Modularity:** Detection, drift, and attribution modules should be independently swappable/testable (useful for iterating under hackathon time pressure).
- **Reasonable performance:** End-to-end pipeline (given a pre-selected SAR scene) should complete in well under a minute for demo purposes (excluding model training).
- **Geospatial correctness:** All layers must be correctly georeferenced (same CRS) so overlays align on the map.

---

## 6. Data Sources

| Data | Source | Notes |
|---|---|---|
| SAR oil spill imagery (training) | Zenodo — Sentinel-1 SAR Oil Spill Dataset | Labeled dataset for segmentation training |
| Live/archival SAR scenes | Copernicus Data Space Ecosystem (Sentinel-1 GRD) | Free, register for API access |
| Ocean currents | Copernicus Marine Service (CMEMS) | Needed for drift simulation |
| Wind data | ECMWF ERA5 (reanalysis) or NOAA GFS (forecast) | Needed for drift simulation (wind drift factor ~3% of wind speed) |
| AIS data (real) | MarineCadastre.gov AIS dataset (US waters, historical, bulk CSV) | Good for format reference / prototype since it's structurally realistic |
| AIS data (India-region demo) | Likely need **synthetic AIS** since MarineCadastre only covers US waters | Generate synthetic tracks consistent with real AIS schema for an Indian-coast demo scenario |
| AIS data (real-time, optional) | AISstream.io (free-tier WebSocket API) | Optional, only if you want a "live" flavor for the demo |

---

## 7. External APIs / Libraries Required

| Need | Tool/API |
|---|---|
| SAR imagery access | Copernicus Data Space Ecosystem API (OData/openEO/STAC) |
| Ocean current/wave data | Copernicus Marine Service (CMEMS) API |
| Wind data | Copernicus Climate Data Store (ERA5) API, or NOAA GFS |
| Drift simulation engine | **OpenDrift** (open-source Python Lagrangian trajectory model — this is the core scientific engine for both hindcast & forecast) |
| Geospatial processing | GDAL, Rasterio, Shapely, GeoPandas |
| ML/segmentation | PyTorch or TensorFlow (U-Net / DeepLabV3+ backbone) |
| Web mapping | Leaflet.js or Mapbox GL JS |
| Backend API | FastAPI (Python) |
| Spatial database (optional) | PostgreSQL + PostGIS |

---

## 8. Suggested Tech Stack

- **ML/Detection:** Python, PyTorch, U-Net/DeepLabV3+, rasterio/GDAL
- **Drift modeling:** OpenDrift (Python)
- **Backend:** FastAPI (Python), serving REST endpoints for each module
- **Frontend:** React + Leaflet/Mapbox GL for the interactive map dashboard
- **Data storage:** PostgreSQL/PostGIS (or simple file-based GeoJSON store for hackathon scope)
- **Deployment:** Docker Compose (backend + frontend + DB) for reproducible demo

---

## 9. Milestones (Hackathon-Scoped Timeline)

| Phase | Deliverable |
|---|---|
| 1. Setup & data | Datasets downloaded, environment ready, sample scene chosen |
| 2. Detection model | Segmentation model trained/fine-tuned, spill polygon extraction working |
| 3. Drift module | OpenDrift backward + forward simulation working with real environmental data |
| 4. AIS attribution | Synthetic AIS generator + filtering + scoring logic working |
| 5. Dashboard | Map UI showing all layers + ranked suspects |
| 6. Integration & polish | End-to-end pipeline wired together, demo script, report export |

(See `BUILD_GUIDE.md` for the detailed day-by-day breakdown.)

---

## 10. Risks & Assumptions

- **Risk:** Real AIS data for Indian waters may not be freely available → **Mitigation:** use MarineCadastre for format/schema reference, generate a synthetic but realistic AIS dataset for the demo region, and clearly label it as such.
- **Risk:** Drift simulation accuracy depends heavily on environmental data resolution → **Mitigation:** state uncertainty explicitly in the UI (search radius/cone) rather than a false-precision single point.
- **Risk:** Segmentation model false positives from lookalikes (low wind, algae) → **Mitigation:** include lookalike class in training, don't just do binary spill/no-spill classification.
- **Assumption:** Full legal-grade attribution is out of scope; the system produces investigative leads for human review, not final verdicts.

## 11. Out of Scope (for hackathon MVP)
- Real-time global AIS ingestion at scale.
- Legal/court-admissible evidence chain-of-custody tooling.
- Multi-satellite sensor fusion beyond Sentinel-1 (optical/EO can be a stated future extension).
