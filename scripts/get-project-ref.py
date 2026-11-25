from pathlib import Path

env = {}
for line in Path(".env.local").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k.strip()] = v.strip().strip('"').strip("'")

url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
# https://xxxx.supabase.co
host = url.replace("https://", "").replace("http://", "").split("/")[0]
ref = host.split(".")[0] if host else ""
print("ref", ref)
print("host", host)
