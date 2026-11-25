"""
Apply the phonics/brand-ads list-policy fix by printing SQL for the dashboard,
and attempting any available DB URL.

Public buckets keep serving /storage/v1/object/public/... without a SELECT policy.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL = (ROOT / "supabase/migrations/020_drop_public_bucket_list_policies.sql").read_text(
    encoding="utf-8"
)


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


def main() -> None:
    env = load_env()
    db = (
        env.get("DATABASE_URL")
        or env.get("SUPABASE_DB_URL")
        or env.get("POSTGRES_URL")
        or env.get("DIRECT_URL")
    )
    print("--- SQL to run in Supabase → SQL Editor ---")
    print(SQL)
    print("--- end ---")

    if not db:
        print(
            "No DATABASE_URL in .env.local — paste the SQL above in the dashboard "
            "(Storage → phonics warning will clear after DROP POLICY)."
        )
        return

    try:
        import psycopg  # type: ignore

        with psycopg.connect(db) as conn:
            conn.execute(SQL)
            conn.commit()
        print("APPLIED via psycopg")
    except Exception as exc:
        print("Could not apply automatically:", exc)
        print("Paste the SQL above into Supabase SQL Editor.")


if __name__ == "__main__":
    main()
