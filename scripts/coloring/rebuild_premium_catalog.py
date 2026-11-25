#!/usr/bin/env python3
"""
Rebuild colouring catalog:
- KEEP screenshot-quality kawaii/princess refs
- CONVERT user 3D scene refs → B&W line art (no copyrighted cartoons)
- DELETE weak Pillow geometric sheets
- Ready for Gemini when quota returns: generate_gemini_sheets.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
TS = ROOT / "utils" / "coloringSheets.ts"
REF = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")

W, H = 900, 1200

# High-quality kawaii / princess colouring references (original themes)
KAWAII_REFS = [
    ("image-90238a99-7c9d-4fd4-9fbe-cde99ba26f48.png", "01-boba-cup", "Kawaii Boba Tea", "🧋", "treats"),
    ("image-bd535e6d-441b-419a-9b7e-f7e770849ced.png", "02-summer-treats", "Summer Treats Rainbow", "🌈", "treats"),
    ("image-9a8ad283-93bf-4588-931b-fb6591b8b00b.png", "03-park-slide", "Park Slide Adventure", "🏞️", "park"),
    ("image-26b9a92c-6bd2-431f-aee2-074c866da29e.png", "04-fruit-friends", "Smiley Fruit Friends", "🍓", "fruits"),
    ("image-749e1bba-bbb5-4849-922d-fdb66ac7373c.png", "05-apple-basket", "Apple Basket Buddies", "🧺", "fruits"),
    ("image-e371f6ea-8e40-4663-9752-c5c9881f5f62.png", "06-woven-fruit", "Woven Fruit Basket", "🍎", "fruits"),
    ("image-2ee7f65b-578f-4f22-9714-3dff5d0199df.png", "07-princess-sparkle", "Sparkle Princess Doll", "✨", "dolls"),
    ("image-3318428a-4494-4938-bdb8-d8865cf4a66d.png", "08-princess-garden", "Princess Garden Walk", "🌷", "dolls"),
    ("image-f8ca4f87-e4f5-4659-a2d9-6987b93e95ef.png", "09-princess-park", "Princess Park Stroll", "👸", "dolls"),
]

# Extra scene refs only if they convert cleanly to kid colouring outlines.
# (Photo/CGI edge traces are usually too noisy for toddlers — skipped.)
SCENE_3D: list[tuple] = []



def binarize(img: Image.Image, threshold: int = 170) -> Image.Image:
    g = ImageOps.grayscale(img.convert("RGB"))
    g = ImageEnhance.Contrast(g).enhance(1.6)
    g = g.filter(ImageFilter.SHARPEN)
    return g.point(lambda p: 0 if p < threshold else 255, mode="L").convert("RGB")


def to_line_art_from_render(img: Image.Image) -> Image.Image:
    """Turn a colorful 3D render into bold colouring-page outlines."""
    g = ImageOps.grayscale(img.convert("RGB"))
    g = ImageEnhance.Contrast(g).enhance(2.0)
    # Find edges then invert so lines are black on white
    edges = g.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.invert(edges)
    edges = ImageEnhance.Contrast(edges).enhance(2.5)
    # Threshold
    bw = edges.point(lambda p: 0 if p < 200 else 255, mode="L")
    # Slight thicken via MinFilter (erode white → thicker black)
    bw = bw.filter(ImageFilter.MinFilter(3))
    return bw.convert("RGB")


def fit_canvas(img: Image.Image) -> Image.Image:
    img = ImageOps.contain(img, (W, H), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (W, H), (255, 255, 255))
    canvas.paste(img, ((W - img.size[0]) // 2, (H - img.size[1]) // 2))
    return canvas


def import_kawaii(src: Path, out_name: str) -> Path:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    img = img.crop((0, 0, w, int(h * 0.96)))  # crop watermark strip
    canvas = fit_canvas(img)
    out = OUT / f"{out_name}.png"
    binarize(canvas, 175).save(out, "PNG", optimize=True)
    return out


def import_scene(src: Path, out_name: str) -> Path:
    img = Image.open(src).convert("RGB")
    line = to_line_art_from_render(img)
    canvas = fit_canvas(line)
    out = OUT / f"{out_name}.png"
    canvas.save(out, "PNG", optimize=True)
    return out


def write_catalog(sheets: list):
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(
            {
                "generatedBy": "scripts/coloring/rebuild_premium_catalog.py",
                "count": len(sheets),
                "sheets": sheets,
                "note": "Premium refs kept. Weak Pillow sheets removed. Run generate_gemini_sheets.py when Gemini image quota is available.",
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    TS.write_text(
        "\n".join(
            [
                "/** Premium colouring sheets only (screenshot-quality + 3D line-art). */",
                "export type ColoringSheet = {",
                "  id: string;",
                "  title: string;",
                "  emoji: string;",
                "  category: string;",
                "  src: string;",
                "};",
                "",
                "export const COLORING_SHEETS: ColoringSheet[] = "
                + json.dumps(sheets, indent=2)
                + ";",
                "",
                "export function getColoringSheet(id: string) {",
                "  return COLORING_SHEETS.find((s) => s.id === id);",
                "}",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    # Wipe previous generated sheets
    for p in OUT.glob("*.png"):
        p.unlink()

    sheets = []
    print("Importing premium kawaii / princess sheets…")
    for file, sid, title, emoji, cat in KAWAII_REFS:
        src = REF / file
        if not src.exists():
            print("  missing", file)
            continue
        path = import_kawaii(src, sid)
        print("  OK", path.name, f"{path.stat().st_size // 1024}KB")
        sheets.append(
            {
                "id": sid,
                "title": title,
                "emoji": emoji,
                "category": cat,
                "src": f"/coloring/sheets/{sid}.png",
            }
        )

    print("Converting 3D scene refs → line art…")
    for file, sid, title, emoji, cat in SCENE_3D:
        src = REF / file
        if not src.exists():
            print("  missing", file)
            continue
        path = import_scene(src, sid)
        print("  OK", path.name, f"{path.stat().st_size // 1024}KB")
        sheets.append(
            {
                "id": sid,
                "title": title,
                "emoji": emoji,
                "category": cat,
                "src": f"/coloring/sheets/{sid}.png",
            }
        )

    write_catalog(sheets)
    print("DONE", len(sheets), "premium sheets (no copyrighted cartoons)")


if __name__ == "__main__":
    main()
