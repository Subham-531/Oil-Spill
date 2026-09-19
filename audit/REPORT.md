# GLOBAL CODEBASE AUDIT REPORT
**Project:** Swachh Track — Marine Oil Spill Detection & Vessel Attribution System  
**Repository Commit:** `bfe6d63a457901550b291c4292e04b6e3420a380`  
**Branch:** `main`  
**Audit Date:** 2026-09-18

---

## 1. Executive Verdict

Swachh Track is an impressively structured end-to-end prototype combining PyTorch SAR segmentation, OpenDrift Eulerian-Lagrangian drift modeling, and DuckDB/SQLite AIS vessel attribution into a clean React console. However, in its current state, **it is NOT shippable to production for operational or legal enforcement use**. The single biggest risk is the **fabrication of vessel coordinates during DuckDB AIS attribution ([F-003])**, combined with a **hardcoded live API credential committed in source code ([F-001])** and a **Zip Slip file extraction vulnerability ([F-002])**. Addressing these core vulnerabilities will transition this system from a demonstration platform to a production-grade, legally admissible maritime enforcement solution.

---

## 2. Domain Scorecard

| Domain | Score (1-5) | Justification |
|--------|-------------|---------------|
| **Security** | 2/5 | Hardcoded API key in repo ([F-001]), Zip Slip extraction ([F-002]), arbitrary file upload ([F-004]). |
| **Correctness** | 2/5 | Fabricated vessel coordinates in DuckDB reader ([F-003]), hardcoded date override ([F-007]). |
| **Architecture** | 4/5 | Clean 3-tier modular division (Detection, Drift, Attribution) with solid REST endpoints. |
| **API Design** | 4/5 | Well-structured FastAPI routes returning GeoJSON standards with clean error responses. |
| **Data Layer** | 3/5 | Effective SQLite WAL rolling buffer and DuckDB integration, but synthetic fallback leaks into production path. |
| **Frontend** | 4/5 | High-quality React/Leaflet dashboard with offline simulation fallback and retro-futuristic primitives. |
| **Testing** | 1/5 | No automated test suite (pytest/jest); relies entirely on manual E2E test scripts. |
| **CI/CD & Infra** | 3/5 | Functional multi-stage Docker Compose setup, but containers run as root and dependencies are unpinned. |
| **Observability** | 3/5 | Basic health check and Loguru logging configured, but missing metrics and structured tracing. |
| **Maintainability**| 3/5 | Readable, well-commented code, but contains dead code (`preprocess`) and duplicated fallback logic. |
| **Performance** | 3/5 | Fast DuckDB and SQLite queries, but `rasterize()` in loop ([F-009]) introduces polygon processing lag. |
| **Documentation** | 5/5 | Outstanding PRD, Workflow, Build Guide, and demo scenario documentation. |

---

## 3. Findings Summary

- **Total Findings:** 13
- **CRITICAL / P0:** 2
- **HIGH / P1:** 4
- **MEDIUM / P2:** 5
- **LOW / P3:** 2

### Critical (P0) & High (P1) Findings Table

| ID | Severity | Category | Location | Summary | Effort |
|----|----------|----------|----------|---------|--------|
| **F-001** | P0 / CRITICAL | Security | `backend/attribution/live_ais.py:39` | Hardcoded live AISStream API token committed in source code | S (<1h) |
| **F-002** | P0 / CRITICAL | Security | `models/train_unet.py:126` | Zip Slip arbitrary file extraction vulnerability in dataset loader | S (<1h) |
| **F-003** | P1 / HIGH | Correctness | `backend/attribution/analyzer.py:285` | AIS vessel GPS coordinates and timestamps are fabricated in DuckDB query engine | M (1h–1d) |
| **F-004** | P1 / HIGH | Security | `backend/detection/router.py:49` | Arbitrary file upload via detection endpoint without validation or size cap | S (<1h) |
| **F-005** | P1 / HIGH | Security | `backend/detection/router.py:54` | Path traversal risk in detection `scene_id` query parameter | S (<1h) |
| **F-006** | P1 / HIGH | Correctness | `backend/attribution/router.py:28` | Race condition and unlocked global mutable cache in attribution PDF reports | S (<1h) |

---

## 4. Top 10 Fixes Ranked by (Impact ÷ Effort)

