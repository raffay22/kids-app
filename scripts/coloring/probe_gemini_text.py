import os
from pathlib import Path
from google import genai

env = Path(r"D:\kids-learning-app\.env.local").read_text(encoding="utf-8")
for line in env.splitlines():
    if line.startswith("GEMINI_API_KEY="):
        os.environ["GEMINI_API_KEY"] = line.split("=", 1)[1].strip()

ai = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
for model in [
    "gemini-3.8-flash",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
]:
    try:
        r = ai.models.generate_content(model=model, contents="Reply OK only")
        print("OK", model, (r.text or "")[:30])
        break
    except Exception as e:
        print("fail", model, str(e)[:160])
