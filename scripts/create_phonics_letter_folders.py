#!/usr/bin/env python3
"""
Create empty letter folders inside the Supabase `phonics` bucket.

Default: H–Z (A–G already created manually).
Does NOT upload phonics media — only tiny folder markers.

  python scripts/create_phonics_letter_folders.py
  python scripts/create_phonics_letter_folders.py --from H --to Z
  python scripts/create_phonics_letter_folders.py --all
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_storage import client, ensure_bucket, request  # noqa: E402

BUCKET = "phonics"
PLACEHOLDER = ".emptyFolderPlaceholder"


def letters_between(start: str, end: str) -> list[str]:
    a, b = start.upper(), end.upper()
    if len(a) != 1 or len(b) != 1 or not a.isalpha() or not b.isalpha() or a > b:
        raise SystemExit(f"Invalid range {start}-{end}; use A–Z")
    return [chr(c) for c in range(ord(a), ord(b) + 1)]


def put_placeholder(base: str, key: str, ctx, letter: str) -> str:
    object_path = f"{letter}/{PLACEHOLDER}"
    body = b""
    headers = {
        "Content-Type": "application/octet-stream",
        "x-upsert": "true",
        "cache-control": "3600",
    }
    code, resp = request(
        "POST",
        f"{base}/storage/v1/object/{BUCKET}/{object_path}",
        key,
        ctx,
        data=body,
        headers=headers,
        timeout=60,
    )
    if code >= 400:
        code, resp = request(
            "PUT",
            f"{base}/storage/v1/object/{BUCKET}/{object_path}",
            key,
            ctx,
            data=body,
            headers=headers,
            timeout=60,
        )
    if code >= 400:
        text = resp.decode("utf-8", errors="replace")
        if "already exists" in text.lower() or "duplicate" in text.lower():
            return "keep"
        raise RuntimeError(f"HTTP {code}: {text[:300]}")
    return "ok"


def main() -> None:
    parser = argparse.ArgumentParser(description="Create phonics letter folders in Supabase")
    parser.add_argument("--from", dest="start", default="H", help="First letter (default H)")
    parser.add_argument("--to", dest="end", default="Z", help="Last letter (default Z)")
    parser.add_argument("--all", action="store_true", help="Create A–Z")
    args = parser.parse_args()

    start, end = ("A", "Z") if args.all else (args.start, args.end)
    letters = letters_between(start, end)

    base, key, ctx = client()
    ensure_bucket(base, key, ctx, BUCKET, public=True)

    ok = keep = fail = 0
    for letter in letters:
        try:
            result = put_placeholder(base, key, ctx, letter)
            if result == "keep":
                print(f"KEEP  {letter}/")
                keep += 1
            else:
                print(f"OK    {letter}/")
                ok += 1
        except Exception as e:
            print(f"FAIL  {letter}/  {e}")
            fail += 1

    print(f"\nDone. created={ok} kept={keep} failed={fail} (letters {start}–{end})")
    print("No phonics media was uploaded — folders only.")
    if fail:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
