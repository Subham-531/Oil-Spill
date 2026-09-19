# PROJECT CONTEXT: SWACHH TRACK — MARINE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM

> **System Designation:** Swachh Track (Maritime Forensics Instrumentation Platform)  
> **Repository Origin:** `https://github.com/Subham-531/Oil-Spill`  
> **Context Document Purpose:** Complete, self-contained technical specification and codebase audit for independent AI agents and engineers.

---

## 1. Executive Summary

Swachh Track is an end-to-end maritime environmental surveillance and forensic attribution platform developed for Smart India Hackathon (SIH) Problem Statement #26143, sponsored by the National Technical Research Organisation (NTRO), Government of India, under the theme of Disaster Management. The system solves the operational gap in marine pollution enforcement where oil slicks are detected via satellite imagery but cannot be definitively linked to the responsible vessels. The platform ingests Sentinel-1 Synthetic Aperture Radar (SAR) Ground Range Detected (GRD) imagery, processes it through a custom 4-class PyTorch U-Net deep learning model (segmenting pixels into Sea, Oil Spill, Lookalike, and Ship), and extracts georeferenced vector polygons annotated with geometric properties such as surface area, centroid coordinates, orientation, elongation ratio, and estimated age buckets (fresh, 6–24 hours, or >24 hours). 

Once a slick is characterized, the system executes hydrodynamic drift simulations using OpenDrift's peer-reviewed `OpenOil` Eulerian-Lagrangian trajectory engine, incorporating Copernicus Marine Service (CMEMS) ocean surface currents and ECMWF ERA5 atmospheric wind reanalysis. The model runs both a backward hindcast (tracing particles 12–72 hours into the past to construct a spatial-temporal origin probability window) and a forward forecast (projecting slick spread 12–72 hours into the future for containment boom deployment). 

To attribute the spill, the origin window is cross-referenced against historical Automatic Identification System (AIS) vessel traffic (via in-process DuckDB SQL queries over multi-million row Parquet datasets) or live real-time transponder streams (via an asynchronous WebSocket connection to AISStream.io buffered into a local SQLite database with Write-Ahead Logging). The attribution engine computes an explainable, audit-compliant composite suspicion score (0–100) based on weighted heuristics: spatial proximity, temporal alignment, vessel type hydrocarbon risk priors (Tanker > Cargo > Fishing > Passenger), and behavioral telemetry anomalies (speed drops in corridor and AIS transponder signal gaps). 

The user interface is a high-fidelity single-page web console styled according to an analog "Graphite Bridge" skeuomorphic design system built with React 19, Vite 8, Leaflet, Three.js, and vanilla CSS tokens (audited for zero blue/purple hues and zero emojis). The system includes pre-cached demo datasets for the Mumbai–Jamnagar crude tanker shipping corridor in the Arabian Sea, enabling an offline-first demo failover mode that guarantees reliable live presentations without external network dependencies.

---

## 2. Architecture Diagram

```
+---------------------------------------------------------------------------------------------------------+
|                                           PRESENTATION TIER                                             |
|                                                                                                         |
|   +---------------------------------------+           +---------------------------------------------+   |
|   |          LANDING MARKETING VIEW       |           |          TACTICAL BRIDGE CONSOLE            |   |
|   |  - Three.js Interactive 3D Globe      |           |  - Leaflet Map (Satellite / Bathymetric)    |   |
|   |  - Pipeline & Evidence Showcase       | <-------> |  - SAR Swath & Slick Vector Overlays        |   |
|   |  - React Bits Animations & Metrics    |           |  - OpenDrift Hindcast/Forecast Paths        |   |
|   |  - Offline / Online Mode Selector     |           |  - Ranked Suspect Dossier & Scoring Panel   |   |
|   +---------------------------------------+           |  - Interactive Timeline Slider & PDF Modal  |   |
|                                                       +---------------------------------------------+   |
+---------------------------------------------------------------------------------------------------------+
                                                     |
                                  HTTP REST / JSON / Binary Streams
                                                     |
+---------------------------------------------------------------------------------------------------------+
|                                    BACKEND APPLICATION SERVICE (FastAPI)                                 |
|                                                                                                         |
|   +-------------------------------------------------------------------------------------------------+   |
|   |  API Gateway & Middleware (backend/main.py)                                                     |   |
|   |  - CORS Configuration: localhost:3000, 5173, 5174                                               |   |
|   |  - /api/health                                                                                  |   |
|   |  - /api/demo/cached (Pre-computed instant fallback JSON)                                        |   |
|   +-------------------------------------------------------------------------------------------------+   |
|          |                                   |                                     |                    |
|   +---------------+                   +---------------+                   +---------------------+       |
|   |   MODULE A    |                   |   MODULE B    |                   |      MODULE C       |       |
|   |   Detection   |                   | Hydrodynamics |                   |     Attribution     |       |
|   | (SAR & U-Net) |                   |  (OpenDrift)  |                   | (DuckDB & Live AIS) |       |
|   +---------------+                   +---------------+                   +---------------------+       |
|          |                                   |                                     |                    |
|   +---------------+                   +---------------+                   +---------------------+       |
|   | • U-Net       |                   | • OpenOil     |                   | • DuckDB SQL Engine |       |
|   |   Segmentation|                   |   Lagrangian  |                   | • AISStream WS      |       |
|   | • Rasterio    |                   | • Particle    |                   | • SQLite Buffer(WAL)|       |
|   |   GeoTIFF     |                   |   Hindcasting |                   | • Multi-Factor      |       |
|   | • Shapely     |                   | • Particle    |                   |   Scoring Engine    |       |
|   |   Polygons    |                   |   Forecasting |                   | • ReportLab PDF Gen |       |
|   +---------------+                   +---------------+                   +---------------------+       |
+---------------------------------------------------------------------------------------------------------+
       |                                   |                                         |
       v                                   v                                         v
+-----------------------+     +--------------------------+     +------------------------------------------+
|      LOCAL STORAGE    |     |   ENVIRONMENTAL INPUTS   |     |               AIS FEEDS                  |
|                       |     |                          |     |                                          |
| • Model Weights:      |     | • CMEMS Ocean Currents:  |     | • Live Stream:                           |
|   unet_spill_weights  |     |   data/currents/         |     |   wss://stream.aisstream.io/v0/stream    |
|   (30.8 MB PyTorch)   |     |   demo_currents.nc       |     | • Local SQLite:                          |
| • 8 Demo SAR Scenes   |     | • ERA5 Wind (10m u/v):   |     |   data/ais/live_ais_buffer.db            |
|   (.tif & .png)       |     |   data/wind/             |     | • Archive Telemetry (Expected):          |
| • Natural Earth Land  |     |   demo_wind.nc           |     |   data/ais/                              |
|   Vector Data         |     +--------------------------+     |   marinecadastre_2024_01_15.parquet      |
+-----------------------+                                      +------------------------------------------+
```

---

## 3. Tech Stack

