import json
import os
import re
import difflib

# 1. Inspect notebooks/train_unet.ipynb
nb_path = os.path.join("notebooks", "train_unet.ipynb")
with open(nb_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

print("=== NOTEBOOK INSPECTION ===")
print("Notebook keys:", list(nb.keys()))
print("Number of cells:", len(nb.get("cells", [])))

cell_summary = []
for idx, cell in enumerate(nb.get("cells", [])):
    cell_type = cell.get("cell_type")
    exec_count = cell.get("execution_count")
    outputs = cell.get("outputs", [])
    has_outputs = len(outputs) > 0
    source = "".join(cell.get("source", []))
    output_texts = []
    for out in outputs:
        if "text" in out:
            output_texts.append("".join(out["text"]))
        elif "data" in out:
            output_texts.append(str(out["data"].keys()))
        elif "traceback" in out:
            output_texts.append("TRACEBACK: " + "".join(out["traceback"]))
    print(f"\n--- Cell {idx} ({cell_type}, exec_count={exec_count}) ---")
    print(f"Source preview:\n{source[:200]}...")
    if has_outputs:
        print(f"Outputs count: {len(outputs)}")
        print(f"Output text:\n{''.join(output_texts)[:300]}")
    else:
        print("Outputs: NONE")

# 2. Check production weight loading in backend/detection/detector.py
print("\n=== PRODUCTION WEIGHT LOADING IN backend/detection/detector.py ===")
det_path = os.path.join("backend", "detection", "detector.py")
with open(det_path, "r", encoding="utf-8") as f:
    det_lines = f.readlines()

for i, line in enumerate(det_lines):
    if any(keyword in line for keyword in ["load_state_dict", "torch.load", "weights", "strict", "except", "try:"]):
        # print surrounding context
        start = max(0, i - 3)
        end = min(len(det_lines), i + 4)
        print(f"\nContext around line {i+1}:")
        for j in range(start, end):
            print(f"{j+1:4d}: {det_lines[j].rstrip()}")
        print("-" * 40)
