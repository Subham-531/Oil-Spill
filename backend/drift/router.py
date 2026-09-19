"""
Drift Module Router — Module B (OpenDrift)
Handles backward hindcast (origin estimation) and forward forecast.
Uses the OpenOil model from OpenDrift with CMEMS currents + ERA5 wind.
Implemented in Phase 3.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional


class DriftRequest(BaseModel):
    """Request body for drift simulation."""

    spill_polygon_geojson: dict  # GeoJSON polygon from detection
    detection_timestamp: str  # ISO 8601 timestamp
    hindcast_hours: int = 72  # How far back to trace (default 72h)
    forecast_hours: int = 48  # How far forward to predict (default 48h)


router = APIRouter()


@router.post("/")
async def run_drift(request: DriftRequest):
    """
    Run backward and forward OpenDrift simulations.

    Takes a detected spill polygon and runs:
      1. Backward hindcast (-72h) to find the origin window
      2. Forward forecast (+72h) to predict where the oil will go

    Returns:
        GeoJSON trajectories for both hindcast and forecast.
    """
    from backend.drift.drifter import get_drifter
    
    try:
        drifter = get_drifter()
        
        # Clamp simulation duration to available NetCDF temporal extent (6-24 hours)
        h_hours = max(3, min(request.hindcast_hours, 24))
        f_hours = max(3, min(request.forecast_hours, 24))

        # 1. Run Backward Hindcast
        hindcast_results = drifter.run_simulation(
            spill_polygon_geojson=request.spill_polygon_geojson,
            detection_timestamp=request.detection_timestamp,
            backward=True,
            hours=h_hours
        )
        
        # 2. Run Forward Forecast
        forecast_results = drifter.run_simulation(
            spill_polygon_geojson=request.spill_polygon_geojson,
            detection_timestamp=request.detection_timestamp,
            backward=False,
            hours=f_hours
        )
        
        # Merge results
        fallback_applied = hindcast_results.get("date_fallback_applied") or forecast_results.get("date_fallback_applied", False)
        response = {
            "origin_estimate": hindcast_results.get("origin_estimate"),
            "hindcast_track": hindcast_results.get("hindcast_track"),
            "forecast_track": forecast_results.get("forecast_track"),
            "warning": (
                "Requested timestamp outside NetCDF dataset coverage (Jan 14-16, 2024). "
                "Simulated using January 15, 2024 environmental forcing baseline."
            ) if fallback_applied else None
        }
        
        return response
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