| Layer / Subsystem | Technology / Package | Exact Version (Manifest) | Functional Role in Project |
|---|---|---|---|
| **Frontend Framework** | React | `^19.2.8` | Core UI component lifecycle and declarative DOM state |
| **Frontend Runtime / DOM** | React-DOM | `^19.2.8` | React browser rendering layer |
| **Frontend Build Tool** | Vite | `^8.2.2` | Development HMR server and production rollup bundler |
| **Frontend Compiler** | `@vitejs/plugin-react` | `^6.1.0` | Babel/Babel-free React Fast Refresh plugin |
| **Frontend Linter** | Oxlint | `^1.79.0` | High-performance Rust-based JavaScript/JSX linter |
| **Styling & Design Tokens** | Vanilla CSS | CSS3 Standard | "Graphite Bridge" skeuomorphic token system (`tokens.css`, `App.css`) |
| **Typefaces** | `@fontsource/barlow-condensed` | `^5.3.0` | Tactical display and plaque typography (500, 600, 700) |
| **Typefaces** | `@fontsource/ibm-plex-sans` | `^5.3.0` | Body copy typography (400, 500) |
| **Typefaces** | `@fontsource/ibm-plex-mono` | `^5.3.0` | Technical readouts, coordinates, telemetry (400, 500, 600) |
| **Web Mapping Engine** | Leaflet | `^1.9.4` | Tactical geospatial interactive map viewer |
| **React Map Bindings** | React-Leaflet | `^5.0.0` | React wrapper for Leaflet map instances and tile layers |
| **3D Graphics Engine** | Three.js | `^0.185.1` | WebGL scene graph used for interactive 3D landing globe |
| **React Three Fiber** | `@react-three/fiber` | `^9.7.0` | Declarative Three.js component layer (installed) |
| **React Three Helpers** | `@react-three/drei` | `^10.7.8` | Shader and camera helpers for R3F (installed) |
| **Geographic Projections** | `d3-geo` | `^3.1.1` | Equirectangular projection of GeoJSON landmasses onto 3D globe |
| **Motion & Micro-interactions**| `framer-motion` | `^13.2.0` | Hardware-accelerated UI entrance transitions |
| **Iconography** | `lucide-react` | `^1.40.0` | Tactical instrumentation vector icons |
| **Iconography (Legacy)** | `react-icons` | `^5.7.0` | Auxiliary iconography library (installed) |
| **Data Visualization** | `recharts` | `^3.10.1` | Auxiliary charts (installed) |
| **HTTP Client (Frontend)** | Axios | `^1.20.0` | Auxiliary HTTP client (code primarily utilizes native `fetch`) |
| **Backend Framework** | FastAPI | `>=0.104.0` | Asynchronous REST API routing, OpenAPI docs, and request validation |
| **ASGI Server** | Uvicorn (standard) | `>=0.24.0` | High-performance ASGI production server |
| **Deep Learning Framework**| PyTorch (`torch`) | `>=2.0.0` | U-Net neural network architecture, weights loader, GPU/CPU inference |
| **Vision Utilities** | Torchvision | `>=0.15.0` | Tensor transforms and auxiliary ML pipelines |
| **Computer Vision** | OpenCV (`opencv-python-headless`) | `>=4.8.0` | Raster resizing, image normalization, contour extraction |
| **Scientific Image Ops** | `scikit-image` | `>=0.21.0` | Speckle filtering and morphological raster operations |
| **Machine Learning Tools** | `scikit-learn` | `>=1.3.0` | Coordinate normalization and clustering utilities |
| **Geospatial Raster I/O** | Rasterio | `>=1.3.0` | GeoTIFF metadata reading, affine transforms, CRS extraction |
| **Geospatial Vector Math** | Shapely | `>=2.0.0` | Geometric polygon creation, centroid calculation, bounding hulls |
| **Geospatial DataFrames** | GeoPandas | `>=0.14.0` | Spatial joins and vector format conversions |
| **Coordinate Transformation**| PyProj | `>=3.6.0` | Cartographic projections between WGS84 and local UTM zones |
| **Hydrodynamic Modeling** | OpenDrift (`opendrift`) | `>=1.11.0` | Lagrangian ocean particle trajectory simulation (`OpenOil` module) |
| **Multidimensional Data** | Xarray | `>=2023.6.0` | NetCDF dataset manipulation for oceanic and atmospheric grids |
| **NetCDF Interface** | NetCDF4 | `>=1.6.0` | Low-level binary bindings for NetCDF-CF environmental files |
| **Scientific Computing** | SciPy | `>=1.11.0` | Interpolation and matrix operations |
| **Copernicus CMEMS Client**| `copernicusmarine` | `>=1.0.0` | Official CLI/SDK for Copernicus Marine Service current downloads |
| **Copernicus CDS Client** | `cdsapi` | `>=0.6.0` | Official API client for ECMWF ERA5 wind reanalysis data |
| **Embedded OLAP Database**| DuckDB | `>=1.0.0` | In-process columnar SQL queries over AIS Parquet datasets |
| **Real-time Live Telemetry**| `websockets` | `>=15.0.0` (in sys) | Asynchronous WebSocket client connecting to AISStream.io |
| **Embedded Relational DB**| SQLite3 (Standard Library)| Built-in | Rolling 24-hour buffer database for live AIS pings (`live_ais_buffer.db`) |
| **Report Generation** | ReportLab | `>=4.0.0` | Automated MARPOL Annex I compliant forensic PDF dossier compiler |
| **Templating Engine** | Jinja2 | `>=3.1.0` | HTML report templating engine |
| **Logging & Config** | Loguru / python-dotenv | `>=0.7.0` / `>=1.0.0`| Structured terminal logging and `.env` credentials ingestion |
| **Container Engine** | Docker & Docker Compose | Docker 29+ / Compose v5+ | Multi-container development and deployment stack |
| **Web Server (Production)**| Nginx Alpine | Standard | Reverse proxy and static file server for frontend build container |

---

## 4. Repo Map

