import json
import sys
import os
sys.path.insert(0, os.path.abspath("."))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from fastapi.testclient import TestClient
from backend.main import app

def run_pipeline_check():
    client = TestClient(app)
    
    print("=" * 70)
    print("🛰️  SWACHH TRACK // COMPREHENSIVE PIPELINE VERIFICATION")
    print("=" * 70)
    
    # 1. Health
    print("\n[1/5] Checking System Health API...")
    r = client.get("/api/health")
    print(f"   Status: {r.status_code} | Payload: {r.json()}")
    assert r.status_code == 200, "Health check failed"
    
    # 2. Demo Catalog
    print("\n[2/5] Checking Pre-staged SAR Scene Catalog...")
    r = client.get("/api/detect/scenes")
    scene_count = r.json().get("count", 0)
    print(f"   Status: {r.status_code} | Catalog Size: {scene_count} scenes")
    assert r.status_code == 200, "Catalog retrieval failed"
    
    # 3. Detection with newly trained U-Net
    print("\n[3/5] Testing U-Net SAR Spill Detection Inference...")
    r = client.post("/api/detect/?scene_id=SAR_SCENE_01")
    print(f"   Status: {r.status_code}")
    assert r.status_code == 200, f"Detection failed: {r.text}"
    
    det_geojson = r.json()
    features = det_geojson.get("features", [])
    print(f"   Detected Spill Polygons: {len(features)}")
    assert len(features) > 0, "No spill polygons detected!"
    
    for i, feat in enumerate(features[:3]):
        p = feat["properties"]
        print(f"   - Spill #{i+1}: Area={p.get('area_km2', 0):.2f} km² | Conf={p.get('confidence', 0)*100:.1f}% | Age={p.get('age_bucket')} | Elongation={p.get('elongation_ratio', 0):.2f}")
    
    spill_poly = features[0]["geometry"]
    detection_time = features[0]["properties"].get("timestamp", "2024-01-15T06:00:00Z")
    
    # 4. Drift Simulation (Hindcast & Forecast)
    print("\n[4/5] Testing Ocean Drift Hindcast/Forecast Simulation...")
    drift_payload = {
        "spill_polygon_geojson": spill_poly,
        "detection_timestamp": detection_time,
        "hindcast_hours": 6,
        "forecast_hours": 6
    }
    r_drift = client.post("/api/drift/", json=drift_payload)
    print(f"   Status: {r_drift.status_code}")
    assert r_drift.status_code == 200, f"Drift simulation failed: {r_drift.text}"
    
    drift_data = r_drift.json()
    hindcast_steps = drift_data.get("hindcast_track", [])
    forecast_steps = drift_data.get("forecast_track", [])
    origin_estimate = drift_data.get("origin_estimate", {})
    print(f"   Hindcast trajectory steps: {len(hindcast_steps)}")
    print(f"   Forecast trajectory steps: {len(forecast_steps)}")
    assert len(hindcast_steps) > 0, "No hindcast trajectory steps returned!"
    assert len(forecast_steps) > 0, "No forecast trajectory steps returned!"
    assert origin_estimate is not None, "Origin estimate polygon missing!"
    
    # 5. AIS Vessel Attribution
    print("\n[5/6] Testing AIS Vessel Attribution & Spatio-Temporal Correlation...")
    attr_payload = {
        "origin_polygon_geojson": origin_estimate.get("geometry", spill_poly),
        "origin_time_start": "2024-01-14T23:30:00Z",
        "origin_time_end": "2024-01-15T01:30:00Z",
        "spatial_buffer_km": 15.0,
        "temporal_buffer_hours": 4.0,
        "top_n": 5
    }
    r_attr = client.post("/api/attribute/", json=attr_payload)
    print(f"   Status: {r_attr.status_code}")
    assert r_attr.status_code == 200, f"Attribution failed: {r_attr.text}"
    
    attr_data = r_attr.json()
    suspects = attr_data if isinstance(attr_data, list) else attr_data.get("suspect_vessels", [])
    print(f"   Suspect vessels identified: {len(suspects)}")
    assert len(suspects) > 0, "No suspect vessels identified in origin corridor!"
    for i, s in enumerate(suspects[:5]):
        name = s.get("name") or s.get("vessel_name") or s.get("mmsi")
        mmsi = s.get("mmsi")
        v_type = s.get("type", "Commercial")
        score = s.get("suspicion_score") or s.get("composite_score") or s.get("score")
        dist_km = s.get("closest_approach_distance_km", 0.0)
        anomaly = s.get("anomaly", "Normal Transit")
        print(f"   - #{i+1} {name} ({v_type} | MMSI: {mmsi}) | Score: {score}/100 | Dist: {dist_km:.1f} km | Anomaly: {anomaly}")
        assert "track_geojson" in s, f"Missing track_geojson for vessel {name}"
        assert "sub_scores" in s, f"Missing sub_scores for vessel {name}"

    # 6. Official Tribunal PDF Dossier Report
    print("\n[6/6] Testing Official Evidence Dossier & ReportLab PDF Generation...")
    r_pdf = client.get("/api/attribute/report/INCIDENT-2024-TEST")
    print(f"   Status: {r_pdf.status_code} | Content-Type: {r_pdf.headers.get('content-type')}")
    assert r_pdf.status_code == 200, f"PDF generation failed: {r_pdf.text}"
    assert len(r_pdf.content) > 1000, "PDF content empty or truncated"
    print(f"   Generated Dossier Size: {len(r_pdf.content):,} bytes")
    
    print("\n" + "=" * 70)
    print("✅ ALL PIPELINE MODULES VERIFIED SUCCESSFULLY END-TO-END!")
    print("=" * 70)

if __name__ == "__main__":
    run_pipeline_check()
