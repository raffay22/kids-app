#!/usr/bin/env python3
"""
Turn existing story covers + phonics stills (same 3D characters as videos)
into clean pencil colouring sheets: remove background, bold outlines, white page.
"""

from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps
from rembg import new_session, remove

# Smaller/faster model than default bria-rmbg (1GB)
_SESSION = None


def _session():
    global _SESSION
    if _SESSION is None:
        _SESSION = new_session("u2net")
    return _SESSION

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
TS = ROOT / "utils" / "coloringSheets.ts"
ASSETS = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")
W, H = 900, 1200

KEEP = [
    ("01-boba-cup", "Kawaii Boba Tea", "🧋", "treats"),
    ("02-summer-treats", "Summer Treats Rainbow", "🌈", "treats"),
    ("03-park-slide", "Park Slide Adventure", "🏞️", "park"),
    ("04-fruit-friends", "Smiley Fruit Friends", "🍓", "fruits"),
    ("05-apple-basket", "Apple Basket Buddies", "🧺", "fruits"),
    ("06-woven-fruit", "Woven Fruit Basket", "🍎", "fruits"),
    ("07-princess-sparkle", "Sparkle Princess Doll", "✨", "dolls"),
    ("08-princess-garden", "Princess Garden Walk", "🌷", "dolls"),
    ("09-princess-park", "Princess Park Stroll", "👸", "dolls"),
]

JOBS = [
    ("10-turtle-reef", "Turtle Reef Friend", "🐢", "stories", ROOT / "public/stories/story_toddler_01/cover.jpg"),
    ("11-duckling-pond", "Duckling Pond", "🦆", "stories", ROOT / "public/stories/story_toddler_07/cover.jpg"),
    ("12-bee-blossom", "Bee Blossom", "🐝", "stories", ASSETS / "bella-cover.jpg"),
    ("13-butterfly-bloom", "Butterfly Bloom", "🦋", "phonics", ASSETS / "b4_butterfly_still.jpg"),
    ("14-apple-buddy", "Apple Buddy", "🍎", "phonics", ASSETS / "a1_apple_still.jpg"),
    ("15-bear-hug", "Bear Hug", "🐻", "phonics", ASSETS / "b3_bear_still.jpg"),
    ("16-banana-smile", "Banana Smile", "🍌", "phonics", ASSETS / "b5_banana_still.jpg"),
    ("17-barnaby-day", "Barnaby Day", "🦊", "stories", ASSETS / "barnaby-s1.jpg"),
    ("18-story-hop", "Garden Hop", "🐇", "stories", ROOT / "public/stories/story_toddler_08/cover.jpg"),
    ("19-story-swing", "Swing Time", "🌳", "stories", ROOT / "public/stories/story_toddler_11/cover.jpg"),
    ("20-story-splash", "Splash Play", "💧", "stories", ROOT / "public/stories/story_toddler_09/cover.jpg"),
    ("21-story-roll", "Roll Along", "🎈", "stories", ROOT / "public/stories/story_toddler_10/cover.jpg"),
]


