#!/usr/bin/env python3
"""
Redraw story covers + phonics stills as pencil colouring pages with Gemini,
matching the premium kawaii/princess line-art style of the parent's screenshots.
Also generates extra original princess/fairy sheets.
"""

from __future__ import annotations

import base64
import json
import os
import time
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
TS = ROOT / "utils" / "coloringSheets.ts"
ASSETS = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")

STYLE_REF = ASSETS / "image-2ee7f65b-578f-4f22-9714-3dff5d0199df.png"
FRUIT_REF = ASSETS / "image-26b9a92c-6bd2-431f-aee2-074c866da29e.png"

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

# App 3D characters → colouring pages (same characters as bedtime/phonics videos)
REDRAW = [
    {
        "id": "10-turtle-reef",
        "title": "Turtle Reef Friend",
        "emoji": "🐢",
        "category": "stories",
        "src": ROOT / "public/stories/story_toddler_01/cover.jpg",
        "hint": "cute sea turtle with shell pattern swimming near coral, bubbles",
    },
    {
        "id": "11-duckling-pond",
        "title": "Duckling Pond",
        "emoji": "🦆",
        "category": "stories",
        "src": ROOT / "public/stories/story_toddler_07/cover.jpg",
        "hint": "fluffy duckling floating on pond with reeds",
    },
    {
        "id": "12-bee-blossom",
        "title": "Bee Blossom",
        "emoji": "🐝",
        "category": "stories",
        "src": ASSETS / "bella-cover.jpg",
        "hint": "cute fuzzy bumblebee hovering over a big flower",
    },
    {
        "id": "13-butterfly-bloom",
        "title": "Butterfly Bloom",
        "emoji": "🦋",
        "category": "phonics",
        "src": ASSETS / "b4_butterfly_still.jpg",
        "hint": "friendly butterfly with segmented wings next to a daisy flower",
    },
    {
        "id": "14-apple-buddy",
        "title": "Apple Buddy",
        "emoji": "🍎",
        "category": "phonics",
        "src": ASSETS / "a1_apple_still.jpg",
        "hint": "cute apple character with stem and leaf",
    },
    {
        "id": "15-bear-hug",
        "title": "Bear Hug",
        "emoji": "🐻",
        "category": "phonics",
        "src": ASSETS / "b3_bear_still.jpg",
        "hint": "cute teddy bear character, simple standing pose",
    },
    {
        "id": "16-banana-smile",
        "title": "Banana Smile",
        "emoji": "🍌",
        "category": "phonics",
        "src": ASSETS / "b5_banana_still.jpg",
        "hint": "cute banana character with smile",
    },
    {
        "id": "17-barnaby-day",
        "title": "Barnaby Day",
        "emoji": "🦊",
        "category": "stories",
        "src": ASSETS / "barnaby-s1.jpg",
        "hint": "cute story animal character from the reference, simplified for toddlers",
    },
]

# Extra original princess / fairy pages (no copyrighted brands)
NEW_PAGES = [
    {
        "id": "18-fairy-garden",
        "title": "Garden Fairy Magic",
        "emoji": "🧚",
        "category": "fantasy",
        "prompt": "Original garden fairy girl with large sparkly wings, flowing dress, star wand, flowers around her, kawaii face, layered dress folds for 3D look.",
    },
    {
        "id": "19-princess-ballgown",
        "title": "Princess Ballgown",
        "emoji": "👗",
        "category": "dolls",
        "prompt": "Original princess doll with long wavy hair, tiara, necklace, voluminous ballgown with ruffles and pleats, big sparkly eyes, four-point sparkles. Not Barbie or Disney.",
    },
    {
        "id": "20-unicorn-meadow",
        "title": "Unicorn Meadow",
        "emoji": "🦄",
        "category": "fantasy",
        "prompt": "Cute magical unicorn with flowing mane and horn in a flower meadow with hearts and sparkles.",
    },
    {
        "id": "21-doll-tea-party",
        "title": "Doll Tea Party",
        "emoji": "🧁",
        "category": "dolls",
        "prompt": "Two cute original fashion dolls at a tea party with teapot, cups and cake, detailed dress folds. Not Barbie.",
    },
]

