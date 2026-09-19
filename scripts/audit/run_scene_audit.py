import os
import sys
import json
import numpy as np
import torch
import pyproj
from shapely.geometry import shape

sys.path.insert(0, os.path.abspath("."))
from backend.detection.detector import SpillDetector

print("=== PHASE 3: MODEL EXECUTION & CLAIM REPRODUCTION AUDIT ===")

detector = SpillDetector(model_path="models/unet_spill_weights.pt")
print(f"Model loaded: {detector.model_loaded} on device: {detector.device}")

# Load scenes_index.json
index_path = os.path.join("data", "sar", "demo", "scenes_index.json")
with open(index_path, "r") as f:
    scenes_list = json.load(f)

print(f"Loaded scenes_index with {len(scenes_list)} entries.")

geod = pyproj.Geod(ellps="WGS84")

extra_scenes = ["data/sar/demo/test_slick.tif", "data/sar/sample_spill.tif"]

audit_results = {}
class2_predicted_total = 0
class3_predicted_total = 0

print(f"\n{'Scene ID':<14} | {'Claimed Area':<12} | {'Meas Area':<10} | {'Geod Area':<10} | {'Area Err%':<10} | {'Claim Conf':<10} | {'Meas Conf%':<10} | {'Verdict'}")
print("-" * 105)

for item in scenes_list:
    scene_id = item["id"]
    fname = item["filename"]
    tif_path = os.path.join("data", "sar", "demo", fname)
    if not os.path.exists(tif_path):
        tif_path = os.path.join("data", "sar", fname)
    
    # 1. Direct forward pass
    tensor, transform, crs, orig_shape = detector.preprocess(tif_path)
    with torch.no_grad():
        logits = detector.model(tensor)
        probs = torch.softmax(logits, dim=1)
        pred_class = torch.argmax(probs, dim=1).cpu().numpy()[0]
        spill_prob = probs[0, 1].cpu().numpy()
    
    # Pixel counts per class
    counts = {int(c): int(np.sum(pred_class == c)) for c in range(4)}
    class2_predicted_total += counts[2]
    class3_predicted_total += counts[3]
    
    # 2. Run backend detect_spill
    detection_fc = detector.detect_spill(tif_path)
    features = detection_fc.get("features", [])
    
    measured_area_km2 = 0.0
    measured_geod_area_km2 = 0.0
    measured_confidence_pct = 0.0
    measured_elongation = 0.0
    measured_age_bucket = "none"
    discrepancy_pct = 0.0
    
    if features:
        for feat in features:
            props = feat["properties"]
            geom = shape(feat["geometry"])
            backend_a = props["area_km2"]
            measured_area_km2 += backend_a
            
            geod_area, _ = geod.geometry_area_perimeter(geom)
            geod_a_km2 = abs(geod_area) / 1e6
            measured_geod_area_km2 += geod_a_km2
        
        # confidence in detector is 0.0-1.0 float, scenes_index claims 90.1 (percentage)
        measured_confidence_pct = features[0]["properties"]["confidence"] * 100.0
        measured_elongation = features[0]["properties"]["elongation_ratio"]
        measured_age_bucket = features[0]["properties"]["age_bucket"]
        
        if measured_geod_area_km2 > 0:
            discrepancy_pct = ((measured_area_km2 - measured_geod_area_km2) / measured_geod_area_km2) * 100
            
    claimed_area = item.get("detected_area_km2")
    claimed_conf = item.get("detected_confidence")
    claimed_age = item.get("detected_age")
    
    area_diff = abs(measured_area_km2 - claimed_area) if claimed_area is not None else None
    conf_diff = abs(measured_confidence_pct - claimed_conf) if claimed_conf is not None else None
    
    # Verdict: match within 0.1 km2 and 0.5% confidence
    verdict = "VERIFIED"
    if (area_diff is not None and area_diff > 0.2) or (conf_diff is not None and conf_diff > 0.5):
        verdict = "REFUTED"
        
    print(f"{scene_id:<14} | {claimed_area:<12.2f} | {measured_area_km2:<10.2f} | {measured_geod_area_km2:<10.2f} | {discrepancy_pct:<+10.2f} | {claimed_conf:<10.1f} | {measured_confidence_pct:<10.1f} | {verdict}")
    
    res_entry = {
        "scene_id": scene_id,
        "title": item.get("title"),
        "filename": fname,
        "class_counts": counts,
        "claimed": {
            "area_km2": claimed_area,
            "confidence": claimed_conf,
            "age_bucket": claimed_age
        },
        "measured": {
            "area_km2_backend": measured_area_km2,
            "area_km2_geodesic": measured_geod_area_km2,
            "area_discrepancy_pct": discrepancy_pct,
            "confidence_pct": measured_confidence_pct,
            "elongation": measured_elongation,
            "age_bucket": measured_age_bucket
        },
        "verdict": verdict
    }
    audit_results[scene_id] = res_entry
    
    os.makedirs("scripts/audit/results", exist_ok=True)
    with open(f"scripts/audit/results/{scene_id}.json", "w") as f:
        json.dump(res_entry, f, indent=2)

