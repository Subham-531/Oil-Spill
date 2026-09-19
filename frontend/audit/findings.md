# AUDIT FINDINGS — Oil Spill Detection & Vessel Attribution System

**All findings are verified against codebase line references.**

---

## CRITICAL / P0

### [F-001] — Hardcoded Live AISStream API Token Committed in Source Code
- **Severity:** P0 / CRITICAL
- **Category:** Security → Secrets Management
- **Location:** `backend/attribution/live_ais.py:39-41`
- **Confidence:** HIGH

**Evidence**
```python
// backend/attribution/live_ais.py:39
self.api_key = os.getenv(
    "AISSTREAM_API_KEY", "645213e4c0454c7c95c9a952579d68eb520d8a37"
)
```

**What's wrong:** A live third-party API authentication key for AISStream.io is committed directly into the source code as a default fallback value.

**Impact:** Exposing active API credentials in source repositories leads to credential theft, quota exhaustion, unauthorized third-party rate consumption, and account suspension by the provider.

**How to reproduce / confirm:** Inspect `backend/attribution/live_ais.py` line 40. Run `python -c "from backend.attribution.live_ais import LiveAISManager; print(LiveAISManager().api_key)"` without setting `AISSTREAM_API_KEY` env var to observe hardcoded key.

**Recommended fix:** Remove hardcoded key string. Fallback to `None` or raise `ValueError("AISSTREAM_API_KEY environment variable required")` if key is not provided in environment.

**Effort:** S (<1h)

---

### [F-002] — Zip Slip Arbitrary File Extraction Vulnerability in Dataset Loader
- **Severity:** P0 / CRITICAL
- **Category:** Security → Deserialization & File Operations
- **Location:** `models/train_unet.py:126-128` (also: `models/train_unet.py:84`)
- **Confidence:** HIGH

**Evidence**
```python
// models/train_unet.py:126
with zipfile.ZipFile(target_zip, 'r') as zf:
    zf.extractall(DATA_DIR)
```

**What's wrong:** `zipfile.ZipFile.extractall()` is called directly on downloaded or local ZIP archives without validating whether archive member file paths escape the destination directory `DATA_DIR`.

**Impact:** A malicious archive containing relative path entries (e.g. `../../etc/cron.d/malicious`) can overwrite arbitrary files on the host filesystem with privileges of the executing process (Zip Slip vulnerability).

**How to reproduce / confirm:** Construct a zip file containing a file named `../test.txt`. Run `train_unet.py` download/extraction pass. Observe `test.txt` extracted outside `DATA_DIR`.

**Recommended fix:** Iterate over archive members and verify `os.path.commonpath([DATA_DIR, os.path.abspath(target_path)]) == os.path.abspath(DATA_DIR)` before extraction.

**Effort:** S (<1h)

---

## HIGH / P1

### [F-003] — AIS Vessel GPS Coordinates and Timestamps Are Fabricated in Parquet Query Engine
- **Severity:** P1 / HIGH
- **Category:** Correctness → Data Integrity & Forensic Accuracy
- **Location:** `backend/attribution/analyzer.py:285-309`
- **Confidence:** HIGH

**Evidence**
```python
// backend/attribution/analyzer.py:285
lat_offset = (((v_hash % 100) - 50) / 50.0) * 0.14   # ±0.14 deg (~±15km)
lon_offset = ((((v_hash // 100) % 100) - 50) / 50.0) * 0.14
time_offset_hrs = (((v_hash // 10000) % 24) - 12) * 0.5  # ±6 hours

for p_idx, p_row in pings.iterrows():
    dt = origin_time + timedelta(hours=time_offset_hrs + ((p_idx - num_pings/2) * 0.35))
    lat = centroid.y + lat_offset + ((p_idx - num_pings/2) * 0.012)
    lon = centroid.x + lon_offset + ((p_idx - num_pings/2) * 0.008)
```

**What's wrong:** The DuckDB archive reader queries real vessel names and MMSIs from the NOAA MarineCadastre dataset, but completely discards their recorded historical `LAT`, `LON`, and `BaseDateTime` values. It synthesizes fake track coordinates and timestamps centered around the spill `centroid`.

**Impact:** The system claims to perform evidentiary vessel attribution against 7.28M historical AIS pings, but attributing vessels against fabricated tracks invalidates forensic authenticity and legal admissibility.

**How to reproduce / confirm:** Inspect `backend/attribution/analyzer.py` lines 285-309. Observe that vessel `pings` extracted from DuckDB on line 271 (`SELECT base_date_time, sog, cog, heading...`) do not use `LAT` or `LON` from the database.

**Recommended fix:** Update DuckDB SQL query to fetch actual `LAT`, `LON`, and `BaseDateTime` columns within the geographic bounding box of `origin_poly` and query real historical tracks.

**Effort:** M (1h–1d)

---

