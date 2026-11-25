"""Apply 019_shop_worksheets_admin.sql via Supabase PostgREST isn't possible.
Try DATABASE_URL with psycopg if present; else probe tables with service role.
"""
from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = ROOT / ".env.local"
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def rest(url: str, key: str, method: str, path: str, body: dict | None = None):
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(
        f"{url.rstrip('/')}{path}",
        data=data,
        method=method,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as res:
            return res.status, res.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main() -> None:
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    db = env.get("DATABASE_URL") or env.get("SUPABASE_DB_URL") or env.get("POSTGRES_URL")
    print("db_url_present", bool(db))
    if db:
        try:
            import psycopg  # type: ignore

            sql = (ROOT / "supabase/migrations/019_shop_worksheets_admin.sql").read_text(
                encoding="utf-8"
            )
            with psycopg.connect(db) as conn:
                conn.execute(sql)
                conn.commit()
            print("APPLIED via psycopg")
            return
        except Exception as exc:
            print("psycopg failed", exc)

    # Probe whether tables already exist
    for table in ("shop_products", "printable_worksheets"):
        code, body = rest(url, key, "GET", f"/rest/v1/{table}?select=id&limit=1")
        print(table, code, body[:180].replace("\n", " "))


if __name__ == "__main__":
    main()
