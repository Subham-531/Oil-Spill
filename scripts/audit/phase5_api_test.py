import json
import urllib.request
import urllib.error
import os

print("=== PHASE 5: PIPELINE TRUTH TEST ===")

base_url = "http://127.0.0.1:8000"

def get(url):
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def post(url, data):
    body = json.dumps(data).encode("utf-8") if data is not None else b""
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"} if data is not None else {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except:
            return e.code, str(e)
    except Exception as e:
        return 0, str(e)

# 1. GET /api/health
status, health = get(f"{base_url}/api/health")
print(f"\n1. GET /api/health:")
print(f"   Status: {status}, Response: {health}")

# Load demo cache detection_result.json
with open("data/demo_cache/detection_result.json") as f:
    demo_cache_detect = json.load(f)

# Load scenes_index.json
with open("data/sar/demo/scenes_index.json") as f:
    scenes_index = json.load(f)

detect_results = {}
scenes_to_test = ["SAR_SCENE_01", "SAR_SCENE_02", "SAR_SCENE_03"]

last_polygon = None
for s_id in scenes_to_test:
    status, res = post(f"{base_url}/api/detect/?scene_id={s_id}", None)
    print(f"\n2. POST /api/detect/?scene_id={s_id}:")
    print(f"   Status: {status}")
    if status == 200:
        feats = res.get("features", [])
        print(f"   Features count: {len(feats)}")
        if feats:
            props = feats[0]["properties"]
            last_polygon = feats[0]["geometry"]
            area = sum(f["properties"]["area_km2"] for f in feats)
            conf = props["confidence"]
            age = props["age_bucket"]
            elong = props["elongation_ratio"]
            print(f"   Live response: Area={area:.2f} km², Conf={conf*100:.1f}%, Age={age}, Elongation={elong:.2f}")
            
            # Compare with scenes_index
            meta = next((item for item in scenes_index if item["id"] == s_id), {})
            idx_area = meta.get("detected_area_km2")
            idx_conf = meta.get("detected_confidence")
            idx_age = meta.get("detected_age")
            print(f"   scenes_index.json: Area={idx_area} km², Conf={idx_conf}%, Age={idx_age}")
            print(f"   Match with scenes_index: Area diff={abs(area-idx_area):.4f}, Conf diff={abs(conf*100-idx_conf):.4f}")
            
            # Compare with demo_cache
            dc_area = demo_cache_detect["features"][0]["properties"]["area_km2"]
            dc_conf = demo_cache_detect["features"][0]["properties"]["confidence"]
            print(f"   demo_cache: Area={dc_area} km², Conf={dc_conf*100:.1f}%")
            print(f"   Matches demo_cache? {area == dc_area and conf == dc_conf}")
        detect_results[s_id] = res
    else:
        print(f"   Error: {res}")

# 3. POST /api/drift/
print(f"\n3. POST /api/drift/:")
if last_polygon:
    drift_payload = {
        "spill_polygon_geojson": last_polygon,
        "detection_timestamp": "2024-01-15T06:00:00Z",
        "hindcast_hours": 12,
        "forecast_hours": 12
    }
    status, drift_res = post(f"{base_url}/api/drift/", drift_payload)
    print(f"   Status: {status}")
    print(f"   Response:\n{drift_res}")
else:
    print("   Skipped, no polygon from detection.")

# 4. POST /api/attribute/
print(f"\n4. POST /api/attribute/:")
if last_polygon:
    attr_payload = {
        "origin_polygon_geojson": last_polygon,
        "origin_time_start": "2024-01-14T23:30:00Z",
        "origin_time_end": "2024-01-15T01:30:00Z",
        "spatial_buffer_km": 15.0,
        "temporal_buffer_hours": 4.0,
        "top_n": 10
    }
    status, attr_res = post(f"{base_url}/api/attribute/", attr_payload)
    print(f"   Status: {status}")
    print(f"   Response:\n{attr_res}")
else:
    print("   Skipped, no polygon.")

# Save results
os.makedirs("scripts/audit/results", exist_ok=True)
with open("scripts/audit/results/phase5_api_test.json", "w") as f:
    json.dump({
        "health": health,
        "detect_results": detect_results,
        "drift_status": status,
    }, f, indent=2)
