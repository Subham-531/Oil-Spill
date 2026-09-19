import sys
import hashlib
import os

print("=== PYTHON & SYSTEM ===")
print("Python:", sys.version)
print("Executable:", sys.executable)
print("Platform:", sys.platform)

mods = ['torch', 'torchvision', 'rasterio', 'cv2', 'numpy', 'xarray', 'pyproj', 'fastapi', 'uvicorn', 'opendrift', 'pandas', 'pyarrow', 'scipy', 'shapely']
print("\n=== MODULE VERSIONS ===")
for m in mods:
    try:
        mod = __import__(m)
        ver = getattr(mod, '__version__', 'installed (no __version__)')
        print(f"{m}: {ver}")
    except Exception as e:
        print(f"{m}: NOT INSTALLED ({e})")

try:
    import torch
    print("CUDA Available:", torch.cuda.is_available())
    if torch.cuda.is_available():
        print("Device:", torch.cuda.get_device_name(0))
except Exception as e:
    print("Torch error:", e)

print("\n=== MODEL WEIGHTS FILE ===")
weights_path = os.path.join("models", "unet_spill_weights.pt")
if os.path.exists(weights_path):
    size = os.path.getsize(weights_path)
    mtime = os.path.getmtime(weights_path)
    h = hashlib.sha256()
    with open(weights_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    print(f"Path: {weights_path}")
    print(f"Size (bytes): {size}")
    print(f"SHA256: {h.hexdigest()}")
    print(f"mtime (timestamp): {mtime}")
else:
    print(f"Path {weights_path} does NOT exist.")
