# 🎬 Demo Script — Oil Spill Detection & Vessel Attribution System

## Pre-Demo Checklist
- [ ] `python3 scripts/generate_demo_cache.py` has been run (verify `data/demo_cache/` has 3 JSON files)
- [ ] Backend is running: `http://localhost:8000/api/health` returns `{"status": "ok"}`
- [ ] Frontend is running: `http://localhost:5173` loads the dark map
- [ ] Browser is in full-screen mode (F11 / Cmd+Ctrl+F)
- [ ] Have this script open on a second screen or printed

---

## 🎤 Demo Flow (5 minutes)

### Slide 1: Problem Statement (30 sec)
> "India's coastline—7,500 km—is constantly threatened by illegal oil discharges from vessels. 
> The current detection process is manual, slow, and by the time a spill is identified, 
> the responsible vessel is long gone. Our system automates the entire pipeline."

### Slide 2: Architecture (30 sec)
> "We built a 4-module pipeline:
> 1. **Module A** — U-Net segmentation on Sentinel-1 SAR imagery to detect spills
> 2. **Module B** — OpenDrift physics model to trace where the oil came from
> 3. **Module C** — AIS vessel tracking to identify the culprit
> 4. **Module D** — Real-time dashboard for coast guard operators"

### Live Demo: Click "Run Analysis" (3 min)

**Step 1** — Click the orange "Run Analysis" button in the top right.

> "Watch the pipeline stages on the left. First, we scan the SAR scene..."

*[Wait for the red spill polygon to appear on the map]*

> "A 12.4 km² spill has been detected west of Mumbai with 92% confidence. 
> Notice the 3.1 elongation ratio — this tells us the spill is 'fresh', 
> less than 6 hours old, which is critical for the cleanup response."

*[Wait for the purple hindcast to appear]*

> "Now OpenDrift runs backward — using CMEMS ocean currents and ERA5 wind data 
> — to trace where this oil was 24 hours ago. The purple polygon is the 
> **origin window**: not a single point, but a probability area."

*[Wait for the AIS tracks to appear]*

> "Finally, we cross-reference AIS vessel tracks against that origin window. 
> Our scoring engine uses three weighted heuristics — spatial proximity, 
> temporal alignment, and vessel type — to rank suspects."

**Step 2** — Click on the top-ranked vessel "STEALTH VOYAGER" in the sidebar.

> "STEALTH VOYAGER scores 94/100. Click to expand — you can see each sub-score 
> is individually visible and auditable. This is **explainable AI**: every score 
> can be challenged in a maritime tribunal."

**Step 3** — Use the Timeline Slider at the bottom.

> "The timeline slider lets you scrub forward in time to see the 24-hour 
> forecast of where this spill will drift — essential for deploying cleanup 
> booms and skimmer vessels ahead of the slick."

### Closing (1 min)

> "Key innovations:
> 1. **Origin as a window, not a point** — accounts for real ocean uncertainty
> 2. **Planted ground truth** — our synthetic AIS always validates the #1 suspect
> 3. **Fully offline demo** — all data is pre-cached, no network dependency
> 4. **Explainable scoring** — each sub-score is independently auditable
> 
> This system can be deployed at NTRO or Indian Coast Guard operations centers 
> to reduce spill response time from days to hours."

---

## 🆘 Backup: If Something Breaks

| Problem | Fix |
|---|---|
| Backend not responding | `source .venv/bin/activate && PYTHONPATH=. uvicorn backend.main:app --port 8000` |
| Frontend not loading | `cd frontend && npx vite --port 5173` |
| "No cached data" error | `python3 scripts/generate_demo_cache.py` |
| Map tiles not loading | The CARTO dark tiles require internet. Use mobile hotspot as backup. |
| Ports in use | `lsof -ti:8000 | xargs kill -9; lsof -ti:5173 | xargs kill -9` |

---

## 📂 Key Files to Reference During Q&A

| Question | File |
|---|---|
| "How does the U-Net work?" | `backend/detection/detector.py` |
| "What physics model do you use?" | `backend/drift/drifter.py` (OpenDrift) |
| "How is the scoring calculated?" | `backend/attribution/analyzer.py` |
| "What data do you use?" | `data/demo_cache/` (pre-computed) |
| "Can this work with real AIS data?" | Yes — swap `generate_synthetic_ais()` with MarineCadastre CSV ingestion |