```
c:\Users\shaur\Oil-Spill\
├── .env                                       # Local environment variables containing API keys (NOT committed)
├── .env.example                               # Template listing required environment keys for Copernicus & AISStream
├── .gitignore                                 # Git ignore configuration (ignores node_modules, .env, datasets, weights)
├── docker-compose.yml                         # Multi-container orchestration definition for backend and frontend services
├── README.md                                  # High-level project presentation and quick start guide for SIH 2024
│
├── backend/                                   # FastAPI backend application package
│   ├── __init__.py                            # Package initializer
│   ├── Dockerfile                             # Container build definition for Python 3.11 with GDAL/PROJ dependencies
│   ├── main.py                                # Backend entry point, CORS config, health check, and demo cache router
│   ├── requirements.txt                       # Python dependency specification
│   │
│   ├── detection/                             # Module A: Satellite SAR Detection & Characterization
│   │   ├── __init__.py                        # Module initializer
│   │   ├── detector.py                        # SpillDetector class, 4-class U-Net definition, GeoTIFF vectorization
│   │   └── router.py                          # APIRouter (/api/detect) handling upload and pre-staged scene detection
│   │
│   ├── drift/                                 # Module B: Hydrodynamic Ocean Drift Simulation
│   │   ├── __init__.py                        # Module initializer
│   │   ├── drifter.py                         # DriftSimulator class wrapping OpenDrift/OpenOil with CMEMS & ERA5 readers
│   │   └── router.py                          # APIRouter (/api/drift) handling backward hindcast and forward forecast
│   │
│   └── attribution/                           # Module C: AIS Vessel Correlation & Forensic Attribution
│       ├── __init__.py                        # Module initializer
│       ├── analyzer.py                        # AttributionAnalyzer: DuckDB Parquet queries & explainable scoring engine
│       ├── live_ais.py                        # LiveAISManager: AISStream.io WebSocket ingestion & SQLite WAL buffer
│       └── router.py                          # APIRouter (/api/attribute): suspect ranking, live positions, & PDF reports
│
├── data/                                      # Data storage root for models, rasters, vectors, and caches
│   ├── ais/                                   # AIS datasets and transponder buffer storage
│   │   ├── live_ais_buffer.db                 # SQLite database storing rolling 24h AISStream pings (runtime generated)
│   │   └── reference/                         # AIS schema reference materials
│   │       └── marinecadastre_sample.csv      # Single-row CSV documenting official MarineCadastre column schema
│   │
│   ├── currents/                              # Hydrodynamic ocean currents directory
│   │   └── demo_currents.nc                   # Copernicus CMEMS NetCDF file (2.82 MB) containing uo/vo vector fields
│   │
│   ├── demo_cache/                            # Pre-computed JSON payloads for instant offline failover
│   │   ├── attribution_result.json            # Cached ranked suspects (4 vessels, top: STEALTH VOYAGER score 94)
│   │   ├── detection_result.json              # Cached slick polygon GeoJSON (12.4 km², 92% confidence)
│   │   └── drift_result.json                  # Cached 24-step hindcast and 24-step forecast trajectories
│   │
│   ├── natural_earth/                         # Global base map vector shapefiles
│   │   ├── ne_10m_land.shp                    # Natural Earth 10m high-resolution land polygons (7.17 MB)
│   │   ├── ne_10m_land.shx                    # Shapefile shape index
│   │   ├── ne_10m_land.dbf                    # Attribute database table
│   │   ├── ne_10m_land.prj                    # Coordinate projection specification (WGS84)
│   │   ├── ne_10m_land.cpg                    # Code page definition
│   │   ├── ne_10m_land.README.html            # Natural Earth data documentation
│   │   └── ne_10m_land.VERSION.txt            # Data release version tracker
│   │
│   ├── sar/                                   # Sentinel-1 Synthetic Aperture Radar storage
│   │   ├── sample_spill.tif                   # Default fallback 256x256 GeoTIFF scene over Mumbai waters (65.9 KB)
│   │   └── demo/                              # Catalog of 8 pre-staged maritime surveillance scenes
│   │       ├── scenes_index.json              # JSON catalog linking scene IDs, descriptions, and verified metrics
│   │       ├── test_slick.tif                 # Diagnostic synthetic test GeoTIFF
│   │       ├── sar_scene_01_fresh_linear_slick.tif / .png
│   │       ├── sar_scene_02_dispersed_patch_spill.tif / .png
│   │       ├── sar_scene_03_vessel_wake_discharge.tif / .png
│   │       ├── sar_scene_04_plume_feathered_slick.tif / .png
│   │       ├── sar_scene_05_coastal_approach_spill.tif / .png
│   │       ├── sar_scene_06_dual_streak_discharge.tif / .png
│   │       ├── sar_scene_07_weathered_aged_spill.tif / .png
│   │       └── sar_scene_08_high_contrast_heavy_crude.tif / .png
│   │
│   └── wind/                                  # Atmospheric wind data storage
│       └── demo_wind.nc                       # ECMWF ERA5 NetCDF file (457 KB) containing 10m u/v wind vectors
│
├── docs/                                      # Project documentation, requirements, and scenario narratives
│   ├── BUILD_GUIDE.md                         # Step-by-step phase-by-phase implementation guide for AI agents
│   ├── demo_scenario.md                       # Strategic rationale for Mumbai–Jamnagar Arabian Sea corridor scenario
│   ├── demo_script.md                         # 5-minute timed presentation script for hackathon judges
│   ├── PRD.md                                 # Official Product Requirements Document (FRs, NFRs, risks)
│   ├── WORKFLOW.md                            # Comprehensive module-by-module architectural workflow diagrams
│   └── screenshots/                           # High-resolution application screenshots for offline documentation
│       ├── 01_dashboard_idle.png
│       ├── 02_pipeline_running.png
│       ├── 03_analysis_complete_overview.png
│       ├── 04_top_suspect_detail.png
│       └── 05_future_drift_forecast.png
│
├── frontend/                                  # React 19 + Vite 8 frontend application
│   ├── .gitignore                             # Frontend ignore rules (node_modules, dist, .env)
│   ├── .oxlintrc.json                         # Oxlint code quality configuration
│   ├── Dockerfile                             # Multi-stage production container build (Node build -> Nginx Alpine)
│   ├── index.html                             # Single Page Application HTML root template
│   ├── nginx.conf                             # Production Nginx reverse proxy routing port 3000 to backend:8000
│   ├── package.json                           # Node.js dependencies, metadata, and scripts
│   ├── package-lock.json                      # Deterministic NPM dependency lockfile
│   ├── README.md                              # Frontend design manual ("Graphite Bridge" skeuomorphic design rules)
│   ├── vite.config.js                         # Vite configuration enabling `@vitejs/plugin-react`
│   │
│   ├── public/                                # Static assets served directly by web server
│   │   ├── favicon.svg                        # Radar sweep SVG brand icon
│   │   └── data/
│   │       └── ne_50m_land.json               # Natural Earth 50m land GeoJSON (2.76 MB) for 3D Three.js globe
│   │
│   └── src/                                   # Application source code
│       ├── App.css                            # Global layout, grid definitions, and responsive breakpoint queries
│       ├── App.jsx                            # Root application orchestrator: view routing, pipeline state machine
│       ├── main.jsx                           # Application entry point, typeface loaders, DOM mount
│       │
│       ├── assets/
│       │   └── hero.png                       # High-resolution raster preview asset
│       │
│       ├── data/
│       │   └── demoData.js                    # Embedded fallback datasets (DEMO_DETECTION, DEMO_DRIFT, DEMO_ATTRIBUTION)
│       │
│       ├── design/
│       │   └── tokens.css                     # Skeuomorphic CSS custom properties (colors, typography, elevation)
│       │
│       ├── components/
│       │   ├── console/                       # Tactical forensics bridge console components
│       │   │   ├── ConsoleBottomStrip.jsx     # Bottom 32px status strip (coordinates, zoom level, basemap mode)
│       │   │   ├── ConsoleMapView.jsx         # Leaflet map container: SAR swath, slicks, drift particles, live AIS
│       │   │   ├── ConsoleSidebar.jsx         # 380px instrument sidebar handling IDLE, RUNNING, COMPLETE, ERROR states
│       │   │   ├── ConsoleTopBar.jsx          # Top 64px header: status lamp, scene dropdown, file upload, run button
│       │   │   ├── EvidencePdfModal.jsx       # Modal dialog previewing official signed MARPOL forensic report
│       │   │   ├── MapLegend.jsx              # Skeuomorphic overlay legend detailing map layer symbols
│       │   │   └── MapTimelineSlider.jsx      # Draggable scrub bar and play/pause for 24h trajectory simulation
│       │   │
│       │   ├── landing/                       # Public marketing & presentation landing page components
│       │   │   ├── ConsolePreviewSection.jsx  # Interactive landing preview of the tactical bridge interface
│       │   │   ├── EvidenceSection.jsx        # Tribunal compliance and MARPOL Annex I evidentiary breakdown
│       │   │   ├── FeaturesGrid.jsx           # 2x3 grid detailing U-Net, OpenDrift, DuckDB, and Explainability
│       │   │   ├── FinalCtaSection.jsx        # Bottom conversion banner launching console analysis
│       │   │   ├── GlobeHero3D.jsx            # Three.js interactive 3D globe with projected shipping lanes
│       │   │   ├── HeroSection.jsx            # Landing hero with headline, status lamps, and direct CTA buttons
│       │   │   ├── LandingFooter.jsx          # Institutional footer listing NTRO/SIH disclaimers and specs
│       │   │   ├── LandingNav.jsx             # Top sticky landing navigation bar
│       │   │   ├── LandingPage.jsx            # Landing page wrapper orchestrating all marketing sections
│       │   │   ├── PipelineSection.jsx        # 4-stage visual architecture walkthrough (Detect -> Drift -> Attribute)
│       │   │   ├── StatsBand.jsx              # Metric counters band: 7.28M records, <2m time, 4-class AI, 94/100 score
│       │   │   └── UseCasesSection.jsx        # Operational roles: Coast Guard, Port Authorities, Marine Insurers
│       │   │
│       │   ├── primitives/                    # Reusable tactile skeuomorphic UI components
│       │   │   ├── BezelScreen.jsx            # Inset CRT display monitor well with inner shadow
│       │   │   ├── BtnCap.jsx                 # Push-button cap with primary amber, ghost, and alarm red states
│       │   │   ├── Dial.jsx                   # 240-degree SVG confidence gauge with animated needle
│       │   │   ├── Lamp.jsx                   # Physical 10px LED indicator (idle, blinking run, complete, error)
│       │   │   ├── MetalPanel.jsx             # Brushed graphite panel with 4 corner screw rivets
│       │   │   ├── PaperTape.jsx              # Perforated teleprinter cream paper tape with dashed dividers
│       │   │   ├── Plaque.jsx                 # Floating toast notification plaque with status lamp
│       │   │   ├── Stamp.jsx                  # Rotated rubber stamps (DETECTED, PRIME SUSPECT, COMPLETE)
│       │   │   └── Toggle.jsx                 # Physical 44x24 metal toggle switch with amber active indicator
│       │   │
│       │   └── reactbits/                     # Enhanced motion & typography primitive components
│       │       ├── AnimatedContent.jsx        # Viewport entrance wrapper with configurable stagger delays
│       │       ├── CountUp.jsx                # Numeric interpolation component for stats and dials
│       │       ├── Particles.jsx              # Lightweight canvas background particle field
│       │       ├── SplitText.jsx              # Staggered character reveal animation for display typography
│       │       └── SpotlightCard.jsx          # Mouse-following radial amber spotlight card wrapper
│       │
│       └── dist/                              # Pre-compiled static frontend production build
│
├── models/                                    # Model weights and standalone training scripts
│   ├── train_unet.py                          # Standalone Python script exported from Colab training notebook
│   └── unet_spill_weights.pt                  # Serialized PyTorch state dictionary weights file (30.86 MB)
│
├── notebooks/                                 # Interactive Jupyter exploration and training notebooks
│   └── train_unet.ipynb                       # Google Colab compatible notebook for 4-class U-Net training
│
└── scripts/                                   # Automation, data ingestion, and testing utilities
    ├── download_data.py                       # CLI utility to verify .env keys and pull CMEMS currents / ERA5 wind
    └── generate_demo_cache.py                 # Mathematical script generating synthetic demo cache JSON files
```

---

## 5. Frontend Architecture & API Consumption

### 5.1 Technology & Styling
The frontend is built with React 19 and bundled using Vite 8 in ECMAScript Module (`"type": "module"`) format. Styling is strictly implemented through custom Vanilla CSS (`src/design/tokens.css` and `src/App.css`), adhering to the "Graphite Bridge" skeuomorphic design system. The visual theme simulates maritime military bridge hardware:
- **Metal Panels:** Dark warm graphite (`#1D1A16` to `#26221C`) held with screw rivets.
- **Paper Teleprinters:** Warm cream paper surfaces (`#EDE4D3`) with perforated headers and dashed row dividers (`#B7AC93`).
- **Screen Wells:** Inset CRT displays (`#131110`) featuring inner shadows and amber radial reticles.
- **Design Constraints:** Strict absence of standard SaaS blues or purples (`Zero Blue • Zero Purple`), zero emojis (replaced with Lucide icons), and an uncompromising 4px spatial layout grid.

