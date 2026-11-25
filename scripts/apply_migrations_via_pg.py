#!/usr/bin/env python3
"""
Apply supabase/RUN_ALL_IN_SUPABASE.sql using DATABASE_URL / SUPABASE_DB_URL.

Add one of these to .env.local (Project Settings → Database → Connection string URI):
  DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres

Usage:
  python scripts/apply_migrations_via_pg.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    path = ROOT / ".env.local"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def main() -> None:
    env = load_env()
    db_url = (
        env.get("DATABASE_URL")
        or env.get("SUPABASE_DB_URL")
        or os.environ.get("DATABASE_URL")
        or os.environ.get("SUPABASE_DB_URL")
        or ""
    )
    sql_path = ROOT / "supabase" / "RUN_ALL_IN_SUPABASE.sql"
    if not sql_path.exists():
        raise SystemExit(f"Missing {sql_path}")

    if not db_url:
        print("No DATABASE_URL in .env.local — cannot apply SQL from here.")
        print("Do this once in Supabase Dashboard → SQL Editor → New query:")
        print(f"  Paste contents of: {sql_path}")
        print("Then re-run uploads if needed.")
        raise SystemExit(2)

    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary…")
        import subprocess

        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
        import psycopg2

    sql = sql_path.read_text(encoding="utf-8")
    print("Connecting…")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            print(f"Executing {sql_path.name} ({len(sql)} chars)…")
            cur.execute(sql)
        print("Migrations applied OK")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
