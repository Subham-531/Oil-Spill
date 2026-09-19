import json
import numpy as np
import cv2
import rasterio
from rasterio.features import shapes
from shapely.geometry import shape, Polygon, mapping
import torch
import torch.nn as nn
from torchvision import transforms
from pathlib import Path
from datetime import datetime

# Define the U-Net Architecture (must match the training notebook)
class UNet(nn.Module):
    def __init__(self, in_channels=1, out_channels=4):
        super(UNet, self).__init__()
        
        def conv_block(in_c, out_c):
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_c, out_c, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True)
            )
            
        self.encoder1 = conv_block(in_channels, 64)
        self.encoder2 = conv_block(64, 128)
        self.encoder3 = conv_block(128, 256)
        
        self.pool = nn.MaxPool2d(2, 2)
        
        self.bottleneck = conv_block(256, 512)
        
        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.decoder3 = conv_block(512, 256)
        
        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.decoder2 = conv_block(256, 128)
        
        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.decoder1 = conv_block(128, 64)
        
        self.out_conv = nn.Conv2d(64, out_channels, kernel_size=1)

    def forward(self, x):
        enc1 = self.encoder1(x)
        enc2 = self.encoder2(self.pool(enc1))
        enc3 = self.encoder3(self.pool(enc2))
        
        bottleneck = self.bottleneck(self.pool(enc3))
        
        dec3 = self.upconv3(bottleneck)
        dec3 = torch.cat((dec3, enc3), dim=1)
        dec3 = self.decoder3(dec3)
        
        dec2 = self.upconv2(dec3)
        dec2 = torch.cat((dec2, enc2), dim=1)
        dec2 = self.decoder2(dec2)
        
        dec1 = self.upconv1(dec2)
        dec1 = torch.cat((dec1, enc1), dim=1)
        dec1 = self.decoder1(dec1)
        
        return self.out_conv(dec1)

