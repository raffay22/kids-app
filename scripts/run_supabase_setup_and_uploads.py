#!/usr/bin/env python3
"""
Fresh Supabase project setup for kids-learning-app:

1) Create storage buckets (exact names used in code)
2) Compress colouring sheets
3) Upload colouring sheets → colour-board
4) Compress phonics + toddler story videos
5) Upload phonics → phonics
6) Upload toddler stories ONLY → story-animations  (skips bedtime / story_moral_*)

Does NOT touch bedtime story code or files.

Usage:
  python scripts/run_supabase_setup_and_uploads.py
  python scripts/run_supabase_setup_and_uploads.py --skip-compress
  python scripts/run_supabase_setup_and_uploads.py --colour-only
  python scripts/run_supabase_setup_and_uploads.py --buckets-only
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from supabase_storage import client, ensure_bucket, list_buckets, upload_many  # noqa: E402


BUCKETS = [
    ("phonics", True),
    ("story-animations", True),
    ("colour-board", True),
    ("brand-ads", True),
    ("worksheets", True),
    ("payment-slips", False),
]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    r = subprocess.run(cmd, cwd=str(ROOT))
    if r.returncode != 0:
        raise SystemExit(r.returncode)


def compress_coloring() -> None:
    # Prefer node script if node_modules ok; else Python Pillow
    node = ROOT / "scripts" / "compress-coloring-sheets.mjs"
    try:
        run(["node", str(node)])
    except SystemExit:
        print("node compress failed — using Pillow")
        _compress_coloring_pillow()


def _compress_coloring_pillow() -> None:
    from PIL import Image

    d = ROOT / "public" / "coloring" / "sheets"
    max_w = 1280
    for p in sorted(d.iterdir()):
        if p.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        before = p.stat().st_size
        # Keep small premium PNGs as PNG
        keep_png = p.suffix.lower() == ".png" and before < 200_000
        img = Image.open(p)
        if keep_png:
            img = img.convert("RGBA") if "A" in img.getbands() else img.convert("RGB")
        else:
            img = img.convert("RGB")
        w, h = img.size
        if w > max_w:
            nh = int(h * (max_w / w))
            img = img.resize((max_w, nh), Image.Resampling.LANCZOS)
        if keep_png:
            img.save(p, "PNG", optimize=True)
            after = p.stat().st_size
            print(f"OK {p.name} (png) {before // 1024}KB → {after // 1024}KB")
            continue
        out = p.with_suffix(".jpg")
        img.save(out, "JPEG", quality=82, optimize=True)
        after = out.stat().st_size
        if out != p and p.exists():
            p.unlink()
        print(f"OK {p.name} → {out.name} {before // 1024}KB → {after // 1024}KB")


def compress_videos() -> None:
    script = ROOT / "scripts" / "compress-story-and-phonics-videos.mjs"
    if script.exists():
        # May fail if node/supabase broken — still try ffmpeg via node script
        r = subprocess.run(["node", str(script)], cwd=str(ROOT))
        if r.returncode != 0:
            print("WARN video compress script exited", r.returncode, "— continuing with existing files")


def jobs_coloring() -> list[tuple[str, Path]]:
    d = ROOT / "public" / "coloring" / "sheets"
    return [
        (p.name, p)
        for p in sorted(d.iterdir())
        if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    ]


def jobs_phonics() -> list[tuple[str, Path]]:
    d = ROOT / "public" / "phonics"
    jobs = []
    if not d.exists():
        return jobs
    for letter in sorted(d.iterdir()):
        if not letter.is_dir():
            continue
        for f in sorted(letter.iterdir()):
            if f.suffix.lower() in {".mp4", ".mp3"}:
                jobs.append((f"{letter.name}/{f.name}", f))
    return jobs


def jobs_toddler_stories() -> list[tuple[str, Path]]:
    d = ROOT / "public" / "stories"
    jobs = []
    if not d.exists():
        return jobs
    for story in sorted(d.iterdir()):
        if not story.is_dir():
            continue
        # SKIP bedtime / moral stories (YouTube later)
        if story.name.startswith("story_moral_") or story.name.startswith("story_bedtime_"):
            continue
        if not story.name.startswith("story_toddler_"):
            # only toddler IQ stories for now
            continue
        for f in sorted(story.iterdir()):
            if f.suffix.lower() in {".mp4", ".mp3", ".jpg", ".jpeg", ".png", ".webp"}:
                jobs.append((f"{story.name}/{f.name}", f))
    return jobs


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--buckets-only", action="store_true")
    ap.add_argument("--colour-only", action="store_true")
    ap.add_argument("--skip-compress", action="store_true")
    ap.add_argument("--one", action="store_true", help="upload one file per bucket (smoke test)")
    args = ap.parse_args()

    base, key, ctx = client()
    print("Supabase:", base)

    print("\n=== Buckets ===")
    for name, public in BUCKETS:
        ensure_bucket(base, key, ctx, name, public=public)
    print("Now:", ", ".join(list_buckets(base, key, ctx)))

    if args.buckets_only:
        return

    if not args.skip_compress:
        print("\n=== Compress colouring sheets ===")
        compress_coloring()
        if not args.colour_only:
            print("\n=== Compress phonics + toddler videos ===")
            compress_videos()

    print("\n=== Upload colour-board ===")
    upload_many(
        "colour-board",
        jobs_coloring(),
        ROOT / "media" / "coloring" / "supabase-upload-manifest.json",
        one=args.one,
    )

    if args.colour_only:
        return

    print("\n=== Upload phonics ===")
    upload_many(
        "phonics",
        jobs_phonics(),
        ROOT / "media" / "phonics" / "supabase-upload-manifest.json",
        one=args.one,
    )

    print("\n=== Upload toddler stories (skip bedtime) ===")
    upload_many(
        "story-animations",
        jobs_toddler_stories(),
        ROOT / "media" / "stories" / "supabase-upload-manifest.json",
        one=args.one,
    )

    print("\nALL MEDIA UPLOADS FINISHED")
    print("Next: apply SQL schema via Supabase SQL Editor → paste supabase/RUN_ALL_IN_SUPABASE.sql")


if __name__ == "__main__":
    main()