def cutout_rgba(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    # Mild center crop to reduce soft bokeh edges before rembg
    w, h = src.size
    m = int(min(w, h) * 0.03)
    src = src.crop((m, m, w - m, h - m))
    return remove(src, session=_session())


def rgba_to_pencil(rgba: Image.Image) -> Image.Image:
    arr = np.array(rgba)
    alpha = arr[:, :, 3]
    # Strengthen alpha
    mask = (alpha > 40).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=2)
    # Largest blob only
    num, lab, stats, _ = cv2.connectedComponentsWithStats((mask > 0).astype(np.uint8), 8)
    if num > 1:
        keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        mask = np.where(lab == keep, 255, 0).astype(np.uint8)

    bgr = cv2.cvtColor(arr[:, :, :3], cv2.COLOR_RGB2BGR)
    soft = cv2.bilateralFilter(bgr, 9, 80, 80)
    soft = cv2.bitwise_and(soft, soft, mask=(mask > 0).astype(np.uint8))
    white = np.full_like(soft, 255)
    soft = np.where(mask[:, :, None] > 0, soft, white)

    # Quantize subject colours → clean colourable regions
    ys, xs = np.where(mask > 0)
    lab_full = np.zeros(mask.shape, np.int32)
    if len(xs) > 200:
        coords = soft[ys, xs].astype(np.float32)
        kk = 5
        crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0)
        _, labels, _ = cv2.kmeans(coords, kk, None, crit, 4, cv2.KMEANS_PP_CENTERS)
        lab_full[ys, xs] = labels.flatten() + 1

    edges = np.zeros(mask.shape, np.uint8)
    edges[:-1, :] |= (
        (lab_full[:-1, :] != lab_full[1:, :]) & (lab_full[:-1, :] > 0) & (lab_full[1:, :] > 0)
    ).astype(np.uint8) * 255
    edges[:, :-1] |= (
        (lab_full[:, :-1] != lab_full[:, 1:]) & (lab_full[:, :-1] > 0) & (lab_full[:, 1:] > 0)
    ).astype(np.uint8) * 255

    sil = cv2.Canny(mask, 50, 150)
    gray = cv2.GaussianBlur(cv2.cvtColor(soft, cv2.COLOR_BGR2GRAY), (5, 5), 0)
    det = cv2.bitwise_and(cv2.Canny(gray, 70, 150), mask)
    lines = cv2.bitwise_or(cv2.bitwise_or(edges, sil), det)
    lines = cv2.dilate(lines, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), 1)

    # Drop tiny speckles
    num, lab, stats, _ = cv2.connectedComponentsWithStats((lines > 0).astype(np.uint8), 8)
    cleaned = np.zeros_like(lines)
    min_a = max(28, (mask.shape[0] * mask.shape[1]) // 100000)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_a:
            cleaned[lab == i] = 255

    page = np.full(mask.shape, 255, np.uint8)
    page[cleaned > 0] = 0

    # Fit on portrait canvas
    img = Image.fromarray(page).convert("L")
    bbox = ImageOps.invert(img).getbbox()
    if bbox:
        img = ImageOps.expand(img.crop(bbox), border=56, fill=255)
    img = ImageOps.contain(img, (W - 48, H - 48), Image.Resampling.LANCZOS)
    canvas = Image.new("L", (W, H), 255)
    canvas.paste(img, ((W - img.size[0]) // 2, (H - img.size[1]) // 2))
    # Final slight thicken for toddlers
    arr2 = np.array(canvas)
    inv = (arr2 < 128).astype(np.uint8) * 255
    inv = cv2.dilate(inv, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2)), 1)
    return Image.fromarray(np.where(inv > 0, 0, 255).astype(np.uint8)).convert("RGB")


def write_catalog(sheets: list[dict]) -> None:
    MANIFEST.write_text(json.dumps({"sheets": sheets}, indent=2), encoding="utf-8")
    lines = [
        "/** Auto-generated colouring catalog — do not edit by hand. */",
        "export type ColoringSheet = {",
        "  id: string;",
        "  title: string;",
        "  emoji: string;",
        "  category: string;",
        "  src: string;",
        "};",
        "",
        "export const COLORING_SHEETS: ColoringSheet[] = [",
    ]
    for s in sheets:
        lines.append(
            "  {"
            f' id: "{s["id"]}",'
            f' title: "{s["title"]}",'
            f' emoji: "{s["emoji"]}",'
            f' category: "{s["category"]}",'
            f' src: "{s["src"]}"'
            " },"
        )
    lines += ["];", ""]
    TS.write_text("\n".join(lines), encoding="utf-8")
    c_ts = Path(r"C:\Users\dell\kids-learning-app\utils\coloringSheets.ts")
    if c_ts.parent.exists():
        c_ts.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheets: list[dict] = []
    print("Keeping approved screenshot sheets…")
    for sid, title, emoji, cat in KEEP:
        if (OUT / f"{sid}.png").exists():
            sheets.append(
                {"id": sid, "title": title, "emoji": emoji, "category": cat, "src": f"/coloring/sheets/{sid}.png"}
            )
            print(f"  KEEP {sid}")

    print("Cutting out story/phonics characters → pencil pages…")
    for sid, title, emoji, cat, path in JOBS:
        if not path.exists():
            print(f"  MISS {sid}")
            continue
        rgba = cutout_rgba(path)
        pencil = rgba_to_pencil(rgba)
        dest = OUT / f"{sid}.png"
        pencil.save(dest, "PNG", optimize=True)
        sheets.append(
            {"id": sid, "title": title, "emoji": emoji, "category": cat, "src": f"/coloring/sheets/{sid}.png"}
        )
        print(f"  OK {sid} {dest.stat().st_size // 1024}KB")

    write_catalog(sheets)
    print(f"DONE catalog={len(sheets)}")


if __name__ == "__main__":
    main()
