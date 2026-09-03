# Oil Spill Detection & Vessel Attribution System
### SIH Problem Statement #26143 — National Technical Research Organisation (NTRO)

An end-to-end system that **detects** oil spills from Sentinel-1 SAR imagery, **traces** them backward to their origin using ocean drift simulation, and **attributes** them to suspect vessels using AIS data with explainable scoring.

---

## Architecture

```
Sentinel-1 SAR → Detection (U-Net, 4-class) → Spill Polygon
                                                    │
              CMEMS Currents + ERA5 Wind → OpenDrift (OpenOil)
                                                    │
                                    ┌───────────────┴───────────────┐
                              Backward Hindcast              Forward Forecast
                              (Origin Window)                (Future Spread)
                                    │
                 AIS Data → Track Reconstruction → Spatio-Temporal Filter
                                    │
                          Suspect Scoring & Ranking
                          (Explainable Sub-Scores)
                                    │
                             Dashboard / Report
```

## Key Technical Choices

| Feature | Choice | Rationale |
|---|---|---|
| Segmentation | 4-class (sea/spill/lookalike/ship) | Lookalike class prevents false-positive flood |
| Drift engine | OpenDrift (OpenOil module) | Peer-reviewed, used by real spill-response agencies |
| Origin estimate | Spatial window + time range | Single-point would be scientifically dishonest |
| Attribution | Explainable composite score | Required for evidentiary use; black-box is unacceptable |
| Demo mode | Fully offline/pre-cached | No dependency on API uptime during demo |

## Quick Start

```bash
# 1. Clone and set up environment
cp .env.example .env
# Fill in your Copernicus credentials in .env

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload

# 3. Frontend
cd frontend
npm install
npm run dev

# 4. Or use Docker Compose
docker-compose up --build
```

## Project Structure

```
├── backend/                 # FastAPI application
│   ├── detection/           # Module A — SAR segmentation & polygon extraction
│   ├── drift/               # Module B — OpenDrift hindcast/forecast
│   ├── attribution/         # Module C — AIS filtering & scoring
│   └── main.py              # App entry point
├── frontend/                # React + Leaflet dashboard
├── data/                    # Cached datasets (not committed)
├── models/                  # Trained model weights (not committed)
├── notebooks/               # Training & exploration notebooks
├── scripts/                 # Data download & AIS generation utilities
├── docs/                    # PRD, workflow, demo scenario
└── docker-compose.yml
```

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — Product requirements
- [`docs/WORKFLOW.md`](docs/WORKFLOW.md) — Pipeline architecture
- [`docs/BUILD_GUIDE.md`](docs/BUILD_GUIDE.md) — Phase-by-phase build guide
- [`docs/demo_scenario.md`](docs/demo_scenario.md) — Demo region & scenario

## License

For hackathon / educational use. SIH 2024 submission.
