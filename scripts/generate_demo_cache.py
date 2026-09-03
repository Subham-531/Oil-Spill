"""
Generate pre-cached demo data for the Oil Spill Detection & Attribution dashboard.

This script creates realistic synthetic data for all three modules so the
frontend can render a compelling demo without requiring:
  - A trained U-Net model (Phase 2)
  - OpenDrift + GDAL (Phase 3)
  - Real AIS data (Phase 4)

The generated data matches the exact JSON contracts expected by the frontend
and the /api/demo/cached endpoint.
"""

import json
import math
import random
from pathlib import Path
from datetime import datetime, timedelta

CACHE_DIR = Path("data/demo_cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Demo scenario parameters (from docs/demo_scenario.md)
# ---------------------------------------------------------------------------
SPILL_CENTER_LON = 72.52
SPILL_CENTER_LAT = 19.48
SPILL_TIME = datetime(2024, 1, 15, 6, 0, 0)  # Detection time


def make_ellipse_coords(cx, cy, rx, ry, angle_deg=30, n=32):
    """Generate polygon coordinates for an ellipse."""
    coords = []
    angle_rad = math.radians(angle_deg)
    for i in range(n + 1):
        theta = 2 * math.pi * (i % n) / n
        x = rx * math.cos(theta)
        y = ry * math.sin(theta)
        # Rotate
        xr = x * math.cos(angle_rad) - y * math.sin(angle_rad)
        yr = x * math.sin(angle_rad) + y * math.cos(angle_rad)
        coords.append([round(cx + xr, 6), round(cy + yr, 6)])
    return [coords]


# ---------------------------------------------------------------------------
# 1. Detection Result
# ---------------------------------------------------------------------------
def generate_detection():
    print("  Generating detection result...")
    spill_coords = make_ellipse_coords(
        SPILL_CENTER_LON, SPILL_CENTER_LAT,
        rx=0.025, ry=0.008, angle_deg=35
    )

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": spill_coords
        },
        "properties": {
            "area_km2": 12.4,
            "centroid": [SPILL_CENTER_LON, SPILL_CENTER_LAT],
            "orientation_deg": 35.0,
            "elongation_ratio": 3.1,
            "confidence": 0.92,
            "timestamp": SPILL_TIME.isoformat() + "Z",
            "age_bucket": "fresh"
        }
    }

    return {"type": "FeatureCollection", "features": [feature]}


# ---------------------------------------------------------------------------
# 2. Drift Result (synthetic hindcast + forecast)
# ---------------------------------------------------------------------------
def generate_drift():
    print("  Generating drift trajectories...")

    def drift_step(cx, cy, step_idx, backward=False):
        """Simulate one hourly drift step with current + wind forcing."""
        # Ocean current: ~0.3 kts NW-ish
        current_dx = -0.003 + random.gauss(0, 0.001)
        current_dy = 0.004 + random.gauss(0, 0.001)
        # Wind drift: ~3% of 15kt wind from SW
        wind_dx = 0.002 + random.gauss(0, 0.0005)
        wind_dy = 0.001 + random.gauss(0, 0.0005)

        direction = -1 if backward else 1
        new_cx = cx + direction * (current_dx + wind_dx)
        new_cy = cy + direction * (current_dy + wind_dy)

        # Growing uncertainty envelope
        spread = 0.005 + step_idx * 0.002
        poly = make_ellipse_coords(new_cx, new_cy, spread, spread * 0.6, angle_deg=35 + step_idx * 3)

        return new_cx, new_cy, {
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": poly},
            "properties": {
                "timestamp": (SPILL_TIME + timedelta(hours=direction * step_idx)).isoformat() + "Z",
                "step": step_idx,
                "is_backward": backward
            }
        }

    # Backward hindcast (24 steps = 24 hours)
    hindcast_track = []
    cx, cy = SPILL_CENTER_LON, SPILL_CENTER_LAT
    for i in range(1, 25):
        cx, cy, feature = drift_step(cx, cy, i, backward=True)
        hindcast_track.append(feature)

    origin_estimate = hindcast_track[-1]  # The final backward step = origin window

    # Forward forecast (24 steps = 24 hours)
    forecast_track = []
    cx, cy = SPILL_CENTER_LON, SPILL_CENTER_LAT
    for i in range(1, 25):
        cx, cy, feature = drift_step(cx, cy, i, backward=False)
        forecast_track.append(feature)

    return {
        "origin_estimate": origin_estimate,
        "hindcast_track": hindcast_track,
        "forecast_track": forecast_track
    }