### [F-004] — Arbitrary File Upload via Detection Endpoint Without Validation or Size Cap
- **Severity:** P1 / HIGH
- **Category:** Security → Input Validation & Resource Management
- **Location:** `backend/detection/router.py:49-53`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/router.py:49
if scene_file and scene_file.filename:
    fd, temp_path = tempfile.mkstemp(suffix=".tif")
    with os.fdopen(fd, "wb") as buffer:
        shutil.copyfileobj(scene_file.file, buffer)
    target_scene = temp_path
```

**What's wrong:** POST `/api/detect/` accepts file uploads and writes them directly to temporary files using `shutil.copyfileobj()` without validating MIME type, file extension, or enforcing a maximum file size limit.

**Impact:** Unauthenticated clients can upload multi-gigabyte files causing server disk exhaustion (Denial of Service) or fill temporary storage `/tmp`.

**How to reproduce / confirm:** Send a POST request to `/api/detect/` with a large arbitrary non-image payload. Observe file created in `/tmp` without validation.

**Recommended fix:** Validate MIME type (`image/tiff`, `image/geotiff`), check file extension, enforce maximum upload payload size (e.g., 200MB), and wrap temp file handling in try/finally to guarantee deletion on error.

**Effort:** S (<1h)

---

### [F-005] — Path Traversal Risk in Detection `scene_id` Parameter
- **Severity:** P1 / HIGH
- **Category:** Security → Input Validation
- **Location:** `backend/detection/router.py:54-59`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/router.py:54
elif scene_id:
    candidate = DEMO_DIR / scene_id
    if not candidate.exists():
        candidate = DEMO_DIR / f"{scene_id}.tif"
```

**What's wrong:** The `scene_id` parameter is concatenated directly into path `DEMO_DIR / scene_id` without sanitizing directory traversal sequences (`..`).

**Impact:** Allows clients to probe file existence and potentially pass arbitrary system TIFF files into `rasterio.open()`.

**How to reproduce / confirm:** Call `GET /api/detect/?scene_id=../../../../some_file`. Observe path construction attempting to traverse outside `DEMO_DIR`.

**Recommended fix:** Sanitize `scene_id` with `os.path.basename(scene_id)` or validate `scene_id` against a strict whitelist of known scene IDs from `scenes_index.json`.

**Effort:** S (<1h)

---

### [F-006] — Race Condition and Unlocked Global Mutable Cache in Attribution Reports
- **Severity:** P1 / HIGH
- **Category:** Correctness → Concurrency & Data Leakage
- **Location:** `backend/attribution/router.py:28` (also: `router.py:74, 194`)
- **Confidence:** HIGH

**Evidence**
```python
// backend/attribution/router.py:28
LATEST_ATTRIBUTION_CACHE = []
...
// backend/attribution/router.py:74
LATEST_ATTRIBUTION_CACHE = ranked_suspects
...
// backend/attribution/router.py:194
suspects_to_render = LATEST_ATTRIBUTION_CACHE
```

**What's wrong:** `LATEST_ATTRIBUTION_CACHE` is a single global mutable list modified on POST `/api/attribute/` requests and read during GET `/api/attribute/report/{incident_id}` PDF generation without locking or thread/session isolation.

**Impact:** In multi-user or concurrent scenarios, if User A triggers an attribution analysis and User B triggers another immediately after, User A downloading a PDF report receives User B's suspect list.

**How to reproduce / confirm:** Concurrently issue two POST `/api/attribute/` requests with different inputs, then immediately request GET `/api/attribute/report/1`. Observe that the generated PDF contains results from whichever request executed last.

**Recommended fix:** Store attribution results in a thread-safe cache or database keyed by `incident_id` rather than using a shared global variable.

**Effort:** S (<1h)

---

## MEDIUM / P2

### [F-007] — Hardcoded Temporal Extent Override in Drift Simulation
- **Severity:** P2 / MEDIUM
- **Category:** Correctness → Logic Bug
- **Location:** `backend/drift/drifter.py:140-141`
- **Confidence:** HIGH

**Evidence**
```python
// backend/drift/drifter.py:140
if sim_dt.year != 2024 or sim_dt.month != 1 or not (14 <= sim_dt.day <= 16):
    sim_dt = datetime(2024, 1, 15, 6, 0, 0)
```

**What's wrong:** Any incident timestamp outside Jan 14-16, 2024 is silently overridden to `2024-01-15T06:00:00Z`.

**Impact:** Simulations for non-2024 SAR scenes silently run using January 2024 environmental NetCDF forcing data without notifying the user or returning a warning in the response.

**Recommended fix:** Return a clear warning or error response when environmental NetCDF coverage is unavailable for the requested date, rather than substituting a hardcoded date.

**Effort:** S (<1h)

---

### [F-008] — Per-Patch Percentile Normalization Distorts Uniform SAR Imagery
- **Severity:** P2 / MEDIUM
- **Category:** ML / Model Performance
- **Location:** `backend/detection/detector.py:166-173`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/detector.py:166
p1 = float(np.percentile(patch, 1))
p99 = float(np.percentile(patch, 99))
if p99 > p1:
    patch_norm = np.clip((patch - p1) / (p99 - p1 + 1e-8), 0.0, 1.0)
