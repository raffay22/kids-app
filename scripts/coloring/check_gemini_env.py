from pathlib import Path

t = Path(r"D:\kids-learning-app\.env.local").read_text(encoding="utf-8")
for line in t.splitlines():
    if line.strip().startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    k = k.strip()
    v = v.strip().strip('"').strip("'")
    if "GEMINI" in k.upper() or "GOOGLE" in k.upper() or "API" in k.upper():
        print(f"{k}: set={bool(v)} len={len(v)}")