# ---------------------------------------------------------------------------
# 3. Attribution Result (synthetic AIS + scoring)
# ---------------------------------------------------------------------------
def generate_attribution(origin_estimate):
    print("  Generating AIS attribution scores...")

    origin_geom = origin_estimate["geometry"]
    origin_coords = origin_geom["coordinates"][0]
    origin_cx = sum(c[0] for c in origin_coords) / len(origin_coords)
    origin_cy = sum(c[1] for c in origin_coords) / len(origin_coords)
    origin_time = datetime.fromisoformat(origin_estimate["properties"]["timestamp"].replace("Z", ""))

    vessels = []

    # --- Culprit: STEALTH VOYAGER (Tanker) ---
    # Passes directly through origin at origin_time
    culprit_track = []
    for h in range(-8, 9):
        t = origin_time + timedelta(hours=h)
        lon = origin_cx + h * 0.012
        lat = origin_cy + h * 0.008 + random.gauss(0, 0.001)
        culprit_track.append([lon, lat])

    vessels.append({
        "mmsi": "CULPRIT_999",
        "name": "STEALTH VOYAGER",
        "type": "Tanker",
        "suspicion_score": 94,
        "sub_scores": {"spatial": 98, "temporal": 95, "vessel_type": 100},
        "intersection_point": [origin_cx, origin_cy],
        "intersection_time": origin_time.isoformat() + "Z",
        "track_geojson": {"type": "LineString", "coordinates": culprit_track}
    })

    # --- Innocent 1: GLOBAL TRADER (Cargo) ---
    # Passed nearby but 10 hours earlier
    cargo_track = []
    for h in range(-8, 9):
        t = origin_time + timedelta(hours=h - 10)
        lon = origin_cx + h * 0.015 + 0.15
        lat = origin_cy + h * 0.006
        cargo_track.append([lon, lat])

    vessels.append({
        "mmsi": "INNOCENT_111",
        "name": "GLOBAL TRADER",
        "type": "Cargo",
        "suspicion_score": 52,
        "sub_scores": {"spatial": 60, "temporal": 30, "vessel_type": 70},
        "intersection_point": [origin_cx + 0.15, origin_cy],
        "intersection_time": (origin_time - timedelta(hours=10)).isoformat() + "Z",
        "track_geojson": {"type": "LineString", "coordinates": cargo_track}
    })

    # --- Innocent 2: OCEAN CATCH (Fishing) ---
    # Close spatially and temporally but wrong vessel type
    fishing_track = []
    for h in range(-8, 9):
        t = origin_time + timedelta(hours=h)
        lon = origin_cx - 0.08 + h * 0.005
        lat = origin_cy + h * 0.003 + math.sin(h) * 0.01
        fishing_track.append([lon, lat])

    vessels.append({
        "mmsi": "INNOCENT_222",
        "name": "OCEAN CATCH",
        "type": "Fishing",
        "suspicion_score": 38,
        "sub_scores": {"spatial": 55, "temporal": 50, "vessel_type": 20},
        "intersection_point": [origin_cx - 0.08, origin_cy],
        "intersection_time": origin_time.isoformat() + "Z",
        "track_geojson": {"type": "LineString", "coordinates": fishing_track}
    })

    # --- Innocent 3: SEA PRINCESS (Passenger) ---
    # Far away
    passenger_track = []
    for h in range(-8, 9):
        t = origin_time + timedelta(hours=h)
        lon = origin_cx + 0.8 + h * 0.01
        lat = origin_cy + 0.5
        passenger_track.append([lon, lat])

    vessels.append({
        "mmsi": "FAR_333",
        "name": "SEA PRINCESS",
        "type": "Passenger",
        "suspicion_score": 12,
        "sub_scores": {"spatial": 5, "temporal": 10, "vessel_type": 10},
        "intersection_point": [origin_cx + 0.8, origin_cy + 0.5],
        "intersection_time": origin_time.isoformat() + "Z",
        "track_geojson": {"type": "LineString", "coordinates": passenger_track}
    })

    # Sort by score descending
    vessels.sort(key=lambda v: v["suspicion_score"], reverse=True)
    return vessels


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("  Generating Demo Cache")
    print("=" * 60)

    # Seed for reproducibility
    random.seed(42)

    detection = generate_detection()
    with open(CACHE_DIR / "detection_result.json", "w") as f:
        json.dump(detection, f, indent=2)
    print(f"  ✅ detection_result.json ({len(detection['features'])} features)")

    drift = generate_drift()
    with open(CACHE_DIR / "drift_result.json", "w") as f:
        json.dump(drift, f, indent=2)
    print(f"  ✅ drift_result.json ({len(drift['hindcast_track'])} hindcast + {len(drift['forecast_track'])} forecast steps)")

    attribution = generate_attribution(drift["origin_estimate"])
    with open(CACHE_DIR / "attribution_result.json", "w") as f:
        json.dump(attribution, f, indent=2)
    print(f"  ✅ attribution_result.json ({len(attribution)} vessels, top suspect: {attribution[0]['name']})")

    print()
    print(f"  All files written to {CACHE_DIR}/")
    print("  Run the frontend and click 'Run Analysis' to see the results!")
    print("=" * 60)


if __name__ == "__main__":
    main()
