# Graph Report - Oil-Spill  (2026-09-19)

## Corpus Check
- 101 files · ~495,646 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 643 nodes · 816 edges · 55 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bfe6d63a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- attribution/router.py
- 4. PHASE 3 — MODEL EXECUTION & CLAIM REPRODUCTION AUDIT
- train_unet.py
- Path
- dependencies
- Oil Spill Detection & Vessel Attribution System
- LiveAISManager
- package.json
- GlobeHero3D.jsx
- 5. PHASE 4 — DATA FILE AUTHENTICITY AUDIT
- Product Requirements Document (PRD)
- Build Guide — Step by Step
- SLICKWATCH — Maritime Forensics Instrumentation Platform
- 🎤 Demo Flow (5 minutes)
- .oxlintrc.json
- PROJECT CONTEXT: SWACHH TRACK — MARINE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM
- Complete File Manifest
- 10. Key Code Snippets
- 11. How to Run
- 6. Backend Services & Endpoint Specifications
- 7. Machine Learning Pipeline & Hydrodynamic Simulation
- download_data.py
- 5. Frontend Architecture & API Consumption
- 8. Data Inventory & Specifications
- 9. Benchmarks & Evaluation Results
- 12. Current State & Codebase Health
- Audit Batch Plan
- 6. PHASE 5 — PIPELINE TRUTH TEST
- MEDIUM / P2
- GLOBAL CODEBASE AUDIT REPORT
- AttributionAnalyzer
- 3. Threat Model — Trust Boundaries
- SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT
- 2. PHASE 1 — WEIGHTS & ARCHITECTURE FORENSICS
- AUDIT FINDINGS
- CODEBASE METRICS & COMPLEXITY HOTSPOTS
- 8. TOP REFUTED / SUSPECT CLAIMS (RANKED BY SEVERITY)
- 2.3 Training Data Forensics (`notebooks/train_unet.ipynb` & `models/train_unet.py`)
- 3.1 Raster File Integrity & Metadata
- AUDIT LEDGER
- 2.2 Architecture Comparison & Weight Loading Mechanism