1. **Fix F-001 (Hardcoded API Key):** Remove committed API token string; require `AISSTREAM_API_KEY` from environment. *(Impact: High, Effort: 5 mins)*
2. **Fix F-002 (Zip Slip Vulnerability):** Add `os.path.commonpath` verification before ZIP extraction. *(Impact: High, Effort: 10 mins)*
3. **Fix F-006 (PDF Report Race Condition):** Key report cache by incident ID or session instead of global variable. *(Impact: High, Effort: 15 mins)*
4. **Fix F-005 (Path Traversal in `scene_id`):** Sanitize input with `os.path.basename(scene_id)`. *(Impact: High, Effort: 10 mins)*
5. **Fix F-004 (File Upload Validation):** Enforce size limit and TIFF header check on POST `/api/detect/`. *(Impact: High, Effort: 20 mins)*
6. **Fix F-007 (Hardcoded Date Override):** Surface warning/error when environmental data date range is missing rather than substituting Jan 2024. *(Impact: Medium, Effort: 15 mins)*
7. **Fix F-010 (Degenerate Polygon Crash):** Add `hasattr(rect, 'exterior')` check in detector. *(Impact: Medium, Effort: 10 mins)*
8. **Fix F-003 (True Historical AIS Coordinates):** Extract actual `LAT`, `LON`, `BaseDateTime` from DuckDB Parquet. *(Impact: Very High, Effort: 3 hours)*
9. **Fix F-008 (Global Percentile Normalization):** Compute scene-level 1st/99th percentiles once before tiled prediction. *(Impact: Medium, Effort: 30 mins)*
10. **Fix F-009 (Rasterization Bottleneck):** Crop rasterization window to polygon bounding box. *(Impact: Medium, Effort: 30 mins)*

---

## 5. Remediation Plan

### Stop the Bleeding (Today)
- Revoke and rotate the exposed AISStream API key ([F-001]).
- Apply Zip Slip path validation patch in `models/train_unet.py` ([F-002]).
- Sanitize `scene_id` parameter and add file upload size limits in `backend/detection/router.py` ([F-004], [F-005]).

### This Week
- Update DuckDB AIS query to read real `LAT`/`LON` coordinates from MarineCadastre Parquet ([F-003]).
- Replace global `LATEST_ATTRIBUTION_CACHE` with incident-keyed dictionary or session store ([F-006]).
- Add global scene percentile normalization in `detector.py` ([F-008]).

### This Month
- Implement automated test suite (`pytest`) covering API routes and ML pipeline.
- Pin dependency versions in `backend/requirements.txt` and `frontend/package.json` ([F-011]).
- Add non-root `USER` directive to Dockerfiles and configure health checks.

### Structural / Next Quarter
- Implement OAuth2 / JWT authentication on API endpoints.
- Set up automated CI/CD pipeline (GitHub Actions) with linter, test runner, and security scanning (Bandit, Trivy).

---

## 6. What's Genuinely Good

1. **Principled Domain Architecture:** Clear separation of concerns between Module A (SAR Segmentation), Module B (OpenDrift Drift Engine), and Module C (AIS Attribution).
2. **Robust Offline Demo Fallbacks:** The UI and backend seamlessly fall back to pre-computed demo cache results if live environmental models or APIs are unreachable, ensuring flawless presentations.
3. **Advanced ML Pipeline:** Inclusion of Test-Time Augmentation (TTA) and 2D Gaussian weight blending in tiled U-Net inference (`detector.py`) preserves SAR resolution across arbitrary swath sizes.
4. **Adherence to International Conventions:** Volumetric oil spill calculations incorporate the official Bonn Agreement oil appearance codes (Code 2 Sheen / Code 3 Metallic).
5. **Outstanding UI & Design Tokens:** Industrial/tactical React dashboard with custom canvas shaders, Leaflet integration, and interactive timeline controls.

---

## 7. Hypotheses Requiring Verification

1. **Hypothesis 1:** OpenDrift native execution with GDAL/Conda bindings works when installed in a full Linux Conda environment.  
   *Check:* Verify OpenDrift execution on a Linux instance with `conda install -c conda-forge opendrift`.
2. **Hypothesis 2:** Live AISStream.io WebSocket ingestion maintains long-term stability without memory leaks during multi-day continuous streaming.  
   *Check:* Run `live_ais.py` background ingestion for 24 hours under a memory profiler (`tracemalloc`).

---

## 8. Audit Coverage Statement

- **Files Audited:** 75+ files (100% of non-skipped codebase source files).
- **Batches Completed:** 18 / 18 batches completed in `LEDGER.md`.
- **Skipped Files:** Binary imagery (.tif, .png), model weights (.pt), SQLite databases (.db), and `node_modules/` (listed explicitly in `audit/00-inventory.md`).
- **Unmodified Source Files:** 0 source files outside `audit/` were modified. (`git status` verified).
