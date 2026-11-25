from pathlib import Path
import json
import ssl
import urllib.error
import urllib.request

env = {}
for line in Path(".env.local").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k.strip()] = v.strip().strip('"').strip("'")

url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
key = env["SUPABASE_SERVICE_ROLE_KEY"]
ctx = ssl.create_default_context()
req = urllib.request.Request(
    url + "/rest/v1/rpc/exec_sql",
    data=json.dumps({"query": "select 1"}).encode(),
    method="POST",
    headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    },
)
try:
    with urllib.request.urlopen(req, context=ctx, timeout=20) as res:
        print("ok", res.status, res.read()[:200])
except urllib.error.HTTPError as e:
    print("http", e.code, e.read()[:300].decode(errors="replace"))
except Exception as e:
    print("err", type(e).__name__, e)

print("tokenish", [k for k in env if any(x in k.upper() for x in ("TOKEN", "ACCESS", "PAT", "MGMT"))])
