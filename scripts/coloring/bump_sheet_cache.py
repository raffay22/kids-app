from pathlib import Path
import re

p = Path(__file__).resolve().parents[2] / "utils" / "coloringSheets.ts"
t = p.read_text(encoding="utf-8")
t2 = re.sub(
    r'(src: "/coloring/sheets/[^"]+?)(?:\?[^"]*)?(")',
    r"\1?v=autofit2\2",
    t,
)
p.write_text(t2, encoding="utf-8")
print("updated", t2.count("?v=autofit2"))