## God Nodes (most connected - your core abstractions)
1. `react` - 36 edges
2. `Audit Batch Plan` - 19 edges
3. `PROJECT CONTEXT: SWACHH TRACK — MARINE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM` - 15 edges
4. `LiveAISManager` - 14 edges
5. `Globe()` - 13 edges
6. `Product Requirements Document (PRD)` - 13 edges
7. `SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT` - 11 edges
8. `Build Guide — Step by Step` - 11 edges
9. `mapLinear()` - 9 edges
10. `BtnCap()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `run_attribution()` --references--> `post()`  [EXTRACTED]
  backend/attribution/router.py → scripts/audit/phase5_api_test.py
- `get_report()` --references--> `get()`  [EXTRACTED]
  backend/attribution/router.py → scripts/audit/phase5_api_test.py
- `get_live_vessels()` --references--> `get()`  [EXTRACTED]
  backend/attribution/router.py → scripts/audit/phase5_api_test.py
- `get_vessel_history()` --references--> `get()`  [EXTRACTED]
  backend/attribution/router.py → scripts/audit/phase5_api_test.py
- `start_live_ingestion()` --references--> `post()`  [EXTRACTED]
  backend/attribution/router.py → scripts/audit/phase5_api_test.py

## Import Cycles
- None detected.

## Communities (55 total, 0 thin omitted)

### Community 0 - "react"
Cohesion: 0.07
Nodes (33): App(), ConsoleBottomStrip(), ConsoleMapView(), DEMO_CENTER, ConsoleSidebar(), ConsoleTopBar(), EvidencePdfModal(), MapLegend() (+25 more)

### Community 1 - "attribution/router.py"
Cohesion: 0.06
Nodes (36): AttributionRequest, get_live_vessels(), get_report(), get_vessel_history(), BaseModel, Attribution Module Router — Module C AIS-based vessel filtering, explainable…, Request body for vessel attribution., Get real-time live vessel positions from the AISStream.io feed. Defaults to… (+28 more)

### Community 2 - "4. PHASE 3 — MODEL EXECUTION & CLAIM REPRODUCTION AUDIT"
Cohesion: 0.22
Nodes (9): 4.1 Production Pipeline Execution, 4.2 Critical Finding: 4-Class Segmentation Claim is REFUTED, 4.3 Area Approximation Discrepancy, 4.4 SAR_SCENE_06 Claim Refutation, 4.5 Confidence Calculation Line, 4.6 Degenerate Probes, 4. PHASE 3 — MODEL EXECUTION & CLAIM REPRODUCTION AUDIT, Command (+1 more)

### Community 3 - "train_unet.py"
Cohesion: 0.07
Nodes (27): Dataset, calculate_empirical_class_weights(), CombinedFocalDiceLoss, compute_metrics(), download_and_extract_satellite_dataset(), FocalLoss, MultiClassDiceLoss, _organize_dataset_directory() (+19 more)

### Community 4 - "Path"
Cohesion: 0.08
Nodes (20): get_detector(), Sliding-window overlapping tile inference with 2D Gaussian weight blending.…, Run high-precision oil spill detection on a SAR scene: 1. Sliding-window tiled…, 2D Gaussian kernel for seamless blending of overlapping tiles., Test-Time Augmentation (TTA): Evaluates the patch across 4 geometric transforms…, SpillDetector, UNet, DriftSimulator (+12 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (33): axios, d3-geo, @fontsource/barlow-condensed, @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, framer-motion, dependencies, axios (+25 more)

### Community 6 - "Oil Spill Detection & Vessel Attribution System"
Cohesion: 0.07
Nodes (24): Coordinates Reference, Data Requirements (all pre-cached for offline demo), Demo Scenario — Mumbai / Arabian Sea Coast, Region, Scenario Narrative (for demo), Sentinel-1 Scene Selection Criteria, 1. High-Level Pipeline, 2. Module-by-Module Workflow (+16 more)

### Community 7 - "LiveAISManager"
Cohesion: 0.09
Nodes (13): LiveAISManager, Live AIS Ingestion & Rolling History Buffer — AISStream.io Integration Streams…, Start the background ingestion listener thread if not already running., Stop background ingestion., Worker thread running the asyncio websocket loop., Connect to AISStream.io and buffer incoming position reports., Persist a batch of pings to SQLite and prune pings > 24 hours old., Return the most recent live vessel positions (within last 30 minutes).… (+5 more)

### Community 8 - "package.json"
Cohesion: 0.10
Nodes (20): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react, name, private (+12 more)

### Community 9 - "GlobeHero3D.jsx"
Cohesion: 0.22
Nodes (16): Globe(), latLngToPosition(), mapDensityUiToSpacing(), mapDetailToStepSize(), mapDotSizeUiToMultiplier(), mapDragSpeedUiToSensitivity(), mapLinear(), mapMarkerDotSizeUiToMultiplier() (+8 more)

### Community 10 - "5. PHASE 4 — DATA FILE AUTHENTICITY AUDIT"
Cohesion: 0.22
Nodes (9): 1. `data/currents/demo_currents.nc` (2.75 MB), 2. `data/wind/demo_wind.nc` (446 KB), 5.1 AIS Parquet File Verification, 5.2 Demo Cache Generation Code Analysis (`scripts/generate_demo_cache.py`), 5.3 NetCDF Environmental Datasets, 5. PHASE 4 — DATA FILE AUTHENTICITY AUDIT, Command, Literal Output (+1 more)

### Community 11 - "Product Requirements Document (PRD)"
Cohesion: 0.12
Nodes (17): 10. Risks & Assumptions, 11. Out of Scope (for hackathon MVP), 1. Problem Summary, 2. Goals & Success Criteria, 3. Users & Stakeholders, 4. Functional Requirements, 5. Non-Functional Requirements, 6. Data Sources (+9 more)

### Community 12 - "Build Guide — Step by Step"
Cohesion: 0.13
Nodes (15): 1a. SAR Training Data, 1b. Live/Archival SAR Scenes, 1c. Environmental Data, 1d. AIS Data, Build Guide — Step by Step, Notes for Using This With Antigravity / an AI Coding Agent, Phase 0 — Project Setup, Phase 1 — Data Acquisition (+7 more)

### Community 13 - "SLICKWATCH — Maritime Forensics Instrumentation Platform"
Cohesion: 0.13
Nodes (14): 1. Design Language & The Three Material Families, 2. Design Tokens (`src/design/tokens.css`), 3. Skeuomorphic UI Primitives (`src/components/primitives/`), 4. React Bits Custom Implementations, 4px Spacing Grid, 5. Console Keyboard Navigation, 6. Verification & Constraint Auditing, A. Metal (Panels, Bars, Controls) (+6 more)

### Community 14 - "🎤 Demo Flow (5 minutes)"
Cohesion: 0.20
Nodes (9): 🆘 Backup: If Something Breaks, Closing (1 min), 🎤 Demo Flow (5 minutes), 🎬 Demo Script — Oil Spill Detection & Vessel Attribution System, 📂 Key Files to Reference During Q&A, Live Demo: Click "Run Analysis" (3 min), Pre-Demo Checklist, Slide 1: Problem Statement (30 sec) (+1 more)

### Community 15 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 16 - "PROJECT CONTEXT: SWACHH TRACK — MARINE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM"
Cohesion: 0.25
Nodes (7): 13. Project Glossary & Acronyms, 14. Unresolved Questions & External Dependencies, 1. Executive Summary, 2. Architecture Diagram, 3. Tech Stack, 4. Repo Map, PROJECT CONTEXT: SWACHH TRACK — MARINE OIL SPILL DETECTION & VESSEL ATTRIBUTION SYSTEM

### Community 17 - "Complete File Manifest"
Cohesion: 0.07
Nodes (27): Backend, Backend Layer (Python) — 10 files, ~2,871 lines, Backend (Python), Complete File Manifest, Configuration Layer — 5 files, Data Layer (non-source), Docker, Documentation Layer — 6 files, ~1,500 lines (estimated) (+19 more)

### Community 18 - "10. Key Code Snippets"
Cohesion: 0.29
Nodes (7): 10. Key Code Snippets, Snippet 1: U-Net Model Forward Pass & Polygon Extraction, Snippet 2: OpenDrift Model Seeding & Simulation Execution, Snippet 3: Explainable Suspicion Scoring Engine, Snippet 4: DuckDB Parquet Extraction with Anomaly Analysis, Snippet 5: Live AISStream WebSocket Listener with SQLite WAL Flushes, Snippet 6: MARPOL Annex I Forensic Report Generator

### Community 19 - "11. How to Run"
Cohesion: 0.29
Nodes (7): 11.1 Prerequisites, 11.2 Environment Configuration, 11.3 Local Backend Execution, 11.4 Local Frontend Execution, 11.5 Full Containerized Deployment (Docker Compose), 11.6 Reproducing Model Training & Cache Generation, 11. How to Run

### Community 20 - "6. Backend Services & Endpoint Specifications"
Cohesion: 0.29
Nodes (7): 1. Live AIS Buffer Database (`SQLite3`), 2. Archive AIS Telemetry Dataset (`DuckDB` over Parquet), 6.1 Server Architecture, 6.2 Complete Backend API Route Directory, 6.3 Database Schemas & Storage Engines, 6.4 Third-Party Integrations, 6. Backend Services & Endpoint Specifications

### Community 21 - "7. Machine Learning Pipeline & Hydrodynamic Simulation"
Cohesion: 0.29
Nodes (7): 7.1 Problem Specification, 7.2 Exact Model Definition (`backend/detection/detector.py` & `models/train_unet.py`), 7.3 Model Weights & Checkpoint Properties, 7.4 Preprocessing & Vector Extraction Pipeline (`backend/detection/detector.py`), 7.5 Hydrodynamic Trajectory Simulation (`backend/drift/drifter.py`), 7.6 Forensic Vessel Attribution Engine (`backend/attribution/analyzer.py`), 7. Machine Learning Pipeline & Hydrodynamic Simulation

### Community 22 - "download_data.py"
Cohesion: 0.52
Nodes (6): download_ais_reference(), download_cds_wind(), download_cmems_currents(), main(), setup_directories(), verify_credentials()

### Community 23 - "5. Frontend Architecture & API Consumption"
Cohesion: 0.40
Nodes (5): 5.1 Technology & Styling, 5.2 Application View States & Routing, 5.3 Complete Table of Frontend API Calls, 5.4 Environment Configuration & Security, 5. Frontend Architecture & API Consumption

### Community 24 - "8. Data Inventory & Specifications"
Cohesion: 0.50
Nodes (4): 8.1 File Inventory, 8.2 Tabular Data Sample (`data/ais/reference/marinecadastre_sample.csv`), 8.3 SAR Raster Image Specifications, 8. Data Inventory & Specifications

### Community 25 - "9. Benchmarks & Evaluation Results"
Cohesion: 0.50
Nodes (4): 9.1 Evaluation Results Audit, 9.2 Statically Verified Scene Detections (`data/sar/demo/scenes_index.json`), 9.3 System Latency & Performance Goals (from PRD), 9. Benchmarks & Evaluation Results

### Community 26 - "12. Current State & Codebase Health"
Cohesion: 0.67
Nodes (3): 12.1 Fully Functional & Integrated Systems, 12.2 Known Gaps & Unfinished Wiring, 12. Current State & Codebase Health

### Community 27 - "Audit Batch Plan"
Cohesion: 0.11
Nodes (19): Audit Batch Plan, **B01: Core Backend Infrastructure** (DONE in this inventory), **B02: Detection Module (U-Net Inference)**, **B03: Drift Module (OpenDrift)**, **B04: Attribution Module (Vessel Scoring)**, **B05: Live AIS Integration**, **B06: Model Training Pipeline**, **B07: Data Acquisition Scripts** (+11 more)

### Community 41 - "6. PHASE 5 — PIPELINE TRUTH TEST"
Cohesion: 0.22
Nodes (9): 6.1 Live API Server Execution, 6.2 Endpoint Analysis, 6.3 Frontend Honesty & Deception Audit, 6.4 Internal Contradiction: Age Heuristic, 6. PHASE 5 — PIPELINE TRUTH TEST, Code Quoted from `backend/detection/detector.py:153-158`:, Command, Literal Output (+1 more)

### Community 42 - "MEDIUM / P2"
Cohesion: 0.11
Nodes (18): AUDIT FINDINGS — Oil Spill Detection & Vessel Attribution System, CRITICAL / P0, [F-001] — Hardcoded Live AISStream API Token Committed in Source Code, [F-002] — Zip Slip Arbitrary File Extraction Vulnerability in Dataset Loader, [F-003] — AIS Vessel GPS Coordinates and Timestamps Are Fabricated in Parquet Query Engine, [F-004] — Arbitrary File Upload via Detection Endpoint Without Validation or Size Cap, [F-005] — Path Traversal Risk in Detection `scene_id` Parameter, [F-006] — Race Condition and Unlocked Global Mutable Cache in Attribution Reports (+10 more)

### Community 43 - "GLOBAL CODEBASE AUDIT REPORT"
Cohesion: 0.13
Nodes (14): 1. Executive Verdict, 2. Domain Scorecard, 3. Findings Summary, 4. Top 10 Fixes Ranked by (Impact ÷ Effort), 5. Remediation Plan, 6. What's Genuinely Good, 7. Hypotheses Requiring Verification, 8. Audit Coverage Statement (+6 more)

### Community 44 - "AttributionAnalyzer"
Cohesion: 0.20
Nodes (7): AttributionAnalyzer, get_analyzer(), Generate realistic maritime fairway transit corridor traffic around the origin…, Query vessels from: 1. Live AISStream.io rolling buffer (first priority) 2.…, Query real vessels from the live AISStream rolling SQLite database. Returns…, Calculate an explainable suspicion score (0-100) for a vessel using spatial…, Main pipeline to rank suspects based on the origin window.

### Community 45 - "3. Threat Model — Trust Boundaries"
Cohesion: 0.25
Nodes (7): 1. End-to-End Flow 1: Detection → Drift → Attribution Pipeline, 2. End-to-End Flow 2: Live AIS Ingestion & Replay, 3. Threat Model — Trust Boundaries, AUDIT FLOWS — End-to-End Traces & Threat Model, Boundary 1: Browser ↔ API (`http://localhost:8000`), Boundary 2: API ↔ Third-Party WebServices (AISStream.io), Boundary 3: Dataset Ingestion / Model Training

