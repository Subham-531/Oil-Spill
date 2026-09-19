import os
import re

terms = ["iou", "dice", "f1", "confusion_matrix", "accuracy", "loss_history"]
pattern = re.compile(r'\b(' + '|'.join(terms) + r')\b', re.IGNORECASE)

valid_extensions = ('.py', '.md', '.json', '.txt', '.ipynb', '.js', '.jsx', '.html', '.css', '.yaml', '.yml')

findings = []
for root, dirs, files in os.walk("."):
    if any(x in root for x in [".git", ".venv", "audit", "node_modules", ".cache", "__pycache__", "data"]):
        continue
    for f in files:
        if not f.endswith(valid_extensions):
            continue
        path = os.path.join(root, f)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as file_obj:
                for idx, line in enumerate(file_obj, 1):
                    match = pattern.search(line)
                    if match:
                        findings.append((path, idx, match.group(0), line.strip()[:140]))
        except Exception:
            pass

print(f"Total matching lines found in code/docs: {len(findings)}")
for p, l, m, txt in findings:
    safe_txt = txt.encode("ascii", errors="replace").decode("ascii")
    print(f"{p}:{l} [{m}] -> {safe_txt}")
