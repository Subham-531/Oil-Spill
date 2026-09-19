import os
import sys
import glob
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.abspath("."))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
from backend.detection.detector import get_detector

def test_samples():
    print("=" * 68)
    print("🛰️  TESTING SWACHH TRACK DETECTOR ON REAL SENTINEL-1 SATELLITE IMAGES")
    print("=" * 68)
    
    detector = get_detector()
    sample_dir = Path("test_images")
    img_files = sorted(sample_dir.glob("test_sar_spill_*.tif"))
    
    if not img_files:
        print("No .tif test images found in test_images/!")
        return
        
    print(f"Found {len(img_files)} real Sentinel-1 test scenes.\n")
    
    for idx, img_path in enumerate(img_files, start=1):
        print(f"[{idx}/{len(img_files)}] Processing: {img_path.name}")
        geojson = detector.detect_spill(str(img_path))
        
        features = geojson.get("features", [])
        total_area = sum(f["properties"].get("area_km2", 0.0) for f in features)
        total_vol = sum(f["properties"].get("volume_m3", 0.0) for f in features)
        
        print(f"   -> Detected Slicks: {len(features)}")
        print(f"   -> Total Spill Area: {total_area:.2f} km² | Total Estimated Vol: {total_vol:.1f} m³")
        
        for p_idx, feat in enumerate(features[:3], start=1):
            props = feat.get("properties", {})
            conf = props.get("confidence", 0.0) * 100
            area = props.get("area_km2", 0.0)
            vol = props.get("volume_m3", 0.0)
            bonn = props.get("bonn_agreement_code", "N/A")
            age = props.get("age_bucket", "N/A")
            elon = props.get("elongation_ratio", 1.0)
            print(f"      - Slick #{p_idx}: Area={area:.2f} km² | Conf={conf:.1f}% | Bonn Code={bonn} | Vol={vol:.1f} m³ | Age={age} | Elongation={elon:.1f}")
        print("-" * 68)

if __name__ == "__main__":
    test_samples()
