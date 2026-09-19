import os
import re

print("=== HUNT FOR BLUFF-HIDING PATTERNS ===")

patterns = {
    "try_except_pass": re.compile(r'except.*:\s*(pass|\.\.\.)'),
    "strict_false": re.compile(r'strict\s*=\s*False'),
    "hardcoded_conf": re.compile(r'confidence.*(=|:)\s*(0\.\d+|[0-9]{2}(\.[0-9]+)?)'),
    "demo_fallback": re.compile(r'(DEMO_DETECTION|DEMO_DRIFT|DEMO_ATTRIBUTION|demo_cache|fallback)'),
}

findings = []

for root, dirs, files in os.walk("."):
    if any(x in root for x in [".git", "node_modules", "audit", ".cache", "__pycache__"]):
        continue
    for f in files:
        if not f.endswith(('.py', '.js', '.jsx', '.ts', '.tsx')):
            continue
        path = os.path.join(root, f)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as file_obj:
                lines = file_obj.readlines()
                for i, line in enumerate(lines):
                    # Check single line or multi-line except pass
                    if "except" in line and i + 1 < len(lines):
                        next_line = lines[i+1].strip()
                        if next_line in ["pass", "..."]:
                            findings.append(("try_except_pass", path, i + 1, f"{line.strip()} -> {next_line}"))
                    for pat_name, pat in patterns.items():
                        if pat_name == "try_except_pass":
                            if pat.search(line):
                                findings.append((pat_name, path, i + 1, line.strip()))
                        else:
                            if pat.search(line):
                                findings.append((pat_name, path, i + 1, line.strip()))
        except Exception:
            pass

print(f"Total bluff / fallback patterns detected: {len(findings)}")
for cat, p, l, text in findings:
    print(f"[{cat}] {p}:{l} -> {text[:120]}")
