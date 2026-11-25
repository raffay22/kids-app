#!/usr/bin/env python3
"""
Create empty toddler story folders in Supabase `story-animations` bucket.

Default: story_toddler_01 … story_toddler_20
Does NOT upload media — folder markers only.

  python scripts/create_story_animation_folders.py
  python scripts/create_story_animation_folders.py --from 1 --to 20
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_storage import client, ensure_bucket, request  # noqa: E402

BUCKET = "story-animations"
PLACEHOLDER = ".emptyFolderPlaceholder"


def put_placeholder(base: str, key: str, ctx, folder: str) -> str:
    object_path = f"{folder}/{PLACEHOLDER}"
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
    parser = argparse.ArgumentParser(description="Create story-animations toddler folders")
    parser.add_argument("--from", dest="start", type=int, default=1)
    parser.add_argument("--to", dest="end", type=int, default=20)
    args = parser.parse_args()
    if args.start < 1 or args.end < args.start:
        raise SystemExit("Invalid range")

    folders = [f"story_toddler_{i:02d}" for i in range(args.start, args.end + 1)]
    base, key, ctx = client()
    ensure_bucket(base, key, ctx, BUCKET, public=True)

    ok = keep = fail = 0
    for folder in folders:
        try:
            result = put_placeholder(base, key, ctx, folder)
            if result == "keep":
                print(f"KEEP  {folder}/")
                keep += 1
            else:
                print(f"OK    {folder}/")
                ok += 1
        except Exception as e:
            print(f"FAIL  {folder}/  {e}")
            fail += 1

    print(f"\nDone. created={ok} kept={keep} failed={fail}")
    print("No story media was uploaded — folders only.")
    if fail:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
