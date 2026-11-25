import os
from pathlib import Path
from google import genai

env = Path(r"D:\kids-learning-app\.env.local").read_text(encoding="utf-8")
for line in env.splitlines():
    if line.startswith("GEMINI_API_KEY="):
        os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip()

ai = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
try:
    r = ai.models.generate_content(model="gemini-2.5-flash", contents="Reply with exactly OK")
    print("text_ok", (r.text or "")[:40])
except Exception as e:
    print("text_fail", type(e).__name__, str(e)[:300])

try:
    for m in ai.models.list():
        name = getattr(m, "name", "") or ""
        if "image" in name.lower() or "imagen" in name.lower():
            print("model", name)
except Exception as e:
    print("list_fail", str(e)[:300])