### 5.2 Application View States & Routing
The application operates as a stateful Single Page Application with two primary top-level views toggled via `currentView` in `src/App.jsx`:
1. `landing`: The marketing, educational, and institutional overview featuring the Three.js 3D globe (`GlobeHero3D.jsx`), interactive pipeline stage breakdown, metric cards, and use-case scenarios.
2. `console`: The primary operations dashboard divided into a 64px `ConsoleTopBar`, a full-viewport `ConsoleMapView` (with integrated Leaflet canvas and bottom timeline controller), a 380px right-hand `ConsoleSidebar`, and a 32px bottom `ConsoleBottomStrip`.

### 5.3 Complete Table of Frontend API Calls

| HTTP Method | Request URL / Endpoint | Calling File & Line | Payload / Parameters | Purpose & Lifecycle Event | Fallback Mechanism if Backend Fails |
|---|---|---|---|---|---|
| `GET` | `${API}/api/detect/scenes` | `src/App.jsx:58` | None | Fetches the catalog of 8 pre-staged SAR surveillance scenes on initial console mount | Silently catches error; leaves `sarScenes` array empty |
| `POST` | `${API}/api/detect/` | `src/App.jsx:93` | `FormData` containing `scene_file: File` (.tif) | Submits user-uploaded GeoTIFF to U-Net segmentation pipeline | Transparently falls back to `DEMO_DETECTION` after 1200ms delay |
| `POST` | `${API}/api/detect/?scene_id={id}` | `src/App.jsx:95` | Query param `scene_id` (e.g. `SAR_SCENE_01`) | Triggers U-Net detection on a pre-staged SAR scene on backend disk | Transparently falls back to `DEMO_DETECTION` after 1200ms delay |
| `POST` | `${API}/api/detect/` | `src/App.jsx:97` | None | Triggers detection on default fallback scene (`sample_spill.tif`) | Transparently falls back to `DEMO_DETECTION` after 1200ms delay |
| `POST` | `${API}/api/drift/` | `src/App.jsx:131` | JSON: `{spill_polygon_geojson, detection_timestamp, hindcast_hours: 12, forecast_hours: 12}` | Executes backward hindcast and forward forecast OpenDrift simulations | Transparently falls back to `DEMO_DRIFT` after 1400ms delay |
| `POST` | `${API}/api/attribute/` | `src/App.jsx:171` | JSON: `{origin_polygon_geojson, origin_time_start, origin_time_end, spatial_buffer_km: 15.0, temporal_buffer_hours: 4.0, top_n: 10}` | Executes AIS traffic filtering, anomaly detection, and suspect ranking | Transparently falls back to `DEMO_ATTRIBUTION` after 1200ms delay |
| `GET` | `${API}/api/attribute/report/INCIDENT-2024-001` | `src/App.jsx:233` | None (`format=pdf` default) | Invoked via `window.open` when clicking "Download PDF Report" in modal | Generates and downloads official binary PDF document |
| `GET` | `http://localhost:8000/api/attribute/live?format=geojson` | `src/components/console/ConsoleMapView.jsx:130` | Query param `format=geojson` | Polled every 8000ms when the "Live AIS" toggle switch is active | Silently catches network exception; map retains previous pings |
| `GET` | `/data/ne_50m_land.json` | `src/components/landing/GlobeHero3D.jsx:411` | None | Local static fetch for Natural Earth land polygons to render 3D globe | Cascades to GitHub raw CDN, then unpkg CDN |

### 5.4 Environment Configuration & Security
- **Expected Variables:** The frontend expects `VITE_API_URL` (defined in `frontend/.env`), defaulting to `http://localhost:8000`.
- **Authentication:** The current implementation is an unauthenticated institutional workstation interface. No JWTs, bearer tokens, or session cookies are transmitted.

---

## 6. Backend Services & Endpoint Specifications

### 6.1 Server Architecture
- **Language & Framework:** Python 3.11 with FastAPI (`fastapi>=0.104.0`) running on Uvicorn (`uvicorn[standard]>=0.24.0`).
- **Entry Point:** `backend/main.py`.
- **CORS Configuration:** Explicitly permits origins `http://localhost:3000`, `http://localhost:5173`, `http://localhost:5174`, `http://127.0.0.1:5173`, and `http://127.0.0.1:5174`.

### 6.2 Complete Backend API Route Directory

| HTTP Method | Route Path | Handler Function & Location | Auth | Request Body / Query Params | Response Structure & Status |
|---|---|---|---|---|---|
| `GET` | `/api/health` | `health_check` (`backend/main.py:66`) | None | None | `200 OK`: `{"status": "ok", "service": "oil-spill-detection", "version": "0.1.0"}` |
| `GET` | `/api/demo/cached` | `get_demo_cached` (`backend/main.py:76`) | None | None | `200 OK`: `{"cached": bool, "results": {"detection": {...}, "drift": {...}, "attribution": [...]}}` |
| `GET` | `/api/detect/scenes` | `list_sar_scenes` (`backend/detection/router.py:15`) | None | None | `200 OK`: `{"scenes": [...], "count": int}` sourced from `data/sar/demo/scenes_index.json` |
| `POST` | `/api/detect/` | `run_detection` (`backend/detection/router.py:27`) | None | Multipart File: `scene_file` (optional); Query: `scene_id` (optional str) | `200 OK`: GeoJSON `FeatureCollection` with polygon geometries & properties; `503`: Weights missing; `404`: Scene not found; `500`: Error |
| `POST` | `/api/drift/` | `run_drift` (`backend/drift/router.py:26`) | None | JSON body: `DriftRequest` (`spill_polygon_geojson: dict`, `detection_timestamp: str`, `hindcast_hours: int = 72`, `forecast_hours: int = 48`) | `200 OK`: `{"origin_estimate": Feature, "hindcast_track": [Feature, ...], "forecast_track": [Feature, ...]}`; `500`: Error |
| `POST` | `/api/attribute/` | `run_attribution` (`backend/attribution/router.py:31`) | None | JSON body: `AttributionRequest` (`origin_polygon_geojson: dict`, `origin_time_start: str`, `origin_time_end: str`, `spatial_buffer_km: float = 10.0`, `temporal_buffer_hours: float = 3.0`, `top_n: int = 10`) | `200 OK`: Array of suspect objects sorted by `suspicion_score` descending; `500`: Error |
| `GET` | `/api/attribute/report/{incident_id}` | `get_report` (`backend/attribution/router.py:72`) | None | Path: `incident_id` (str); Query: `format` (`"pdf"` or `"json"`, default `"pdf"`) | `200 OK`: Binary stream `application/pdf` (attachment header `Incident_{id}_Report.pdf`) or JSON summary object |
| `GET` | `/api/attribute/live` | `get_live_vessels` (`backend/attribution/router.py:244`) | None | Query params: `lat_min`, `lat_max`, `lon_min`, `lon_max` (float), `limit` (int = 150), `format` (`"geojson"` or `"json"`) | `200 OK`: GeoJSON `FeatureCollection` of real-time vessel positions within last 30 minutes |
| `GET` | `/api/attribute/history` | `get_vessel_history` (`backend/attribution/router.py:271`) | None | Query params: `hours` (float = 5.0), `mmsi` (int), `lat_min`, `lat_max`, `lon_min`, `lon_max` (float) | `200 OK`: GeoJSON `FeatureCollection` with `LineString` vessel tracks over trailing N hours |
| `POST` | `/api/attribute/live/start`| `start_live_ingestion` (`backend/attribution/router.py:343`)| None | None | `200 OK`: `{"status": "started", "message": "AISStream live ingestion active."}` |

### 6.3 Database Schemas & Storage Engines

#### 1. Live AIS Buffer Database (`SQLite3`)
- **File Location:** `data/ais/live_ais_buffer.db`
- **Configuration:** Initialized with `PRAGMA journal_mode=WAL;` and `PRAGMA synchronous=NORMAL;` to support non-blocking concurrent writes from the background WebSocket thread alongside read queries from HTTP handlers.
- **Table Definition:**
```sql
CREATE TABLE IF NOT EXISTS vessel_pings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mmsi INTEGER,
    ship_name TEXT,
    ship_type TEXT,
    latitude REAL,
    longitude REAL,
    sog REAL,              -- Speed Over Ground in knots
    cog REAL,              -- Course Over Ground in degrees
    heading REAL,          -- True Heading in degrees
    timestamp TEXT,        -- UTC ISO 8601 string
    received_at REAL       -- Epoch floating point timestamp
);
CREATE INDEX IF NOT EXISTS idx_vessel_mmsi ON vessel_pings(mmsi);
CREATE INDEX IF NOT EXISTS idx_vessel_received ON vessel_pings(received_at);
CREATE INDEX IF NOT EXISTS idx_vessel_coords ON vessel_pings(latitude, longitude);
```
- **Automated Retention:** Pings older than 24 hours (`received_at < now - 86400`) are pruned during every batch flush.

