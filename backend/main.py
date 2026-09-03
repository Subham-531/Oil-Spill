"""
Oil Spill Detection & Vessel Attribution System — FastAPI Backend
SIH PS #26143 | NTRO

Entry point for the backend API server.
Modules are registered as routers and implemented phase-by-phase.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.detection.router import router as detection_router
from backend.drift.router import router as drift_router
from backend.attribution.router import router as attribution_router

# ---------------------------------------------------------------------------
# App initialization
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Swachh Track — Marine Oil Spill Detection & Vessel Attribution System",
    description=(
        "SIH PS #26143 — Detects oil spills from SAR imagery, "
        "hindcasts/forecasts drift using OpenDrift, and attributes "
        "spills to suspect vessels via AIS analysis with explainable scoring."
    ),
    version="0.1.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Module routers
# ---------------------------------------------------------------------------

app.include_router(detection_router, prefix="/api/detect", tags=["Detection"])
app.include_router(drift_router, prefix="/api/drift", tags=["Drift"])
app.include_router(attribution_router, prefix="/api/attribute", tags=["Attribution"])

# ---------------------------------------------------------------------------
# Health check & demo cache
# ---------------------------------------------------------------------------

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEMO_CACHE_DIR = os.path.join(DATA_DIR, "demo_cache")


@app.get("/api/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "service": "oil-spill-detection",
        "version": "0.1.0",
    }


@app.get("/api/demo/cached")
async def get_demo_cached():
    """
    Return pre-cached demo results for instant presentation.
    This endpoint loads pre-computed results so the demo never
    depends on live computation or network calls.
    """
    import json

    cached_files = {
        "detection": os.path.join(DEMO_CACHE_DIR, "detection_result.json"),
        "drift": os.path.join(DEMO_CACHE_DIR, "drift_result.json"),
        "attribution": os.path.join(DEMO_CACHE_DIR, "attribution_result.json"),
    }

    results = {}
    for module, path in cached_files.items():
        if os.path.exists(path):
            with open(path, "r") as f:
                results[module] = json.load(f)
        else:
            results[module] = None

    return {
        "cached": all(v is not None for v in results.values()),
        "results": results,
    }


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
