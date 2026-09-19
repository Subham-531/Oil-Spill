import os
import sys
import torch
import ast
import difflib

sys.path.insert(0, os.path.abspath("."))
weights_path = os.path.join("models", "unet_spill_weights.pt")

state_dict = torch.load(weights_path, map_location="cpu", weights_only=True)
print("=== STATE DICT ANALYSIS ===")
print("Total keys in state_dict:", len(state_dict))
print("File size:", os.path.getsize(weights_path))

# Check parameter types and total elements
total_params = sum(v.numel() for v in state_dict.values())
print(f"Total parameter elements: {total_params:,}")

# Import DetectorUNet
from backend.detection.detector import UNet as DetectorUNet

model = DetectorUNet(in_channels=1, out_channels=4)

# Parameters vs buffers
named_params = dict(model.named_parameters())
named_buffers = dict(model.named_buffers())

print(f"DetectorUNet named_parameters count: {len(named_params)}")
print(f"DetectorUNet named_buffers count: {len(named_buffers)}")
print(f"Total named items (params + buffers): {len(named_params) + len(named_buffers)}")

# Reconcile 106 claim:
# In state_dict, are all 106 keys in model?
missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=True)
print(f"load_state_dict strict=True: missing_keys={missing_keys}, unexpected_keys={unexpected_keys}")

# Let's break down the 106 keys:
conv_weights = [k for k in state_dict if "conv" in k and "weight" in k]
conv_biases = [k for k in state_dict if "conv" in k and "bias" in k]
bn_weights = [k for k in state_dict if "bn" in k or "BatchNorm" in k or ("running_" in k or "num_batches" in k)]
print(f"Keys breakdown:")
print(f"  BatchNorm running_mean: {len([k for k in state_dict if 'running_mean' in k])}")
print(f"  BatchNorm running_var: {len([k for k in state_dict if 'running_var' in k])}")
print(f"  BatchNorm num_batches_tracked: {len([k for k in state_dict if 'num_batches_tracked' in k])}")
print(f"  BatchNorm weight (gamma): {len([k for k in state_dict if ('BatchNorm' in k or 'bn' in k or k.endswith('.weight')) and any(sub in k for sub in ['encoder', 'decoder', 'bottleneck']) and '1.weight' in k or '4.weight' in k])}")
print(f"All 106 keys list:")
for k in state_dict.keys():
    print(" ", k, tuple(state_dict[k].shape), state_dict[k].dtype)

# Compare UNet class AST/code between backend/detection/detector.py and models/train_unet.py
with open("backend/detection/detector.py", "r", encoding="utf-8") as f:
    detector_text = f.read()
with open("models/train_unet.py", "r", encoding="utf-8") as f:
    train_text = f.read()

def extract_unet_code(text):
    lines = text.splitlines()
    start = False
    unet_lines = []
    for line in lines:
        if line.strip().startswith("class UNet("):
            start = True
        elif start and line.strip().startswith("class ") or (start and "def " in line and not line.startswith(" ") and not line.startswith("\t")):
            break
        elif start and (line.strip().startswith("model = ") or line.strip().startswith("class SpillDetector")):
            break
        if start:
            unet_lines.append(line)
    return "\n".join(unet_lines)

unet_det = extract_unet_code(detector_text)
unet_train = extract_unet_code(train_text)

print("\n=== UNet CODE COMPARISON ===")
print("Detector UNet code length:", len(unet_det))
print("Train UNet code length:", len(unet_train))
diff = list(difflib.unified_diff(unet_train.splitlines(), unet_det.splitlines(), lineterm=""))
if diff:
    print("Differences found between Train UNet and Detector UNet:")
    for d in diff[:20]:
        print(d)
else:
    print("Detector UNet and Train UNet are EXACT IDENTICAL CODE.")