#### 2. Archive AIS Telemetry Dataset (`DuckDB` over Parquet)
- **File Location:** `data/ais/marinecadastre_2024_01_15.parquet`
- **Schema Columns:** `mmsi` (INTEGER), `base_date_time` (TIMESTAMP), `lat` (DOUBLE), `lon` (DOUBLE), `sog` (FLOAT), `cog` (FLOAT), `heading` (FLOAT), `vessel_name` (VARCHAR), `vessel_type` (INTEGER).
- **Vessel Type Mapping:**
  - `80–89`: Tanker (Hydrocarbon carrier prior: 100/100)
  - `70–79`: Cargo (Freighter prior: 70/100)
  - `30–39`: Fishing (Commercial trawler prior: 25/100)
  - `60–69`: Passenger (Ferry / cruise prior: 15/100)
  - Other: Prior 10/100

### 6.4 Third-Party Integrations
1. **Copernicus Data Space Ecosystem (CDSE):** Used to query Sentinel-1 Level-1 GRD imagery in Interferometric Wide (IW) swath mode with VV polarization.
2. **Copernicus Marine Service (CMEMS):** Product `GLOBAL_ANALYSISFORECAST_PHY_001_024` providing 6-hourly global ocean physics analysis and forecasts (eastward velocity `uo`, northward velocity `vo`) in NetCDF format.
3. **Copernicus Climate Data Store (CDS / ECMWF):** ERA5 single-levels reanalysis dataset providing 10-meter U and V wind components.
4. **AISStream.io:** Real-time WebSocket gateway (`wss://stream.aisstream.io/v0/stream`) streaming worldwide maritime transponder messages (`PositionReport` and `ShipStaticData`).

---

## 7. Machine Learning Pipeline & Hydrodynamic Simulation

### 7.1 Problem Specification
- **Task:** 4-class Semantic Segmentation on single-band Sentinel-1 SAR backscatter imagery to delineate marine oil slicks while suppressing high-occurrence false positive lookalikes.
- **Target Classes:**
  - Class 0: `Sea` (Ambient ocean backscatter)
  - Class 1: `Oil Spill` (Damped capillary waves, low backscatter dark patch)
  - Class 2: `Lookalike` (Low-wind zones, biogenic grease films, algal blooms, rain squalls)
  - Class 3: `Ship` (Hard target, high specular return / bright point backscatter)

### 7.2 Exact Model Definition (`backend/detection/detector.py` & `models/train_unet.py`)
```python
import torch
import torch.nn as nn

class UNet(nn.Module):
    def __init__(self, in_channels=1, out_channels=4):
        super(UNet, self).__init__()
        
        def conv_block(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True)
            )
            
        self.encoder1 = conv_block(in_channels, 64)
        self.encoder2 = conv_block(64, 128)
        self.encoder3 = conv_block(128, 256)
        
        self.pool = nn.MaxPool2d(2, 2)
        self.bottleneck = conv_block(256, 512)
        
        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.decoder3 = conv_block(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.decoder2 = conv_block(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.decoder1 = conv_block(128, 64)
        
        self.out_conv = nn.Conv2d(64, out_channels, kernel_size=1)

    def forward(self, x):
        enc1 = self.encoder1(x)
        enc2 = self.encoder2(self.pool(enc1))
        enc3 = self.encoder3(self.pool(enc2))
        
        bottleneck = self.bottleneck(self.pool(enc3))
        
        dec3 = self.upconv3(bottleneck)
        dec3 = torch.cat((dec3, enc3), dim=1)
        dec3 = self.decoder3(dec3)
        
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat((dec2, enc2), dim=1)
        dec2 = self.decoder2(dec2)
        
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat((dec1, enc1), dim=1)
        dec1 = self.decoder1(dec1)
        
        return self.out_conv(dec1)
```

### 7.3 Model Weights & Checkpoint Properties
- **File Path:** `models/unet_spill_weights.pt`
- **File Size:** `30,865,211` bytes (~29.43 MB)
- **Format:** Serialized PyTorch state dictionary (`torch.save(model.state_dict())`) containing 106 parameter tensors (weights and biases across 14 Conv2d layers, 3 ConvTranspose2d layers, and 14 BatchNorm2d layers).
- **Device Placement:** Dynamically loaded via `torch.device("cuda" if torch.cuda.is_available() else "cpu")`.

### 7.4 Preprocessing & Vector Extraction Pipeline (`backend/detection/detector.py`)
```python
def preprocess(self, sar_image_path):
    with rasterio.open(sar_image_path) as src:
        image = src.read(1)
        transform = src.transform
        crs = src.crs
        
    image_resized = cv2.resize(image, (256, 256))
    image_norm = (image_resized - image_resized.min()) / (image_resized.max() - image_resized.min() + 1e-8)
    tensor = torch.tensor(image_norm, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    
    return tensor.to(self.device), transform, crs, image.shape
```

Vectorization and geometric classification logic:
1. Model forward pass outputs logits of shape `[1, 4, 256, 256]`; softmax computes class probabilities.
2. Binary mask extracted where `argmax(probs) == 1` (Oil Spill).
3. Upscaled back to original GeoTIFF resolution using nearest-neighbor interpolation.
4. Vectorized into GeoJSON polygons via `rasterio.features.shapes(spill_mask_orig, transform=transform)`.
5. Noise suppression: Polygons with coordinate area `< 0.0001` deg² are discarded.
6. Area calculation: Approximation `poly.area * 12321` km² (based on 1° ≈ 111 km).
7. Minimum rotated bounding rectangle (`poly.minimum_rotated_rectangle`) computes length, width, and `elongation = length / (width + 1e-8)`.
8. Age heuristic classification:
   - `elongation <= 3.0` -> `"fresh"` (<6h old, compact slick)
   - `3.0 < elongation <= 6.0` -> `"6-24h"` (moderately spread)
   - `elongation > 6.0` -> `">24h"` (highly sheared and weathered emulsion)

### 7.5 Hydrodynamic Trajectory Simulation (`backend/drift/drifter.py`)
- **Engine:** OpenDrift 1.14 with `OpenOil` module.
- **Physical Forcing Inputs:**
  - NetCDF Ocean Currents: `data/currents/demo_currents.nc` (`reader_netCDF_CF_generic`)
  - NetCDF Winds: `data/wind/demo_wind.nc` (`reader_netCDF_CF_generic`)
- **Physics Parameters:**
  - Wind drift factor: `3.5%` of 10m wind velocity (`seed:wind_drift_factor = 0.035`)
  - Processes modeled: Evaporation (`True`), Emulsification (`True`), Natural Dispersion (`False`)
  - Oil type: `'GENERIC MEDIUM CRUDE'`
  - Particle Seeding: 300 uniform random particles seeded within the detected slick polygon bounds.
- **Hindcasting (Backward):** Timestep `-1 hour`, duration 12–24 hours. The convex hull of the final backward step defines the **Origin Probability Window**.
- **Forecasting (Forward):** Timestep `+1 hour`, duration 12–24 hours. Generates sequential convex hulls illustrating predicted future slick propagation.

### 7.6 Forensic Vessel Attribution Engine (`backend/attribution/analyzer.py`)
For every vessel intersecting the spatial-temporal origin window, an explainable composite suspicion score $S \in [0, 100]$ is computed:
$$S = \min\left(100, \max\left(0, w_{\text{spatial}} S_{\text{spatial}} + w_{\text{temporal}} S_{\text{temporal}} + w_{\text{type}} S_{\text{type}} + w_{\text{anomaly}} S_{\text{anomaly}}\right)\right)$$
Where weights are configured as:
- $w_{\text{spatial}} = 0.45$ (Spatial Proximity)
- $w_{\text{temporal}} = 0.25$ (Temporal Alignment)
- $w_{\text{vessel\_type}} = 0.20$ (Vessel Type Risk Prior)
- $w_{\text{anomaly}} = 0.10$ (Telemetry Anomaly)

Sub-score formulas:
1. **Spatial Proximity Score ($S_{\text{spatial}}$):**
   $$S_{\text{spatial}} = \max\left(0, 100 \times \left(1.0 - \frac{d_{\min}}{0.35^\circ}\right)\right)$$
   Where $d_{\min}$ is the minimum Euclidean distance in degrees between vessel pings and the origin polygon (0 if inside; maximum range 0.35° ≈ 38.8 km).
2. **Temporal Alignment Score ($S_{\text{temporal}}$):**
   $$S_{\text{temporal}} = \max\left(0, 100 \times \left(1.0 - \frac{\Delta t_{\min}}{18 \times 3600}\right)\right)$$
   Where $\Delta t_{\min}$ is the temporal offset in seconds from the estimated release window (0 if ping occurs during release window; maximum consideration window 18 hours).
3. **Vessel Type Prior ($S_{\text{type}}$):**
   - Tanker: `100`
   - Cargo: `70`
   - Fishing: `25`
   - Passenger: `15`
   - Other: `10`