MODELS = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-lite-image",
]


def load_env():
    for line in (ROOT / ".env.local").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        if k in ("GEMINI_API_KEY", "Gemini API", "GOOGLE_API_KEY"):
            os.environ["GEMINI_API_KEY"] = v


def binarize(img: Image.Image) -> Image.Image:
    g = ImageOps.grayscale(img.convert("RGB"))
    g = g.filter(ImageFilter.SHARPEN)
    return g.point(lambda p: 0 if p < 175 else 255, mode="L").convert("RGB")


def extract_image_bytes(response) -> bytes | None:
    for cand in getattr(response, "candidates", None) or []:
        content = getattr(cand, "content", None)
        for part in getattr(content, "parts", None) or []:
            inline = getattr(part, "inline_data", None) or getattr(part, "inlineData", None)
            if inline is None and isinstance(part, dict):
                inline = part.get("inlineData") or part.get("inline_data")
            if not inline:
                continue
            data = getattr(inline, "data", None)
            if data is None and isinstance(inline, dict):
                data = inline.get("data")
            if not data:
                continue
            return base64.b64decode(data) if isinstance(data, str) else bytes(data)
    return None


def save_page(raw: bytes, out_id: str) -> Path:
    tmp = OUT / f"{out_id}.raw.png"
    tmp.write_bytes(raw)
    img = Image.open(tmp).convert("RGB")
    img = ImageOps.contain(img, (900, 1200), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (900, 1200), (255, 255, 255))
    canvas.paste(img, ((900 - img.size[0]) // 2, (1200 - img.size[1]) // 2))
    dest = OUT / f"{out_id}.png"
    binarize(canvas).save(dest, "PNG", optimize=True)
    tmp.unlink(missing_ok=True)
    return dest


def generate(ai, model: str, parts: list) -> bytes:
    from google.genai import types

    response = ai.models.generate_content(
        model=model,
        contents=parts,
        config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
    )
    raw = extract_image_bytes(response)
    if not raw:
        raise RuntimeError("no image in response")
    return raw


def try_models(ai, parts: list) -> bytes:
    last = None
    for model in MODELS:
        try:
            print(f"    model {model}")
            return generate(ai, model, parts)
        except Exception as e:
            last = e
            print(f"    fail: {e}")
            time.sleep(1)
    raise RuntimeError(last)


def mime_for(path: Path) -> str:
    return "image/jpeg" if path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"


def write_catalog(sheets: list[dict]) -> None:
    MANIFEST.write_text(
        json.dumps({"generatedBy": "gemini_from_app_art.py", "count": len(sheets), "sheets": sheets}, indent=2),
        encoding="utf-8",
    )
    lines = [
        "/** Premium colouring sheets (screenshot refs + Gemini from app art). */",
        "export type ColoringSheet = {",
        "  id: string;",
        "  title: string;",
        "  emoji: string;",
        "  category: string;",
        "  src: string;",
        "};",
        "",
        f"export const COLORING_SHEETS: ColoringSheet[] = {json.dumps(sheets, indent=2)};",
        "",
        "export function getColoringSheet(id: string) {",
        "  return COLORING_SHEETS.find((s) => s.id === id);",
        "}",
        "",
    ]
    text = "\n".join(lines)
    TS.write_text(text, encoding="utf-8")
    c = Path(r"C:\Users\dell\kids-learning-app\utils\coloringSheets.ts")
    if c.parent.exists():
        c.write_text(text, encoding="utf-8")


def main() -> None:
    from google import genai
    from google.genai import types

    load_env()
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("GEMINI_API_KEY missing")
    ai = genai.Client(api_key=key)
    OUT.mkdir(parents=True, exist_ok=True)

    sheets: list[dict] = []
    for sid, title, emoji, cat in KEEP:
        if (OUT / f"{sid}.png").exists():
            sheets.append(
                {"id": sid, "title": title, "emoji": emoji, "category": cat, "src": f"/coloring/sheets/{sid}.png"}
            )

    style_bytes = STYLE_REF.read_bytes() if STYLE_REF.exists() else None
    fruit_bytes = FRUIT_REF.read_bytes() if FRUIT_REF.exists() else None

    print("Redrawing story/phonics characters as pencil pages…")
    for job in REDRAW:
        src = Path(job["src"])
        if not src.exists():
            print(f"  MISS {job['id']}")
            continue
        print(f"  {job['id']}")
        parts = []
        if style_bytes:
            parts.append(types.Part.from_bytes(data=style_bytes, mime_type="image/png"))
            parts.append(
                "Style reference: match this premium kids colouring-page line weight and kawaii polish."
            )
        parts.append(types.Part.from_bytes(data=src.read_bytes(), mime_type=mime_for(src)))
        parts.append(
            "Redraw the character from this app artwork as a CHILDREN'S COLOURING BOOK PAGE. "
            "Pure black pencil outlines on white background only. No gray shading, no colour fills. "
            "Thick clean closed outlines for bucket colouring. Keep the same cute character identity "
            f"({job['hint']}) but simplify into bold kawaii line art with large colourable regions. "
            "Remove photo/3D shading and busy background — keep subject + a few simple props. "
            "Original app character only. No text, watermark, or logo. Portrait page."
        )
        try:
            raw = try_models(ai, parts)
            path = save_page(raw, job["id"])
            print(f"    OK {path.name} {path.stat().st_size // 1024}KB")
            sheets.append(
                {
                    "id": job["id"],
                    "title": job["title"],
                    "emoji": job["emoji"],
                    "category": job["category"],
                    "src": f"/coloring/sheets/{job['id']}.png",
                }
            )
        except Exception as e:
            print(f"    SKIP {job['id']}: {e}")
        time.sleep(1.2)

    print("Generating princess / fairy pages…")
    for job in NEW_PAGES:
        print(f"  {job['id']}")
        parts = []
        ref = style_bytes or fruit_bytes
        if ref:
            parts.append(types.Part.from_bytes(data=ref, mime_type="image/png"))
            parts.append("Match this premium colouring-page style and line quality.")
        parts.append(
            "Children's colouring book page. Pure black and white line art ONLY, no gray shading. "
            f"{job['prompt']} "
            "Thick clean closed outlines, premium 3D-looking kawaii/princess polish, white background, "
            "no text no watermark. Portrait."
        )
        try:
            raw = try_models(ai, parts)
            path = save_page(raw, job["id"])
            print(f"    OK {path.name} {path.stat().st_size // 1024}KB")
            sheets.append(
                {
                    "id": job["id"],
                    "title": job["title"],
                    "emoji": job["emoji"],
                    "category": job["category"],
                    "src": f"/coloring/sheets/{job['id']}.png",
                }
            )
        except Exception as e:
            print(f"    SKIP {job['id']}: {e}")
        time.sleep(1.2)

    # Keep any already-good converted sheets if Gemini skipped
    for job in REDRAW + NEW_PAGES:
        if any(s["id"] == job["id"] for s in sheets):
            continue
        if (OUT / f"{job['id']}.png").exists():
            sheets.append(
                {
                    "id": job["id"],
                    "title": job["title"],
                    "emoji": job["emoji"],
                    "category": job["category"],
                    "src": f"/coloring/sheets/{job['id']}.png",
                }
            )

    sheets = sorted(sheets, key=lambda s: s["id"])
    write_catalog(sheets)
    print(f"DONE catalog={len(sheets)}")


if __name__ == "__main__":
    main()
