#!/usr/bin/env python3
"""
Upload CDN media:
  public/puzzle-stills/*     → bucket puzzle-stills
  public/flashcards/verbs/*  → bucket verbs
Also ensures public bucket `flashcards` exists (placeholder only).

  python -u scripts/upload_puzzle_stills_and_verbs.py
  python -u scripts/upload_puzzle_stills_and_verbs.py --stills-only
  python -u scripts/upload_puzzle_stills_and_verbs.py --verbs-only
  python -u scripts/upload_puzzle_stills_and_verbs.py --one
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_storage import client, ensure_bucket, request, upload_many  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stills-only", action="store_true")
    parser.add_argument("--verbs-only", action="store_true")
    parser.add_argument("--one", action="store_true")
    args = parser.parse_args()

    base, key, ctx = client()
    ensure_bucket(base, key, ctx, "puzzle-stills", public=True)
    ensure_bucket(base, key, ctx, "verbs", public=True)
    ensure_bucket(base, key, ctx, "flashcards", public=True)

    # Keep flashcards bucket visible even before misc uploads.
    code, _ = request(
        "POST",
        f"{base}/storage/v1/object/flashcards/.emptyFolderPlaceholder",
        key,
        ctx,
        data=b"",
        headers={
            "Content-Type": "application/octet-stream",
            "x-upsert": "true",
            "cache-control": "3600",
        },
        timeout=60,
    )
    print(f"flashcards placeholder HTTP {code}", flush=True)

    if not args.verbs_only:
        stills_dir = ROOT / "public" / "puzzle-stills"
        still_jobs: list[tuple[str, Path]] = []
        if stills_dir.exists():
            for f in sorted(stills_dir.iterdir()):
                if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                    still_jobs.append((f.name, f))
        print(f"puzzle-stills jobs={len(still_jobs)}", flush=True)
        upload_many(
            "puzzle-stills",
            still_jobs,
            ROOT / "media" / "cdn" / "puzzle-stills-manifest.json",
            one=args.one,
        )

    if not args.stills_only:
        verbs_dir = ROOT / "public" / "flashcards" / "verbs"
        verb_jobs: list[tuple[str, Path]] = []
        if verbs_dir.exists():
            for f in sorted(verbs_dir.iterdir()):
                if f.suffix.lower() in {".mp4", ".jpg", ".jpeg", ".png", ".webp"}:
                    verb_jobs.append((f.name, f))
        print(f"verbs jobs={len(verb_jobs)}", flush=True)
        upload_many(
            "verbs",
            verb_jobs,
            ROOT / "media" / "cdn" / "verbs-manifest.json",
            one=args.one,
        )


if __name__ == "__main__":
    main()
