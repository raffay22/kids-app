#!/usr/bin/env python3
"""
Crop ink content and enlarge onto a full 900×1200 colouring page.
Fixes landscape uploads that were only letterboxed (tiny strip in the middle).
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps, ImageChops

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / "public" / "coloring" / "sheets"
W, H = 900, 1200
MARGIN = 36  # keep a small white border like premium sheets

# Names the parent said still look tiny
TARGETS = [
    "doll-1.jpg",
    "cake.jpg",
    "ice-cream-2.jpg",
    "furit-basket.jpg",
    "doll-prinsses.jpg",
    "unicorn.jpg",
    "cat-1.jpg",
    "elephant.jpg",
    "doll-2.jpg",
]


def ink_bbox(img: Image.Image, threshold: int = 245) -> tuple[int, int, int, int] | None:
    """Bounding box of non-white (ink) pixels."""
    g = ImageOps.grayscale(img.convert("RGB"))
    # Anything darker than near-white counts as content
    mask = g.point(lambda p: 255 if p < threshold else 0)
    return mask.getbbox()


def autofit(path: Path) -> bool:
    img = Image.open(path).convert("RGB")
    bbox = ink_bbox(img)
    if not bbox:
        print(f"  SKIP {path.name} (no ink found)")
        return False

    # Expand bbox a little so outlines aren't clipped
    x0, y0, x1, y1 = bbox
    pad = 8
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(img.width, x1 + pad)
    y1 = min(img.height, y1 + pad)
    cropped = img.crop((x0, y0, x1, y1))

    # How much of the page was empty before?
    area_before = img.width * img.height
    area_ink = (x1 - x0) * (y1 - y0)
    fill_ratio = area_ink / area_before

    # Scale content to fill most of the portrait page
    fitted = ImageOps.contain(
        cropped,
        (W - MARGIN * 2, H - MARGIN * 2),
        Image.Resampling.LANCZOS,
    )
    page = Image.new("RGB", (W, H), (255, 255, 255))
    page.paste(fitted, ((W - fitted.width) // 2, (H - fitted.height) // 2))

    # Keep extension; always save as JPEG for jpg targets, PNG for png
    if path.suffix.lower() == ".png":
        page.save(path, "PNG", optimize=True)
    else:
        page.save(path, "JPEG", quality=90, optimize=True)

    print(
        f"  OK {path.name} ink={x1-x0}x{y1-y0} fill={fill_ratio:.0%} → {fitted.width}x{fitted.height} on {W}x{H}"
    )
    return True


def main() -> None:
    names = sys.argv[1:] or TARGETS
    # Also autofit any other landscape-looking sheets if --all
    if "--all" in names:
        names = [p.name for p in sorted(DIR.iterdir()) if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]

    print(f"Autofitting {len(names)} sheet(s)…")
    ok = 0
    for name in names:
        if name == "--all":
            continue
        path = DIR / name
        if not path.exists():
            print(f"  MISS {name}")
            continue
        if autofit(path):
            ok += 1
    print(f"DONE ok={ok}")


if __name__ == "__main__":
    main()