class SpillDetector:
    def __init__(self, model_path="models/unet_spill_weights.pt"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = UNet(in_channels=1, out_channels=4).to(self.device)
        self.model_loaded = False
        
        if Path(model_path).exists():
            self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=True))
            self.model.eval()
            self.model_loaded = True
            print(f"Loaded detection model from {model_path}")
        else:
            print(f"Warning: Model weights not found at {model_path}. Please train the model in Colab and save weights.")

    @staticmethod
    def _gaussian_window_2d(size=256, sigma=64):
        """2D Gaussian kernel for seamless blending of overlapping tiles."""
        x = np.linspace(-size / 2, size / 2, size)
        gauss_1d = np.exp(-0.5 * (x / sigma) ** 2)
        gauss_2d = np.outer(gauss_1d, gauss_1d)
        return (gauss_2d / gauss_2d.max()).astype(np.float32)

    def predict_patch_tta(self, patch_tensor):
        """
        Test-Time Augmentation (TTA):
        Evaluates the patch across 4 geometric transforms (Identity, H-Flip, V-Flip, Rot180)
        and averages the inverted probability maps to eliminate single-pass speckle jitter.
        """
        # 1. Identity
        p0 = torch.softmax(self.model(patch_tensor), dim=1)
        
        # 2. Horizontal Flip
        t_hflip = torch.flip(patch_tensor, dims=[3])
        p_hflip = torch.flip(torch.softmax(self.model(t_hflip), dim=1), dims=[3])
        
        # 3. Vertical Flip
        t_vflip = torch.flip(patch_tensor, dims=[2])
        p_vflip = torch.flip(torch.softmax(self.model(t_vflip), dim=1), dims=[2])
        
        # 4. 180 Rotation
        t_rot = torch.rot90(patch_tensor, k=2, dims=[2, 3])
        p_rot = torch.rot90(torch.softmax(self.model(t_rot), dim=1), k=-2, dims=[2, 3])
        
        # Ensemble average
        p_avg = (p0 + p_hflip + p_vflip + p_rot) / 4.0
        return p_avg

    def tiled_predict(self, image, tile_size=256, overlap=0.5, use_tta=True,
                      p1=None, p99=None):
        """
        Sliding-window overlapping tile inference with 2D Gaussian weight blending.
        Preserves 100% of native SAR resolution on arbitrary-sized satellite swaths.

        When ``p1``/``p99`` are provided, they are the scene-wide 1st/99th
        percentiles computed once in ``detect_spill``. Per-patch normalization
        is skipped so uniform tiles (all sea or all slick) do not get amplified
        into false-positive seams.
        """
        h, w = image.shape
        stride = int(tile_size * (1.0 - overlap))
        g_window = self._gaussian_window_2d(tile_size, sigma=tile_size / 4.0)

        # Pad image to integer multiple of stride
        pad_h = (tile_size - (h % stride)) % stride
        pad_w = (tile_size - (w % stride)) % stride
        if h < tile_size:
            pad_h = tile_size - h
        if w < tile_size:
            pad_w = tile_size - w

        img_padded = np.pad(image, ((0, pad_h), (0, pad_w)), mode='reflect').astype(np.float32)
        H_pad, W_pad = img_padded.shape

        prob_accum = np.zeros((H_pad, W_pad, 4), dtype=np.float32)
        weight_accum = np.zeros((H_pad, W_pad), dtype=np.float32)

        # Iterate sliding window
        for y in range(0, H_pad - tile_size + 1, stride):
            for x in range(0, W_pad - tile_size + 1, stride):
                patch = img_padded[y:y + tile_size, x:x + tile_size]

                if p1 is not None and p99 is not None and p99 > p1:
                    patch_norm = np.clip((patch - p1) / (p99 - p1 + 1e-8), 0.0, 1.0)
                else:
                    # Fallback: per-patch percentile normalization
                    patch_p1 = float(np.percentile(patch, 1))
                    patch_p99 = float(np.percentile(patch, 99))
                    if patch_p99 > patch_p1:
                        patch_norm = np.clip((patch - patch_p1) / (patch_p99 - patch_p1 + 1e-8), 0.0, 1.0)
                    else:
                        patch_norm = np.zeros_like(patch)

                patch_t = torch.tensor(patch_norm, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    if use_tta:
                        probs_t = self.predict_patch_tta(patch_t)
                    else:
                        probs_t = torch.softmax(self.model(patch_t), dim=1)

                probs_np = probs_t[0].permute(1, 2, 0).cpu().numpy() # (256, 256, 4)

                # Weight-blend into accumulator
                for c in range(4):
                    prob_accum[y:y + tile_size, x:x + tile_size, c] += probs_np[:, :, c] * g_window
                weight_accum[y:y + tile_size, x:x + tile_size] += g_window

        # Normalize by blended weights and unpad
        weight_accum = np.maximum(weight_accum, 1e-8)
        for c in range(4):
            prob_accum[:, :, c] /= weight_accum

        full_probs = prob_accum[:h, :w, :]
        return full_probs

    def detect_spill(self, sar_scene_path, threshold=0.40):
        """
        Run high-precision oil spill detection on a SAR scene:
          1. Sliding-window tiled prediction with Gaussian blending & TTA
          2. Precision-Recall calibrated thresholding
          3. Morphological closing to bridge broken slick trails
          4. Douglas-Peucker polygon simplification
          5. Bonn Agreement volumetric estimation
        """
        if not self.model_loaded:
            raise RuntimeError("Model weights not found. Cannot run detection.")

        with rasterio.open(sar_scene_path) as src:
            image = src.read(1)
            transform = src.transform
            crs = src.crs

        orig_shape = image.shape
        # Compute scene-wide 1st/99th percentiles once so uniform tiles
        # (all sea or all slick) are not stretched into false-positive seams.
        p1 = float(np.percentile(image, 1))
        p99 = float(np.percentile(image, 99))
        full_probs = self.tiled_predict(image, tile_size=256, overlap=0.5, use_tta=True,
                                        p1=p1, p99=p99)

        spill_prob_orig = full_probs[:, :, 1]
        ship_prob_orig = full_probs[:, :, 3]

        # Calibrated decision thresholding with ship suppression
        spill_mask = ((spill_prob_orig >= threshold) & (ship_prob_orig < 0.35)).astype(np.uint8)

        # Morphological smoothing to bridge thin linear streaks and remove salt-and-pepper voids
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        spill_mask = cv2.morphologyEx(spill_mask, cv2.MORPH_CLOSE, kernel_close)

        # If no spill detected
        if np.sum(spill_mask) == 0:
            return {"type": "FeatureCollection", "features": []}

        features = []

        # Vectorize mask to polygons
        for geom, val in shapes(spill_mask, mask=(spill_mask == 1), transform=transform):
            poly = shape(geom)

            # Filter small noise polygons (< 0.05 km2 threshold)
            if poly.area < 0.00005:
                continue

            # Topological simplification: Ramer-Douglas-Peucker algorithm
            poly_clean = poly.simplify(tolerance=0.0004, preserve_topology=True)
            if not poly_clean.is_valid:
                poly_clean = poly_clean.buffer(0)
            if poly_clean.is_empty:
                continue

            # Guard against degenerate geometries that lack .exterior
            rect = poly_clean.minimum_rotated_rectangle
            if not hasattr(rect, 'exterior') or rect.type == 'Point':
                continue

            centroid = poly_clean.centroid

            # Precise geodesic area in km2 on WGS84 ellipsoid (if georeferenced) or native 10m pixel area
            area_km2 = None
            if -90.0 <= centroid.y <= 90.0 and -180.0 <= centroid.x <= 180.0:
                try:
                    from pyproj import Geod
                    geod = Geod(ellps="WGS84")
                    geod_area, _ = geod.geometry_area_perimeter(poly_clean)
                    if not np.isnan(geod_area):
                        area_km2 = abs(geod_area) / 1e6
                except Exception:
                    pass

            if area_km2 is None or np.isnan(area_km2):
                # 10m x 10m Sentinel-1 ground sample distance: 100 m2 = 0.0001 km2 per pixel
                area_km2 = float(poly_clean.area * 0.0001)

            # Minimum area cutoff (0.05 km2 = 500 pixels)
            if area_km2 < 0.05:
                continue

            # Orientation and elongation using minimum rotated rectangle
            coords = list(rect.exterior.coords)
            edge1 = np.linalg.norm(np.array(coords[0]) - np.array(coords[1]))
            edge2 = np.linalg.norm(np.array(coords[1]) - np.array(coords[2]))

            length = max(edge1, edge2)
            width = min(edge1, edge2)
            elongation = length / (width + 1e-8)

            # Physical age heuristic:
            if elongation > 3.0:
                age_bucket = "fresh"
            elif elongation > 1.8:
                age_bucket = "6-24h"
            else:
                age_bucket = ">24h"

            # Calculate polygon-specific confidence cropped to polygon bounding box (F-009)
            clean_geom = mapping(poly_clean)
            try:
                minx, miny, maxx, maxy = poly_clean.bounds
                # Convert geographic bounds to pixel window
                inv_transform = ~transform
                c_min, r_max = inv_transform * (minx, miny)
                c_max, r_min = inv_transform * (maxx, maxy)

                r0 = max(0, int(np.floor(min(r_min, r_max))))
                r1 = min(orig_shape[0], int(np.ceil(max(r_min, r_max))) + 1)
                c0 = max(0, int(np.floor(min(c_min, c_max))))
                c1 = min(orig_shape[1], int(np.ceil(max(c_min, c_max))) + 1)

                if (r1 > r0) and (c1 > c0):
                    window_probs = spill_prob_orig[r0:r1, c0:c1]
                    window_mask = spill_mask[r0:r1, c0:c1]
                    if np.any(window_mask == 1):
                        confidence = float(np.mean(window_probs[window_mask == 1]))
                    else:
                        confidence = float(np.mean(window_probs))
                else:
                    confidence = float(np.mean(spill_prob_orig[spill_mask == 1]))
            except Exception:
                confidence = float(np.mean(spill_prob_orig[spill_mask == 1]))

            # Bonn Agreement Volumetric Estimation (m3):
            # Oil layer thickness ranges:
            # - Sheen / metallic film: ~0.1 - 2.5 um (0.1 - 2.5 m3/km2)
            # - Continuous dark crude emulsion: ~10 - 50 um (10 - 50 m3/km2)
            if confidence > 0.80:
                thickness_um = 12.0 # Heavy emulsion
            elif confidence > 0.65:
                thickness_um = 4.0  # Rainbow / metallic
            else:
                thickness_um = 1.0  # Thin sheen

            est_volume_m3 = round(area_km2 * thickness_um, 2)
            min_volume_m3 = round(area_km2 * 0.1, 2)
            max_volume_m3 = round(area_km2 * 45.0, 2)

            feature = {
                "type": "Feature",
                "geometry": clean_geom,
                "properties": {
                    "area_km2": round(float(area_km2), 3),
                    "centroid": [round(centroid.x, 5), round(centroid.y, 5)],
                    "elongation_ratio": round(float(elongation), 2),
                    "confidence": round(confidence, 3),
                    "timestamp": "2024-01-15T06:00:00Z",
                    "age_bucket": age_bucket,
                    "volume_m3": est_volume_m3,
                    "volume_range_m3": [min_volume_m3, max_volume_m3],
                    "thickness_um_est": thickness_um,
                    "bonn_agreement_code": "Code 3 (Metallic/Continuous)" if thickness_um > 5.0 else "Code 2 (Rainbow/Sheen)"
                }
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

# Singleton instance
detector = None

def get_detector():
    global detector
    if detector is None:
        detector = SpillDetector()
    return detector
