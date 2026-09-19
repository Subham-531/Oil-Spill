import os
import glob
import hashlib
import rasterio
import cv2
import numpy as np
import json

print("=== PHASE 2: SAR SCENE AUTHENTICITY AUDIT ===")

tif_files = sorted(glob.glob("data/sar/**/*.tif", recursive=True))
print(f"Found {len(tif_files)} .tif files:")

results = {}

for tif_path in tif_files:
    size = os.path.getsize(tif_path)
    with open(tif_path, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    
    with rasterio.open(tif_path) as src:
        dtype = src.dtypes[0]
        width = src.width
        height = src.height
        count = src.count
        crs = str(src.crs)
        transform = list(src.transform)
        tags = src.tags()
        data = src.read(1)
    
    min_val = int(data.min())
    max_val = int(data.max())
    mean_val = float(data.mean())
    std_val = float(data.std())
    
    # Check corresponding png if exists
    png_path = tif_path.replace(".tif", ".png")
    png_exists = os.path.exists(png_path)
    png_match = None
    if png_exists:
        png_data = cv2.imread(png_path, cv2.IMREAD_UNCHANGED)
        if png_data is not None:
            if len(png_data.shape) == 3:
                # If RGB/RGBA, check if grayscale channels match
                if np.array_equal(png_data[:, :, 0], png_data[:, :, 1]) and np.array_equal(png_data[:, :, 0], data):
                    png_match = "exact_match_single_channel"
                else:
                    diff = np.abs(png_data[:, :, 0].astype(int) - data.astype(int)).max()
                    png_match = f"rgb_png_max_diff_{diff}"
            elif png_data.shape == data.shape:
                diff = np.abs(png_data.astype(int) - data.astype(int)).max()
                png_match = f"diff_{diff}"
    
    # Dark region characterization
    # Otsu or threshold below 60
    dark_mask = (data < 50).astype(np.uint8)
    dark_pixel_count = int(np.sum(dark_mask))
    
    # Edge gradient analysis inside vs outside
    sobelx = cv2.Sobel(data, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(data, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.sqrt(sobelx**2 + sobely**2)
    
    # Variance inside dark region vs background
    inside_var = float(np.var(data[dark_mask == 1])) if dark_pixel_count > 0 else 0.0
    outside_var = float(np.var(data[dark_mask == 0])) if np.sum(dark_mask == 0) > 0 else 0.0
    
    # Check contours of dark mask for geometric regularity (circularity, convexity)
    contours, _ = cv2.findContours(dark_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour_stats = []
    for c in contours:
        area = cv2.contourArea(c)
        if area > 20:
            perimeter = cv2.arcLength(c, True)
            hull = cv2.convexHull(c)
            hull_area = cv2.contourArea(hull)
            solidity = float(area / hull_area) if hull_area > 0 else 0.0
            circularity = float(4 * np.pi * area / (perimeter**2)) if perimeter > 0 else 0.0
            contour_stats.append({
                "area": area,
                "perimeter": perimeter,
                "solidity": solidity,
                "circularity": circularity
            })

    res = {
        "path": tif_path,
        "size_bytes": size,
        "sha256": sha256,
        "dtype": dtype,
        "dimensions": [width, height],
        "band_count": count,
        "crs": crs,
        "transform": transform,
        "tags": tags,
        "pixel_stats": {
            "min": min_val,
            "max": max_val,
            "mean": mean_val,
            "std": std_val
        },
        "dark_pixels": dark_pixel_count,
        "inside_variance": inside_var,
        "outside_variance": outside_var,
        "png_path": png_path if png_exists else None,
        "png_match": png_match,
        "contour_count": len(contour_stats),
        "contours": contour_stats
    }
    results[tif_path] = res
    print(f"\n--- {tif_path} ---")
    print(f"Size: {size} bytes | SHA256: {sha256[:16]}...")
    print(f"Shape: {width}x{height} | Dtype: {dtype} | Bands: {count}")
    print(f"CRS: {crs}")
    print(f"Transform: {transform}")
    print(f"Tags: {tags}")
    print(f"Pixel range: [{min_val}, {max_val}], mean={mean_val:.2f}, std={std_val:.2f}")
    print(f"Dark pixels (<50): {dark_pixel_count}")
    print(f"Variance inside dark: {inside_var:.2f} vs outside: {outside_var:.2f}")
    print(f"Contours >20px: {len(contour_stats)}")
    for i, cs in enumerate(contour_stats[:3]):
        print(f"  Contour {i}: area={cs['area']}, solidity={cs['solidity']:.3f}, circularity={cs['circularity']:.3f}")
    print(f"PNG exists: {png_exists} (comparison: {png_match})")

# Save results json
os.makedirs("scripts/audit/results", exist_ok=True)
with open("scripts/audit/results/phase2_sar_authenticity.json", "w") as f:
    json.dump(results, f, indent=2)
print("\nPhase 2 results saved to scripts/audit/results/phase2_sar_authenticity.json")