### Community 46 - "SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT"
Cohesion: 0.25
Nodes (7): 10. SELF-AUDIT DECLARATION, 1. ENVIRONMENT & FORENSIC BASELINE (STEP 0), 7. COMPREHENSIVE RECONCILIATION TABLE, 9. CANNOT VERIFY LIST, Execution Command, Literal Output, SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT

### Community 47 - "2. PHASE 1 — WEIGHTS & ARCHITECTURE FORENSICS"
Cohesion: 0.25
Nodes (8): 2.1 State Dict & Tensor Counts, 2.4 Git History & Training Logs Audit, 2. PHASE 1 — WEIGHTS & ARCHITECTURE FORENSICS, Command, Commands & Outputs, Finding: Claim of "106 Parameter Tensors" is REFUTED, Finding: Claims of "F1 = 0.91" and "Trained on Sentinel-1 SAR" are REFUTED, Literal Output

### Community 48 - "AUDIT FINDINGS"
Cohesion: 0.29
Nodes (6): AUDIT FINDINGS, CRITICAL / P0, HIGH / P1, INFO, LOW / P3, MEDIUM / P2

### Community 49 - "CODEBASE METRICS & COMPLEXITY HOTSPOTS"
Cohesion: 0.33
Nodes (5): 1. Lines of Code by Layer, 2. Top Complexity Hotspots (Functions / Modules), 3. Duplication Clusters, 4. Dependencies & Security Audit Summary, CODEBASE METRICS & COMPLEXITY HOTSPOTS