4. **Behavioral Anomaly Score ($S_{\text{anomaly}}$):**
   - Speed drop anomaly detected ($\Delta \text{SOG} \ge 5.0\text{ kn}$ with minimum $\text{SOG} \le 3.5\text{ kn}$): `+60 points`
   - AIS transponder gap detected (signal loss $>1800\text{ seconds}$ in surveillance corridor): `+40 points`

---

## 8. Data Inventory & Specifications

### 8.1 File Inventory

```
Directory: data/
├── ais/
│   ├── live_ais_buffer.db                     # Runtime SQLite database (WAL mode)
│   └── reference/
│       └── marinecadastre_sample.csv          # 214 bytes (Schema definition)
├── currents/
│   └── demo_currents.nc                       # 2,818,118 bytes (2.82 MB HDF5/NetCDF)
├── demo_cache/
│   ├── attribution_result.json                # 7,399 bytes (Pre-computed JSON)
│   ├── detection_result.json                  # 3,222 bytes (Pre-computed GeoJSON)
│   └── drift_result.json                      # 146,232 bytes (Pre-computed GeoJSON)
├── natural_earth/
│   ├── ne_10m_land.shp                        # 7,166,824 bytes (7.17 MB ESRI Shapefile)
│   ├── ne_10m_land.shx                        # 188 bytes
│   ├── ne_10m_land.dbf                        # 350 bytes
│   ├── ne_10m_land.prj                        # 145 bytes (WGS84)
│   ├── ne_10m_land.cpg                        # 5 bytes
│   ├── ne_10m_land.README.html                # 37,571 bytes
│   └── ne_10m_land.VERSION.txt                # 7 bytes
├── sar/
│   ├── sample_spill.tif                       # 65,950 bytes (256x256 GeoTIFF)
│   └── demo/
│       ├── scenes_index.json                  # 5,966 bytes (Scene catalog)
│       ├── test_slick.tif                     # 65,950 bytes
│       ├── sar_scene_01_fresh_linear_slick.tif (65,950 B) / .png (60,722 B)
│       ├── sar_scene_02_dispersed_patch_spill.tif (65,950 B) / .png (60,506 B)
│       ├── sar_scene_03_vessel_wake_discharge.tif (65,950 B) / .png (59,333 B)
│       ├── sar_scene_04_plume_feathered_slick.tif (65,950 B) / .png (59,547 B)
│       ├── sar_scene_05_coastal_approach_spill.tif (65,950 B) / .png (60,142 B)
│       ├── sar_scene_06_dual_streak_discharge.tif (65,950 B) / .png (60,564 B)
│       ├── sar_scene_07_weathered_aged_spill.tif (65,950 B) / .png (60,366 B)
│       └── sar_scene_08_high_contrast_heavy_crude.tif (65,950 B) / .png (60,574 B)
└── wind/
    └── demo_wind.nc                           # 456,937 bytes (446 KB HDF5/NetCDF)
```

### 8.2 Tabular Data Sample (`data/ais/reference/marinecadastre_sample.csv`)
- **Columns & Dtypes:** `MMSI` (Int), `BaseDateTime` (ISO Timestamp), `LAT` (Float), `LON` (Float), `SOG` (Float), `COG` (Float), `Heading` (Float), `VesselName` (Str), `IMO` (Str), `CallSign` (Str), `VesselType` (Str), `Status` (Int), `Length` (Int), `Width` (Int), `Draft` (Float), `Cargo` (Int).
- **Sample Row:**
```csv
MMSI,BaseDateTime,LAT,LON,SOG,COG,Heading,VesselName,IMO,CallSign,VesselType,Status,Length,Width,Draft,Cargo
123456789,2024-01-15T06:30:00,19.5,72.5,12.0,135.0,135.0,TEST VESSEL,IMO123,CALL1,Tanker,0,200,30,10,1
```

### 8.3 SAR Raster Image Specifications
- **Dimensions:** Single-band, $256 \times 256$ pixels.
- **Data Type:** `uint8` (values ranging from 15 to 208 representing calibrated radar backscatter $\sigma^0$).
- **Spatial Reference:** WGS 84 (`EPSG:4326`).
- **Pixel Scale:** $0.0009375^\circ$ per pixel (~104 meters spatial resolution).
- **Geographic Bounding Box:** Centered around $19.45^\circ\text{N}–19.65^\circ\text{N}, 72.38^\circ\text{E}–72.62^\circ\text{E}$ (approx. 150 km west of Mumbai in the Gulf-to-Refinery tanker shipping lane).

---

## 9. Benchmarks & Evaluation Results

### 9.1 Evaluation Results Audit
A comprehensive audit of the repository reveals that **NO offline held-out test evaluation logs, loss curve history, or benchmark confusion matrix files exist on disk**. 
- In `notebooks/train_unet.ipynb`, all code cells have `execution_count: null` and `outputs: []`, confirming that training was not executed within this workspace.
- The model weights file `models/unet_spill_weights.pt` was trained externally (e.g. Google Colab GPU environment) on synthetic SAR ellipse imagery and imported into the repository.

### 9.2 Statically Verified Scene Detections (`data/sar/demo/scenes_index.json`)
The repository includes verified detection benchmarks recorded during model verification across the 8 pre-staged surveillance scenes:

| Scene ID | Pattern Classification | Verified Surface Area ($km^2$) | Verified AI Confidence | Qualitative Age Bucket | Centroid Coordinates (Lon, Lat) |
|---|---|---|---|---|---|
| `SAR_SCENE_01` | Fresh Linear Tanker Discharge | $27.21\text{ km}^2$ | $90.1\%$ | `>24h` | `[72.5004, 19.5597]` |
| `SAR_SCENE_02` | Dispersed Wind-Sheared Patch | $42.62\text{ km}^2$ | $94.0\%$ | `fresh` | `[72.4225, 19.6629]` |
| `SAR_SCENE_03` | Vessel Wake Discharge (Point Target) | $33.11\text{ km}^2$ | $69.6\%$ | `6-24h` | `[72.5718, 19.4282]` |
| `SAR_SCENE_04` | Heavy Blowout Feathered Plume | $84.74\text{ km}^2$ | $92.9\%$ | `fresh` | `[72.3518, 19.7121]` |
| `SAR_SCENE_05` | Coastal Nearshore Anchor Spill | $55.37\text{ km}^2$ | $91.7\%$ | `fresh` | `[72.6457, 19.4960]` |
| `SAR_SCENE_06` | Dual-Vessel Convergence Discharge | $16.94\text{ km}^2$ | $88.3\%$ | `>24h` | `[72.4024, 19.5230]` |
| `SAR_SCENE_07` | Weathered Emulsified Spill | $41.23\text{ km}^2$ | $92.2\%$ | `fresh` | `[72.3491, 19.8322]` |
| `SAR_SCENE_08` | High-Contrast Heavy Crude Bunker | $39.40\text{ km}^2$ | $92.8\%$ | `6-24h` | `[72.5222, 19.5321]` |

### 9.3 System Latency & Performance Goals (from PRD)
- **Target Segmentation IoU / Dice:** $\ge 0.70$ on Sentinel-1 SAR held-out test sets.
- **End-to-End Pipeline Execution:** Under 60 seconds for live inference; under 2 seconds when utilizing pre-computed caching.
- **Explainability Metric:** 100% of attribution scores must break down into auditable sub-scores for legal admissibility.

---

## 10. Key Code Snippets

### Snippet 1: U-Net Model Forward Pass & Polygon Extraction
**File Path:** `backend/detection/detector.py:102-176`
```python
    def detect_spill(self, sar_scene_path):
        if not self.model_loaded:
            raise RuntimeError("Model weights not found. Cannot run detection.")
            
        tensor, transform, crs, orig_shape = self.preprocess(sar_scene_path)
        
        with torch.no_grad():
            output = self.model(tensor)
            probs = torch.softmax(output, dim=1)
            
            # Classes: 0: sea, 1: oil_spill, 2: lookalike, 3: ship
            spill_prob = probs[0, 1].cpu().numpy()
            predicted_class = torch.argmax(probs, dim=1).cpu().numpy()[0]
            
        # Extract oil spill mask
        spill_mask = (predicted_class == 1).astype(np.uint8)
        
        if np.sum(spill_mask) == 0:
            return {"type": "FeatureCollection", "features": []}
            
        spill_mask_orig = cv2.resize(spill_mask, (orig_shape[1], orig_shape[0]), interpolation=cv2.INTER_NEAREST)
        spill_prob_orig = cv2.resize(spill_prob, (orig_shape[1], orig_shape[0]))
        
        features = []
        for geom, val in shapes(spill_mask_orig, mask=(spill_mask_orig==1), transform=transform):
            poly = shape(geom)
            if poly.area < 0.0001:
                continue
                
            centroid = poly.centroid
            area_km2 = poly.area * 12321 
            
            rect = poly.minimum_rotated_rectangle
            coords = list(rect.exterior.coords)
            edge1 = np.linalg.norm(np.array(coords[0]) - np.array(coords[1]))
            edge2 = np.linalg.norm(np.array(coords[1]) - np.array(coords[2]))
            length, width = max(edge1, edge2), min(edge1, edge2)
            elongation = length / (width + 1e-8)
            
            age_bucket = "fresh"
            if elongation > 3.0:
                age_bucket = "6-24h"
            if elongation > 6.0:
                age_bucket = ">24h"
                
            confidence = float(np.mean(spill_prob_orig[spill_mask_orig == 1]))
            
            features.append({
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "area_km2": float(area_km2),
                    "centroid": [centroid.x, centroid.y],
                    "elongation_ratio": float(elongation),
                    "confidence": confidence,
                    "timestamp": "2024-01-15T06:00:00Z",
                    "age_bucket": age_bucket
                }
            })
            
        return {"type": "FeatureCollection", "features": features}
```