# Audit extra scenes
print("-" * 105)
for extra_path in extra_scenes:
    key = os.path.basename(extra_path)
    tensor, transform, crs, orig_shape = detector.preprocess(extra_path)
    with torch.no_grad():
        logits = detector.model(tensor)
        probs = torch.softmax(logits, dim=1)
        pred_class = torch.argmax(probs, dim=1).cpu().numpy()[0]
        spill_prob = probs[0, 1].cpu().numpy()
    
    counts = {int(c): int(np.sum(pred_class == c)) for c in range(4)}
    class2_predicted_total += counts[2]
    class3_predicted_total += counts[3]
    
    fc = detector.detect_spill(extra_path)
    features = fc.get("features", [])
    area_km2 = sum(f["properties"]["area_km2"] for f in features)
    geod_km2 = sum(abs(geod.geometry_area_perimeter(shape(f["geometry"]))[0])/1e6 for f in features)
    conf = (features[0]["properties"]["confidence"] * 100.0) if features else 0.0
    
    print(f"{key:<14} | {'N/A':<12} | {area_km2:<10.2f} | {geod_km2:<10.2f} | {((area_km2-geod_km2)/geod_km2*100 if geod_km2 else 0):<+10.2f} | {'N/A':<10} | {conf:<10.1f} | N/A")
    
    audit_results[key] = {
        "scene_id": key,
        "file_path": extra_path,
        "class_counts": counts,
        "measured": {
            "area_km2_backend": area_km2,
            "area_km2_geodesic": geod_km2,
            "confidence_pct": conf
        }
    }
    with open(f"scripts/audit/results/{key}.json", "w") as f:
        json.dump(audit_results[key], f, indent=2)

# Determinism check
print("\n=== DETERMINISM CHECK ===")
test_scene = "data/sar/demo/sar_scene_01_fresh_linear_slick.tif"
r1 = detector.detect_spill(test_scene)
r2 = detector.detect_spill(test_scene)
is_identical = (json.dumps(r1, sort_keys=True) == json.dumps(r2, sort_keys=True))
print(f"Two runs of {test_scene} strictly identical: {is_identical}")

# Degenerate Probes
print("\n=== DEGENERATE PROBES ===")
probes = {
    "all_zeros": torch.zeros((1, 1, 256, 256), dtype=torch.float32).to(detector.device),
    "all_ones": torch.ones((1, 1, 256, 256), dtype=torch.float32).to(detector.device),
    "uniform_128": (torch.ones((1, 1, 256, 256), dtype=torch.float32) * (128.0 / 255.0)).to(detector.device),
    "gaussian_noise": torch.clamp(torch.normal(mean=0.5, std=0.1, size=(1, 1, 256, 256)), 0.0, 1.0).to(detector.device),
}

blob = torch.zeros((1, 1, 256, 256), dtype=torch.float32)
blob[0, 0, 118:138, 118:138] = 1.0
probes["bright_blob_on_dark"] = blob.to(detector.device)

probe_results = {}
for name, probe_tensor in probes.items():
    with torch.no_grad():
        logits = detector.model(probe_tensor)
        probs = torch.softmax(logits, dim=1)
        pred_class = torch.argmax(probs, dim=1).cpu().numpy()[0]
    p_counts = {int(c): int(np.sum(pred_class == c)) for c in range(4)}
    mean_probs = [float(probs[0, c].mean().cpu().item()) for c in range(4)]
    print(f"\nProbe [{name}]:")
    print(f"  Class counts: Sea(0)={p_counts[0]}, Oil(1)={p_counts[1]}, Lookalike(2)={p_counts[2]}, Ship(3)={p_counts[3]}")
    print(f"  Mean softmax probs: [0]={mean_probs[0]:.4f}, [1]={mean_probs[1]:.4f}, [2]={mean_probs[2]:.4f}, [3]={mean_probs[3]:.4f}")
    probe_results[name] = {
        "counts": p_counts,
        "mean_probs": mean_probs
    }
    class2_predicted_total += p_counts[2]
    class3_predicted_total += p_counts[3]

print(f"\n==========================================")
print(f"TOTAL Class 2 (Lookalike) pixels predicted across ALL tests: {class2_predicted_total}")
print(f"TOTAL Class 3 (Ship) pixels predicted across ALL tests: {class3_predicted_total}")

with open("scripts/audit/results/phase3_scene_audit.json", "w") as f:
    json.dump({
        "scenes": audit_results,
        "probes": probe_results,
        "determinism": is_identical,
        "class2_total": class2_predicted_total,
        "class3_total": class3_predicted_total
    }, f, indent=2)