### Community 50 - "8. TOP REFUTED / SUSPECT CLAIMS (RANKED BY SEVERITY)"
Cohesion: 0.33
Nodes (6): 8. TOP REFUTED / SUSPECT CLAIMS (RANKED BY SEVERITY), Rank 1: Falsified "4-Class Semantic Segmentation" Model (Critical Severity), Rank 2: Fabricated Performance Metrics & Training Heritage (High Severity), Rank 3: Phantom 7.28M AIS Dataset & Deceptive UI Fallbacks (High Severity), Rank 4: Hardcoded Demo Cache Presented as Pipeline Output (Medium Severity), Rank 5: Inverted Age-Elongation Classification Heuristic (Medium Severity)

### Community 51 - "2.3 Training Data Forensics (`notebooks/train_unet.ipynb` & `models/train_unet.py`)"
Cohesion: 0.40
Nodes (5): 2.3 Training Data Forensics (`notebooks/train_unet.ipynb` & `models/train_unet.py`), Command, Critical Forensic Verdicts:, Literal Output, Training Data Generation Code Quoted Verbatim (`models/train_unet.py:47-72`):

### Community 52 - "3.1 Raster File Integrity & Metadata"
Cohesion: 0.40
Nodes (5): 3.1 Raster File Integrity & Metadata, 3. PHASE 2 — SAR SCENE AUTHENTICITY AUDIT, Command, Evidence Findings:, Measured File Metrics