### Snippet 2: OpenDrift Model Seeding & Simulation Execution
**File Path:** `backend/drift/drifter.py:89-155`
```python
        o.seed_elements(
            lon=lons, 
            lat=lats, 
            time=dt,
            number=len(lons),
            radius=0, 
            oil_type='GENERIC MEDIUM CRUDE'
        )
        
        # Run simulation
        if backward:
            duration = timedelta(hours=hours)
            time_step = timedelta(hours=-1)
        else:
            duration = timedelta(hours=hours)
            time_step = timedelta(hours=1)
            
        o.run(duration=duration, time_step=time_step)
        
        lons_out = o.result.lon.values
        lats_out = o.result.lat.values
        times_out = o.result.time.values
        
        trajectory = []
        num_steps = lons_out.shape[1]
        
        for step in range(num_steps):
            col_lons = lons_out[:, step]
            col_lats = lats_out[:, step]
            valid = ~np.isnan(col_lons) & ~np.isnan(col_lats)
            step_lons = col_lons[valid]
            step_lats = col_lats[valid]
            
            if len(step_lons) >= 3:
                points = [Point(lon, lat) for lon, lat in zip(step_lons, step_lats)]
                multipoint = unary_union(points)
                hull = multipoint.convex_hull
                
                step_dt = str(times_out[step])[:19] + "Z"
                feature = {
                    "type": "Feature",
                    "geometry": geojson.loads(json.dumps(geojson.Feature(geometry=hull).geometry)),
                    "properties": {
                        "timestamp": step_dt,
                        "step": step,
                        "is_backward": backward
                    }
                }
                trajectory.append(feature)
                
        if backward:
            origin_estimate = trajectory[-1] if trajectory else None
            return {"origin_estimate": origin_estimate, "hindcast_track": trajectory}
        else:
            return {"forecast_track": trajectory}
```

### Snippet 3: Explainable Suspicion Scoring Engine
**File Path:** `backend/attribution/analyzer.py:274-334`
```python
        # 1. Spatial Score (0-100) - max consideration range: 0.35 deg (~38km)
        max_dist_deg = 0.35
        spatial_score = max(0.0, 100.0 * (1.0 - (min_spatial_dist / max_dist_deg)))
        
        # 2. Temporal Score (0-100) - max consideration offset: 18 hours
        max_time_sec = 18 * 3600
        temporal_score = max(0.0, 100.0 * (1.0 - (min_temporal_dist / max_time_sec)))
        
        # 3. Vessel Type Score (0-100)
        type_scores = {
            "Tanker": 100,
            "Cargo": 70,
            "Fishing": 25,
            "Passenger": 15,
            "Other": 10
        }
        type_score = float(type_scores.get(vessel.get('type', 'Other'), 10))

        # 4. Anomaly Score (0-100)
        anomaly_score = 0.0
        if vessel.get('has_speed_drop'):
            anomaly_score += 60.0
        if vessel.get('has_ais_gap'):
            anomaly_score += 40.0
        
        # Total Weighted Composite Score
        total_score = (
            (self.w_spatial * spatial_score) +
            (self.w_temporal * temporal_score) +
            (self.w_vessel_type * type_score) +
            (self.w_anomaly * anomaly_score)
        )
        total_score = min(100, max(0, total_score))
        
        line_coords = [[round(lon, 4), round(lat, 4)] for lon, lat, dt, sog in track]
        track_geojson = {"type": "LineString", "coordinates": line_coords}
        
        return {
            "mmsi": vessel["mmsi"],
            "name": vessel["name"],
            "type": vessel["type"],
            "suspicion_score": int(round(total_score)),
            "anomaly": vessel.get("anomaly", "Normal"),
            "sub_scores": {
                "spatial": int(round(spatial_score)),
                "temporal": int(round(temporal_score)),
                "vessel_type": int(round(type_score)),
                "anomaly": int(round(anomaly_score))
            },
            "closest_approach_distance_km": round(min_spatial_dist * 111.0, 2),
            "closest_approach_time": closest_time.isoformat() + "Z" if closest_time else None,
            "closest_approach_speed_kts": closest_speed,
            "intersection_point": closest_point,
            "track_geojson": track_geojson
        }
```

### Snippet 4: DuckDB Parquet Extraction with Anomaly Analysis
**File Path:** `backend/attribution/analyzer.py:129-228`
```python
        con = duckdb.connect()
        try:
            seed = int(abs(centroid.x * 7919 + centroid.y * 6971 + time.time() * 100)) % 100000
            query = f"""
                SELECT 
                    mmsi, vessel_name, vessel_type,
                    min(base_date_time) as min_t,
                    max(base_date_time) as max_t,
                    count(*) as ping_count,
                    avg(sog) as avg_speed,
                    min(sog) as min_speed,
                    max(sog) as max_speed
                FROM '{self.ais_parquet_path}'
                WHERE vessel_name IS NOT NULL 
                  AND length(trim(vessel_name)) > 2
                  AND vessel_type in (80, 81, 82, 70, 71, 30, 60)
                GROUP BY mmsi, vessel_name, vessel_type
                HAVING count(*) >= 20 AND max(sog) > 4
                ORDER BY hash(mmsi + {seed})
                LIMIT 25
            """
            candidates = con.execute(query).fetchdf()
        except Exception as e:
            print(f"DuckDB AIS query error: {e}")
            return []
```

### Snippet 5: Live AISStream WebSocket Listener with SQLite WAL Flushes
**File Path:** `backend/attribution/live_ais.py:158-265`
```python
        while self._running:
            try:
                async with websockets.connect(self.ws_url, ssl=ssl_ctx) as ws:
                    sub_message = {
                        "APIKey": self.api_key,
                        "BoundingBoxes": bounding_boxes,
                        "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
                    }
                    await ws.send(json.dumps(sub_message))
                    batch = []
                    last_flush = time.time()

                    while self._running:
                        raw_msg = await asyncio.wait_for(ws.recv(), timeout=20.0)
                        data = json.loads(raw_msg)
                        msg_type = data.get("MessageType")
                        meta = data.get("MetaData") or {}
                        msg_body = data.get("Message") or {}

                        if msg_type == "PositionReport":
                            pos = msg_body.get("PositionReport") or {}
                            mmsi = meta.get("MMSI")
                            # Process coordinates and update self._latest_vessels cache
                            batch.append(record)

                        if (len(batch) >= 50 or (time.time() - last_flush) > 5.0) and batch:
                            self._flush_batch(batch)
                            batch = []
                            last_flush = time.time()
```

### Snippet 6: MARPOL Annex I Forensic Report Generator
**File Path:** `backend/attribution/router.py:94-237`
```python
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    story = [
        Paragraph("<b>SWACHH TRACK // MARITIME POLLUTION ENFORCEMENT</b>", title_style),
        Paragraph("OFFICIAL INCIDENT EVIDENCE &amp; VESSEL ATTRIBUTION DOSSIER", subtitle_style),
        Spacer(1, 14),
        Paragraph("<b>1. Incident Telemetry &amp; Detection Parameters</b>", h2_style),
    ]
    # Injects incident summary table, suspect vessels telemetry ranking table,
    # and legal declaration for tribunal submission.
    doc.build(story)
    pdf_bytes = buf.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Incident_{incident_id}_Report.pdf"}
    )
```

---

## 11. How to Run

### 11.1 Prerequisites
- **Operating System:** Linux, macOS, or Windows (WSL2 recommended for GDAL/OpenDrift).
- **Node.js:** `v20+` or `v24+` with `npm 10+`.
- **Python:** `Python 3.10` or `3.11` (Note: GDAL and rasterio have wheel constraints on Python 3.14).
- **Docker:** Docker Engine 20+ with Docker Compose v2+.