```

**What's wrong:** Tiled sliding-window prediction computes 1st/99th percentiles per 256x256 patch rather than globally across the full input scene.

**Impact:** Uniform patches containing only dark oil slick or only sea background have narrow intensity dynamic range; local percentile scaling amplifies low-level speckle noise into full-range contrast, triggering false positives or tile boundary seams.

**Recommended fix:** Calculate global 1st and 99th percentiles once across the full scene in `detect_spill()` and pass normalized image patches to `tiled_predict()`.

**Effort:** S (<1h)

---

### [F-009] — O(N * H * W) Rasterization Bottleneck in Polygon Confidence Calculation
- **Severity:** P2 / MEDIUM
- **Category:** Performance → Algorithm Complexity
- **Location:** `backend/detection/detector.py:291-298`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/detector.py:291
for geom, val in shapes(spill_mask, mask=(spill_mask == 1), transform=transform):
    ...
    poly_mask_r = rasterize([(clean_geom, 1)], out_shape=orig_shape, transform=transform, default_value=0, dtype=np.uint8)
```

**What's wrong:** `rasterize()` is re-invoked inside a loop for every detected polygon against the full scene dimensions `orig_shape` (e.g. 4096x4096).

**Impact:** Severe memory allocation overhead and CPU delay when processing scenes with multiple detected slick polygons.

**How to reproduce / confirm:** Process a scene generating 20+ polygons; observe high CPU time spent inside `rasterize()` inside the loop.

**Recommended fix:** Crop rasterization to each polygon's bounding box window or reuse the global `spill_mask` directly.

**Effort:** S (<1h)

---

### [F-010] — Potential Crash on Minimum Rotated Rectangle Exterior Access
- **Severity:** P2 / MEDIUM
- **Category:** Correctness → Exception Handling
- **Location:** `backend/detection/detector.py:273-278`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/detector.py:273
rect = poly_clean.minimum_rotated_rectangle
coords = list(rect.exterior.coords)
```

**What's wrong:** If `poly_clean.minimum_rotated_rectangle` returns a Point or LineString geometry due to simplification, accessing `.exterior` raises an `AttributeError`.

**Impact:** Unhandled exception crashes the detection pipeline with a 500 error when processing small or collinear slick polygons.

**Recommended fix:** Verify `hasattr(rect, 'exterior')` before accessing `.exterior.coords`.

**Effort:** S (<1h)

---

### [F-011] — Unpinned Python and Node Dependencies
- **Severity:** P2 / MEDIUM
- **Category:** Supply Chain & Build Reproducibility
- **Location:** `backend/requirements.txt` & `frontend/package.json`
- **Confidence:** HIGH

**Evidence**
```
// backend/requirements.txt:7
fastapi>=0.104.0
pydantic>=2.5.0
torch>=2.0.0
```

**What's wrong:** Python requirements use unpinned `>=` version constraints without upper bounds or a committed lockfile.

**Impact:** Rebuilding Docker containers in the future may pull incompatible major/minor package versions, causing build breakages or runtime failures.

**Recommended fix:** Commit pinned exact dependency versions in `requirements.txt` or supply `requirements.lock`.

**Effort:** S (<1h)

---

## LOW / P3

### [F-012] — Dead Code: Unused `preprocess()` Method in SpillDetector
- **Severity:** P3 / LOW
- **Category:** Maintainability → Dead Code
- **Location:** `backend/detection/detector.py:82-103`
- **Confidence:** HIGH

**Evidence**
```python
// backend/detection/detector.py:82
def preprocess(self, sar_image_path):
    ...
```

**What's wrong:** `preprocess()` method is defined in `SpillDetector` but never called anywhere in the codebase (`detect_spill()` calls `tiled_predict()` directly).

**Recommended fix:** Remove dead `preprocess()` method or integrate its logic into `detect_spill()`.

**Effort:** S (<1h)

---

### [F-013] — External Dataset Download Over HTTP Without Hash Verification
- **Severity:** P3 / LOW
- **Category:** Security → Supply Chain
- **Location:** `models/train_unet.py:98-101`
- **Confidence:** HIGH

**Evidence**
```python
// models/train_unet.py:98
mirrors = [
    ("https://huggingface.co/datasets/Thadzy/Oilspill/resolve/main/Images.zip", DATA_DIR / "images.zip"),
    ("https://huggingface.co/datasets/Thadzy/Oilspill/resolve/main/Masked.zip", DATA_DIR / "masked.zip")
]
```

**What's wrong:** Downloads external dataset archives from Hugging Face without verifying SHA-256 checksums before unpacking.

**Recommended fix:** Add expected SHA-256 checksum verification before extraction.

**Effort:** S (<1h)
