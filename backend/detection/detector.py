import json
import numpy as np
import cv2
import rasterio
from rasterio.features import shapes
from shapely.geometry import shape, Polygon
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
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            self.model.eval()
            self.model_loaded = True
            print(f"Loaded detection model from {model_path}")
        else:
            print(f"Warning: Model weights not found at {model_path}. Please train the model in Colab and save weights.")

    def preprocess(self, sar_image_path):
        """Mock preprocessing: calibration, speckle filter, land mask, geocode"""
        # In a real scenario, this would use snappy/ESA SNAP or rasterio
        # For this prototype, we'll load the raster directly.
        with rasterio.open(sar_image_path) as src:
            image = src.read(1)
            transform = src.transform
            crs = src.crs
            
        # Resize to standard input if necessary (e.g., 256x256 tiles)
        image_resized = cv2.resize(image, (256, 256))
        
        # Normalize
        image_norm = (image_resized - image_resized.min()) / (image_resized.max() - image_resized.min() + 1e-8)
        
        # Convert to tensor
        tensor = torch.tensor(image_norm, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        
        return tensor.to(self.device), transform, crs, image.shape

    def detect_spill(self, sar_scene_path):
        if not self.model_loaded:
            raise RuntimeError("Model weights not found. Cannot run detection.")
            
        tensor, transform, crs, orig_shape = self.preprocess(sar_scene_path)
        
        with torch.no_grad():
            output = self.model(tensor)
            probs = torch.softmax(output, dim=1)
            
            # Classes: 0: sea, 1: oil_spill, 2: lookalike, 3: ship
            spill_prob = probs[0, 1].cpu().numpy()
            predicted_class = torch.argmax(probs, dim=1).cpu().numpy()[0]
            
        # Extract oil spill mask
        spill_mask = (predicted_class == 1).astype(np.uint8)
        
        # If no spill detected
        if np.sum(spill_mask) == 0:
            return {"type": "FeatureCollection", "features": []}
            
        # Upscale mask back to original size
        spill_mask_orig = cv2.resize(spill_mask, (orig_shape[1], orig_shape[0]), interpolation=cv2.INTER_NEAREST)
        spill_prob_orig = cv2.resize(spill_prob, (orig_shape[1], orig_shape[0]))
        
        features = []
        
        # Vectorize mask to polygons
        for geom, val in shapes(spill_mask_orig, mask=(spill_mask_orig==1), transform=transform):
            poly = shape(geom)
            
            # Filter small noise polygons
            if poly.area < 0.0001: # threshold depends on CRS degrees vs meters
                continue
                
            # Compute properties
            centroid = poly.centroid
            # Approx area in km2 (simplification, real code should reproject to local UTM)
            # 1 degree ~ 111km, so 1 sq deg ~ 12321 km2
            area_km2 = poly.area * 12321 
            
            # Orientation and elongation using minimum rotated rectangle
            rect = poly.minimum_rotated_rectangle
            coords = list(rect.exterior.coords)
            edge1 = np.linalg.norm(np.array(coords[0]) - np.array(coords[1]))
            edge2 = np.linalg.norm(np.array(coords[1]) - np.array(coords[2]))
            
            length = max(edge1, edge2)
            width = min(edge1, edge2)
            elongation = length / (width + 1e-8)
            
            # Age heuristic: highly elongated / fragmented spills are older
            age_bucket = "fresh"
            if elongation > 3.0:
                age_bucket = "6-24h"
            if elongation > 6.0:
                age_bucket = ">24h"
                
            # Average confidence in this polygon
            confidence = float(np.mean(spill_prob_orig[spill_mask_orig == 1]))
            
            feature = {
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "area_km2": float(area_km2),
                    "centroid": [centroid.x, centroid.y],
                    "elongation_ratio": float(elongation),
                    "confidence": confidence,
                    "timestamp": "2024-01-15T06:00:00Z",
                    "age_bucket": age_bucket
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