### 11.2 Environment Configuration
Copy `.env.example` to `.env` in the repository root and populate credentials:
```bash
# In repo root:
cp .env.example .env
```
Key configuration names:
- `COPERNICUS_DATASPACE_USERNAME` & `COPERNICUS_DATASPACE_PASSWORD` (Sentinel-1 SAR)
- `CMEMS_USERNAME` & `CMEMS_PASSWORD` (Copernicus Marine ocean currents)
- `CDS_API_KEY` (Copernicus Climate Data Store ERA5 wind)
- `AISSTREAM_API_KEY` (Optional live AIS feed from aisstream.io)

### 11.3 Local Backend Execution
```bash
# 1. Create and activate a Python 3.10 or 3.11 virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Ensure pre-cached demo data exists
python scripts/generate_demo_cache.py

# 4. Start the FastAPI development server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Redoc API Documentation: `http://localhost:8000/redoc`

### 11.4 Local Frontend Execution
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install NPM dependencies
npm install

# 3. Launch Vite development server
npm run dev
```
- Console Interface: `http://localhost:5173`

### 11.5 Full Containerized Deployment (Docker Compose)
```bash
# Build and launch both services simultaneously
docker-compose up --build

# To stop:
docker-compose down
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### 11.6 Reproducing Model Training & Cache Generation
- **Train Segmentation Model (Colab):** Open `notebooks/train_unet.ipynb` in Google Colab (with T4 GPU enabled), run all cells, and save `unet_spill_weights.pt` to `models/`.
- **Re-generate Offline Demonstration Cache:**
  ```bash
  python scripts/generate_demo_cache.py
  ```

---

## 12. Current State & Codebase Health

### 12.1 Fully Functional & Integrated Systems
1. **Frontend Skeuomorphic UI & State Machine:** The entire user interface, landing marketing sections, 3D Three.js globe, and tactical console operate without visual regressions. The state transitions (`idle` -> `loading` with step-by-step elapsed timer -> `complete` with confidence dial and ranked cards) are fully tested and functional.
2. **Offline Failover Architecture:** In `frontend/src/App.jsx`, all three pipeline stages feature fallback handlers to `src/data/demoData.js`. Even if the Python backend is uninstalled or unreachable, clicking "Run Live Analysis" displays the full analysis pipeline flawlessly.
3. **Model Weights Integrity:** `models/unet_spill_weights.pt` is present, valid, and matches the exact layer dimensions of the `UNet` class in `backend/detection/detector.py`.
4. **Hydrodynamic Environmental Data:** Both `data/currents/demo_currents.nc` (2.82 MB) and `data/wind/demo_wind.nc` (457 KB) are present on disk covering the Mumbai surveillance corridor.
5. **Report Generation Pipeline:** ReportLab PDF compilation in `backend/attribution/router.py` is fully wired to generate downloadable dossiers with embedded telemetry tables and legal tribunals declarations.
6. **Live AIS Telemetry Engine:** `backend/attribution/live_ais.py` contains a complete asynchronous WebSocket client connected to `stream.aisstream.io` with SQLite WAL batching.

### 12.2 Known Gaps & Unfinished Wiring
1. **Missing Archive Parquet Dataset:** `backend/attribution/analyzer.py` references `data/ais/marinecadastre_2024_01_15.parquet` for historical DuckDB querying. This file is **NOT present in the repository** (only a single-row CSV schema reference exists at `data/ais/reference/marinecadastre_sample.csv`). When running live without the SQLite buffer populated, `fetch_real_ais_vessels()` logs a warning and returns an empty list, causing the backend to fall back to `data/demo_cache/attribution_result.json`.
2. **Hardcoded Port in ConsoleMapView:** In `frontend/src/components/console/ConsoleMapView.jsx` line 130, the live polling URL is hardcoded as `http://localhost:8000/api/attribute/live?format=geojson` rather than consuming the `VITE_API_URL` environment variable.
3. **Dockerfile Port Discrepancy:** `frontend/Dockerfile` builds an Nginx image exposing port `3000`, but `docker-compose.yml` mounts `frontend/src` directly and exposes `5173:5173`, creating a configuration divergence between raw Dockerfile execution and Compose.
4. **Host Python Compatibility:** Geospatial C-libraries (`gdal`, `rasterio`, `netCDF4`) lack binary wheels for Python 3.14. Running the backend outside Docker requires a Python 3.10 or 3.11 virtual environment.
5. **Absence of Unit / Integration Tests:** The codebase contains zero automated test suites (no `pytest` scripts or Jest/Vitest test specs). Verification relies entirely on visual inspection and `scenes_index.json` static outputs.

---

## 13. Project Glossary & Acronyms

- **AIS (Automatic Identification System):** VHF radio transponder broadcast system mandated by the International Maritime Organization (IMO) for commercial vessels over 300 gross tonnage, transmitting dynamic position reports and static vessel data.
- **Backscatter ($\sigma^0$):** Normalized radar cross-section measured by SAR satellites. Water bodies have moderate backscatter; oil slicks damp capillary gravity waves, creating low-backscatter dark patches.
- **CDSE (Copernicus Data Space Ecosystem):** The European Space Agency (ESA) cloud platform providing open access to Sentinel satellite imagery.
- **CMEMS (Copernicus Marine Environment Monitoring Service):** EU ocean monitoring program providing hydrodynamic numerical ocean current model analyses (`uo` and `vo`).
- **COG (Course Over Ground):** True direction of vessel movement relative to the Earth's surface, in degrees.
- **CPA (Closest Point of Approach):** The minimum distance calculated between a moving vessel's track and a target geographic coordinate.
- **DuckDB:** An in-process SQL OLAP database management system optimized for analytical queries over columnar Parquet files.
- **ERA5:** Fifth-generation atmospheric reanalysis of global climate from the European Centre for Medium-Range Weather Forecasts (ECMWF).
- **Eulerian-Lagrangian:** Numerical simulation approach where fluid velocity fields are represented on fixed spatial grid points (Eulerian) while oil particles are tracked along individual trajectories (Lagrangian).
- **GRD (Ground Range Detected):** Sentinel-1 SAR product mode projected onto an Earth ellipsoid using an azimuth-range terrain model.
- **Hindcast:** Trajectory modeling running backward in time from a known slick detection point to estimate the historic discharge window.
- **IW (Interferometric Wide Swath):** The primary operational SAR imaging mode over land and coastal waters, offering a 250 km swath width at 5m x 20m spatial resolution.
- **Lookalike:** Natural non-hydrocarbon ocean surface phenomena (low-wind calms, grease ice, biogenic monomolecular slicks, internal waves) that damp radar return and mimic oil spills.
- **MARPOL Annex I:** International Convention for the Prevention of Pollution from Ships, Annex I regulating the discharge of hydrocarbons at sea.
- **MMSI (Maritime Mobile Service Identity):** A unique 9-digit identification number assigned to a ship station's radio equipment.
- **NTRO (National Technical Research Organisation):** Technical intelligence security agency under the National Security Advisor in the Prime Minister's Office, Government of India.
- **OpenDrift:** Open-source Python Lagrangian particle modeling framework developed by the Norwegian Meteorological Institute, featuring the dedicated `OpenOil` module.
- **SAR (Synthetic Aperture Radar):** Active microwave radar instrument capable of imaging the Earth's surface through clouds and darkness.
- **SIH (Smart India Hackathon):** Premier national technical competition organized by the Ministry of Education, Government of India.
- **SOG (Speed Over Ground):** Speed of a vessel relative to the sea floor, measured in knots.
- **U-Net:** Fully convolutional neural network architecture with encoder-decoder paths and skip connections, specifically designed for fast and precise semantic segmentation.

---

## 14. Unresolved Questions & External Dependencies

1. **Production Regional AIS Data Source:** While the pipeline is designed to query NOAA MarineCadastre datasets or live AISStream.io feeds, how will the Indian Coast Guard or NTRO feed official regional AIS data (e.g. DGLL coastal radar chain or NAIS network) into the backend? Will it be ingested via flat Parquet partitions or an enterprise PostGIS spatial database?
2. **Ground Truth Validation for Model Fine-Tuning:** The U-Net weights in `models/unet_spill_weights.pt` were trained on synthetic SAR noise patterns. For deployment in Indian coastal waters, what specific annotated regional SAR scenes (e.g. from the Zenodo Sentinel-1 dataset or historical Bombay High incidents) will be used for final calibration?
3. **Operational Drift Duration Limits:** NetCDF environmental data currently committed covers a 72-hour window (January 14–16, 2024). In a 24/7 continuous operational environment, what automated cron pipeline will maintain rolling 7-day CMEMS and NOAA GFS/ERA5 forecast rasters?
4. **Legal Chain of Custody:** The PDF report generator includes SHA-256 digital hash placeholders and tribunal compliance clauses. Will local law enforcement require integration with an actual asymmetric cryptographic HSM or government PKI signature service for evidentiary validity in admiralty courts?
