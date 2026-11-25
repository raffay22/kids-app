#!/usr/bin/env python3
"""
Build colouring sheets from existing story covers + phonics stills
(same 3D characters used in bedtime / phonics videos).

Converts colourful 3D renders into bold black pencil-style line art
suitable for the Colouring Board flood-fill (clean closed regions).
"""

from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
TS = ROOT / "utils" / "coloringSheets.ts"
ASSETS = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")

W, H = 900, 1200

# Keep the screenshot-quality sheets the parent already approved
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

# Story / phonics characters → new colouring pages (original app art only)
SOURCES = [
    {
        "id": "10-turtle-reef",
        "title": "Turtle Reef Friend",
        "emoji": "🐢",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_01" / "cover.jpg",
        "crop": None,
    },
    {
        "id": "11-duckling-pond",
        "title": "Duckling Pond",
        "emoji": "🦆",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_07" / "cover.jpg",
        "crop": None,
    },
    {
        "id": "12-bee-blossom",
        "title": "Bee Blossom",
        "emoji": "🐝",
        "category": "stories",
        "path": ASSETS / "bella-cover.jpg",
        "crop": None,
    },
    {
        "id": "13-butterfly-bloom",
        "title": "Butterfly Bloom",
        "emoji": "🦋",
        "category": "phonics",
        "path": ASSETS / "b4_butterfly_still.jpg",
        "crop": None,
    },
    {
        "id": "14-apple-buddy",
        "title": "Apple Buddy",
        "emoji": "🍎",
        "category": "phonics",
        "path": ASSETS / "a1_apple_still.jpg",
        "crop": None,
    },
    {
        "id": "15-bear-hug",
        "title": "Bear Hug",
        "emoji": "🐻",
        "category": "phonics",
        "path": ASSETS / "b3_bear_still.jpg",
        "crop": None,
    },
    {
        "id": "16-banana-smile",
        "title": "Banana Smile",
        "emoji": "🍌",
        "category": "phonics",
        "path": ASSETS / "b5_banana_still.jpg",
        "crop": None,
    },
    {
        "id": "17-barnaby-day",
        "title": "Barnaby Day",
        "emoji": "🦊",
        "category": "stories",
        "path": ASSETS / "barnaby-s1.jpg",
        "crop": None,
    },
    {
        "id": "18-story-hop",
        "title": "Garden Hop",
        "emoji": "🐇",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_08" / "cover.jpg",
        "crop": None,
    },
    {
        "id": "19-story-swing",
        "title": "Swing Time",
        "emoji": "🌳",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_11" / "cover.jpg",
        "crop": None,
    },
    {
        "id": "20-story-splash",
        "title": "Splash Play",
        "emoji": "💧",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_09" / "cover.jpg",
        "crop": None,
    },
    {
        "id": "21-story-roll",
        "title": "Roll Along",
        "emoji": "🎈",
        "category": "stories",
        "path": ROOT / "public" / "stories" / "story_toddler_10" / "cover.jpg",
        "crop": None,
    },
]


def fit_canvas(rgb: np.ndarray) -> np.ndarray:
    img = Image.fromarray(rgb)
    img = ImageOps.contain(img, (W, H), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (W, H), (255, 255, 255))
    canvas.paste(img, ((W - img.size[0]) // 2, (H - img.size[1]) // 2))
    return np.array(canvas)


def to_pencil_line_art(bgr: np.ndarray) -> np.ndarray:
    """Cel-outline style: quantize colours → region borders → thick black lines."""
    h, w = bgr.shape[:2]
    # Soften texture / fur noise but keep silhouette
    soft = cv2.bilateralFilter(bgr, d=9, sigmaColor=60, sigmaSpace=60)
    soft = cv2.bilateralFilter(soft, d=9, sigmaColor=60, sigmaSpace=60)

    # Quantize to few flat colours (kawaii cel look)
    data = soft.reshape((-1, 3)).astype(np.float32)
    k = 8
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(data, k, None, criteria, 3, cv2.KMEANS_PP_CENTERS)
    centers = np.uint8(centers)
    quantized = centers[labels.flatten()].reshape(soft.shape)

    # Borders between colour regions
    lab = labels.reshape(h, w).astype(np.int32)
    edges = np.zeros((h, w), np.uint8)
    edges[:-1, :] |= (lab[:-1, :] != lab[1:, :]).astype(np.uint8) * 255
    edges[:, :-1] |= (lab[:, :-1] != lab[:, 1:]).astype(np.uint8) * 255

    # Also add Canny on luminance for facial / detail lines (lightly)
    gray = cv2.cvtColor(quantized, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    canny = cv2.Canny(gray, 60, 140)
    edges = cv2.bitwise_or(edges, canny)

    # Clean speckles, keep closed outlines
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
    edges = cv2.dilate(edges, kernel, iterations=1)  # thicker pencil
    # Remove tiny noise blobs
    num, labels_cc, stats, _ = cv2.connectedComponentsWithStats((edges > 0).astype(np.uint8), 8)
    cleaned = np.zeros_like(edges)
    min_area = max(40, (h * w) // 80000)
    for i in range(1, num):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            cleaned[labels_cc == i] = 255

    # Black lines on white
    page = np.full((h, w), 255, np.uint8)
    page[cleaned > 0] = 0

    # Optional: fill outer background noise by flooding from corners if mostly white
    # Keep as-is for flood-fill colouring (closed regions matter more than perfect silence)

    return cv2.cvtColor(page, cv2.COLOR_GRAY2RGB)


def convert_one(src: Path, out_name: str) -> Path | None:
    if not src.exists():
        print(f"  MISS {src}")
        return None
    bgr = cv2.imread(str(src))
    if bgr is None:
        print(f"  BAD {src}")
        return None
    # Focus on subject: mild center crop removes soft bokeh edges
    h, w = bgr.shape[:2]
    m = int(min(h, w) * 0.04)
    bgr = bgr[m : h - m, m : w - m]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    canvas = fit_canvas(rgb)
    line = to_pencil_line_art(cv2.cvtColor(canvas, cv2.COLOR_RGB2BGR))
    out = OUT / f"{out_name}.png"
    Image.fromarray(line).save(out, "PNG", optimize=True)
    print(f"  OK {out.name} {out.stat().st_size // 1024}KB")
    return out


def write_catalog(sheets: list[dict]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
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


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheets: list[dict] = []

    print("Keeping approved screenshot sheets…")
    for sid, title, emoji, cat in KEEP:
        p = OUT / f"{sid}.png"
        if p.exists():
            sheets.append(
                {
                    "id": sid,
                    "title": title,
                    "emoji": emoji,
                    "category": cat,
                    "src": f"/coloring/sheets/{sid}.png",
                }
            )
            print(f"  KEEP {sid}.png")
        else:
            print(f"  WARN missing keep {sid}")

    print("Converting story / phonics 3D art → pencil line art…")
    for job in SOURCES:
        ok = convert_one(Path(job["path"]), job["id"])
        if ok:
            sheets.append(
                {
                    "id": job["id"],
                    "title": job["title"],
                    "emoji": job["emoji"],
                    "category": job["category"],
                    "src": f"/coloring/sheets/{job['id']}.png",
                }
            )

    write_catalog(sheets)
    print(f"DONE catalog={len(sheets)}")


if __name__ == "__main__":
    main()