### Community 53 - "AUDIT LEDGER"
Cohesion: 0.50
Nodes (3): AUDIT LEDGER, Batch Status Tracker, Phase Tracking

### Community 54 - "2.2 Architecture Comparison & Weight Loading Mechanism"
Cohesion: 0.50
Nodes (4): 2.2 Architecture Comparison & Weight Loading Mechanism, Command, Output Snippet, Production Weight Loading Code in `backend/detection/detector.py`:

## Knowledge Gaps
- **263 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `GlobeHero3D.jsx`, `.oxlintrc.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `download_and_extract_satellite_dataset()` connect `train_unet.py` to `Path`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT` connect `SWACHH TRACK // ADVERSARIAL MODEL & CLAIMS AUDIT REPORT` to `4. PHASE 3 — MODEL EXECUTION & CLAIM REPRODUCTION AUDIT`, `6. PHASE 5 — PIPELINE TRUTH TEST`, `5. PHASE 4 — DATA FILE AUTHENTICITY AUDIT`, `2. PHASE 1 — WEIGHTS & ARCHITECTURE FORENSICS`, `8. TOP REFUTED / SUSPECT CLAIMS (RANKED BY SEVERITY)`, `3.1 Raster File Integrity & Metadata`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07033248081841433 - nodes in this community are weakly interconnected._
- **Should `attribution/router.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06090808416389812 - nodes in this community are weakly interconnected._
- **Should `train_unet.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06852497096399536 - nodes in this community are weakly interconnected._