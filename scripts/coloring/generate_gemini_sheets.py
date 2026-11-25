#!/usr/bin/env python3
"""
Generate premium kids colouring sheets with Gemini image models.
Keeps reference-import sheets; replaces weak Pillow drawings.

Usage:
  python scripts/coloring/generate_gemini_sheets.py
  python scripts/coloring/generate_gemini_sheets.py --one 01-kawaii-boba-tea
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
TS_CATALOG = ROOT / "utils" / "coloringSheets.ts"
REF_DIR = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")

# Style anchors from user screenshots (original themes, not copyrighted characters)
STYLE_REFS = {
    "princess": REF_DIR / "image-2ee7f65b-578f-4f22-9714-3dff5d0199df.png",
    "princess_garden": REF_DIR / "image-3318428a-4494-4938-bdb8-d8865cf4a66d.png",
    "boba": REF_DIR / "image-90238a99-7c9d-4fd4-9fbe-cde99ba26f48.png",
    "summer": REF_DIR / "image-bd535e6d-441b-419a-9b7e-f7e770849ced.png",
    "park": REF_DIR / "image-9a8ad283-93bf-4588-931b-fb6591b8b00b.png",
    "fruit": REF_DIR / "image-26b9a92c-6bd2-431f-aee2-074c866da29e.png",
    "basket": REF_DIR / "image-749e1bba-bbb5-4849-922d-fdb66ac7373c.png",
}

KEEP_REFS = [
    {
        "id": "23-ref-boba-premium",
        "title": "Premium Boba Cup",
        "emoji": "🧋",
        "category": "treats",
        "src": "/coloring/sheets/23-ref-boba-premium.png",
    },
    {
        "id": "24-ref-summer-treats",
        "title": "Summer Treats Rainbow",
        "emoji": "🌈",
        "category": "treats",
        "src": "/coloring/sheets/24-ref-summer-treats.png",
    },
    {
        "id": "25-ref-park-slide",
        "title": "Park Slide Adventure",
        "emoji": "🏞️",
        "category": "park",
        "src": "/coloring/sheets/25-ref-park-slide.png",
    },
    {
        "id": "26-ref-fruit-friends",
        "title": "Smiley Fruit Friends",
        "emoji": "🍓",
        "category": "fruits",
        "src": "/coloring/sheets/26-ref-fruit-friends.png",
    },
    {
        "id": "27-ref-apple-basket",
        "title": "Apple Basket Buddies",
        "emoji": "🧺",
        "category": "fruits",
        "src": "/coloring/sheets/27-ref-apple-basket.png",
    },
    {
        "id": "28-ref-princess-sparkle",
        "title": "Sparkle Princess Doll",
        "emoji": "✨",
        "category": "dolls",
        "src": "/coloring/sheets/28-ref-princess-sparkle.png",
    },
    {
        "id": "29-ref-princess-garden",
        "title": "Princess Garden Walk",
        "emoji": "🌷",
        "category": "dolls",
        "src": "/coloring/sheets/29-ref-princess-garden.png",
    },
    {
        "id": "30-ref-woven-fruit",
        "title": "Woven Fruit Basket",
        "emoji": "🍎",
        "category": "fruits",
        "src": "/coloring/sheets/30-ref-woven-fruit.png",
    },
]

# Sheets to regenerate with Gemini (NOT copyrighted characters)
GEMINI_JOBS = [
    {
        "id": "01-kawaii-boba-tea",
        "title": "Kawaii Boba Tea",
        "emoji": "🧋",
        "category": "treats",
        "style": "boba",
        "prompt": "Children's colouring book page. Pure black and white line art ONLY, no gray shading, no color fills, thick clean closed outlines for paint-bucket colouring. Cute kawaii bubble tea boba cup character with big sparkly eyes, eyelashes, smile, blush cheeks, dome lid, thick straw, tapioca pearls, sparkles hearts bubbles around it. Professional polished look like premium kids colouring books. White background. No text, no watermark, no logo. Portrait page.",
    },
    {
        "id": "02-ice-cream-rainbow",
        "title": "Ice Cream Rainbow Day",
        "emoji": "🍦",
        "category": "treats",
        "style": "summer",
        "prompt": "Children's colouring book page. Pure black and white line art only, no gray. Cute kawaii summer scene: soft-serve cone, popsicle, ice cream scoop all with happy faces, large rainbow with fluffy clouds, butterflies, hearts and stars. Thick closed outlines, premium colouring book quality, white background, no text no watermark. Portrait.",
    },
    {
        "id": "03-playground-park",
        "title": "Playground Park Friends",
        "emoji": "🛝",
        "category": "park",
        "style": "park",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute chibi kids playing on a playground slide in a park — one sliding, one at top, one climbing ladder. Puffy trees, bushes, grass, depth with overlapping shapes. Thick closed outlines, premium kids colouring book, white background, no text no watermark. Original characters only. Portrait.",
    },
    {
        "id": "04-princess-ballgown",
        "title": "Princess Ballgown Sparkle",
        "emoji": "👸",
        "category": "dolls",
        "style": "princess",
        "prompt": "Children's colouring book page. Pure black and white line art only, no gray. Elegant original princess doll (NOT Barbie, NOT Disney) with long wavy hair, tiara, necklace, off-shoulder ballgown with voluminous pleated skirt and ruffles creating 3D depth, large expressive eyes, four-point sparkles around her. Thick clean closed outlines, premium fashion-doll colouring book style, white background, no text no watermark. Portrait.",
    },
    {
        "id": "05-princess-garden",
        "title": "Princess Garden Stroll",
        "emoji": "🏰",
        "category": "dolls",
        "style": "princess_garden",
        "prompt": "Children's colouring book page. Pure black and white line art only. Original princess in a garden park with voluminous ballgown, long wavy hair, trees, bushes, a small bird, graceful standing pose with depth. Thick closed outlines, premium colouring book quality, white background, no text no watermark. Not Barbie or Disney. Portrait.",
    },
    {
        "id": "06-fruit-basket-friends",
        "title": "Fruit Basket Friends",
        "emoji": "🍎",
        "category": "fruits",
        "style": "basket",
        "prompt": "Children's colouring book page. Pure black and white line art only. Detailed woven wicker basket filled with cute apples and a banana with kawaii faces, optional tiny smiling worm peeking out, basket weave texture, thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "07-kawaii-fruit-party",
        "title": "Kawaii Fruit Party",
        "emoji": "🍉",
        "category": "fruits",
        "style": "fruit",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute kawaii fruit characters scattered on page: lemon, apple, banana, watermelon slice, pineapple, pear, strawberries, cherries — each with adorable faces. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "08-veggie-garden-basket",
        "title": "Veggie Garden Basket",
        "emoji": "🥕",
        "category": "veggies",
        "style": "basket",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute kawaii vegetables in a woven basket: carrot with leafy top, tomato, broccoli, corn, peas — smiling faces, detailed basket weave, thick closed outlines, premium colouring book depth, white background, no text no watermark. Portrait.",
    },
    {
        "id": "09-garden-fairy",
        "title": "Garden Fairy Magic",
        "emoji": "🧚",
        "category": "fantasy",
        "style": "princess",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute original garden fairy girl with large sparkly wings, flowing dress, wand with star sparkle, flowers around her, kawaii face, 3D layered dress folds. Thick closed outlines, premium colouring book, white background, no text no watermark. Not Disney. Portrait.",
    },
    {
        "id": "10-cozy-storybook-house",
        "title": "Cozy Storybook House",
        "emoji": "🏠",
        "category": "places",
        "style": "park",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cozy storybook cottage with 3D roof perspective, chimney, door, windows with panes, flower garden, tree, sun with rays. Thick closed outlines, premium colouring book depth, white background, no text no watermark. Portrait.",
    },
    {
        "id": "11-happy-lion-meadow",
        "title": "Happy Lion Meadow",
        "emoji": "🦁",
        "category": "animals",
        "style": "park",
        "prompt": "Children's colouring book page. Pure black and white line art only. Adorable original baby lion cub with fluffy mane outline, sitting in a meadow with grass, clouds, butterfly. Cute expressive face, thick closed outlines, premium colouring book quality with depth, white background, no text no watermark. Portrait.",
    },
    {
        "id": "12-doll-tea-party",
        "title": "Doll Tea Party",
        "emoji": "🧁",
        "category": "dolls",
        "style": "princess",
        "prompt": "Children's colouring book page. Pure black and white line art only. Two cute original fashion dolls at a tea party table with teapot, cups, cake, sparkles and hearts. Detailed dresses with folds for depth. Thick closed outlines, premium colouring book, white background, no text no watermark. Not Barbie. Portrait.",
    },
    {
        "id": "13-unicorn-meadow",
        "title": "Unicorn Meadow",
        "emoji": "🦄",
        "category": "fantasy",
        "style": "princess",
        "prompt": "Children's colouring book page. Pure black and white line art only. Magical cute unicorn with flowing mane, horn, in a flower meadow with sparkles and hearts. Soft 3D form with overlapping mane strands. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "14-ocean-fish-friends",
        "title": "Ocean Fish Friends",
        "emoji": "🐠",
        "category": "animals",
        "style": "fruit",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute kawaii fish friends underwater with seaweed, bubbles, coral. Expressive faces, depth with overlapping fish. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "15-puppy-kitten-play",
        "title": "Puppy & Kitten Play",
        "emoji": "🐶",
        "category": "animals",
        "style": "fruit",
        "prompt": "Children's colouring book page. Pure black and white line art only. Adorable puppy and kitten playing together with a heart and sparkles. Soft fluffy outlines, cute faces, thick closed lines, premium colouring book depth, white background, no text no watermark. Portrait.",
    },
    {
        "id": "16-fairy-tale-castle",
        "title": "Fairy Tale Castle",
        "emoji": "🏰",
        "category": "places",
        "style": "princess_garden",
        "prompt": "Children's colouring book page. Pure black and white line art only. Magical fairy-tale castle with towers, pointed roofs, flags, windows, door, clouds and sun. Strong 3D perspective depth. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "17-birthday-cake-party",
        "title": "Birthday Cake Party",
        "emoji": "🎂",
        "category": "treats",
        "style": "summer",
        "prompt": "Children's colouring book page. Pure black and white line art only. Tall cute birthday cake with layers, frosting swirls, candles, smiling kawaii cake face, balloons and sparkles. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "18-happy-farm-day",
        "title": "Happy Farm Day",
        "emoji": "🐑",
        "category": "animals",
        "style": "park",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute farm scene with barn, smiling sheep, fence, clouds. Soft kawaii animals with depth. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "19-fashion-doll-gown",
        "title": "Fashion Doll Gown",
        "emoji": "👗",
        "category": "dolls",
        "style": "princess",
        "prompt": "Children's colouring book page. Pure black and white line art only. Beautiful original fashion doll in elegant layered gown with hair waves, necklace, sparkles. Skirt panels show 3D volume. Thick closed outlines, premium doll colouring book style, white background, no text no watermark. Not Barbie or Disney. Portrait.",
    },
    {
        "id": "20-veggie-parade",
        "title": "Veggie Parade",
        "emoji": "🫑",
        "category": "veggies",
        "style": "fruit",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute kawaii vegetable parade: carrot, bell pepper, onion, eggplant walking in a row with smiling faces. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "21-park-picnic",
        "title": "Park Picnic Day",
        "emoji": "🧺",
        "category": "park",
        "style": "park",
        "prompt": "Children's colouring book page. Pure black and white line art only. Picnic in the park: blanket, picnic basket, cute snacks with faces, trees, sun. Soft depth, thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
    {
        "id": "22-space-rocket-adventure",
        "title": "Space Rocket Adventure",
        "emoji": "🚀",
        "category": "fantasy",
        "style": "summer",
        "prompt": "Children's colouring book page. Pure black and white line art only. Cute friendly rocket ship in space with planet, stars and sparkles. Clean 3D rocket form with windows and fins. Thick closed outlines, premium colouring book, white background, no text no watermark. Portrait.",
    },
]


def load_env():
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        # tolerate mistyped names
        if k in ("GEMINI_API_KEY", "Gemini API", "GOOGLE_API_KEY", "GOOGLE_GENAI_API_KEY"):
            os.environ["GEMINI_API_KEY"] = v
        else:
            os.environ.setdefault(k, v)


def binarize_rgb(img: Image.Image) -> Image.Image:
    g = ImageOps.grayscale(img.convert("RGB"))
    g = g.filter(ImageFilter.SHARPEN)
    bw = g.point(lambda p: 0 if p < 175 else 255, mode="L")
    return bw.convert("RGB")


def write_catalog(sheets: list):
    OUT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(
            {
                "generatedBy": "scripts/coloring/generate_gemini_sheets.py",
                "count": len(sheets),
                "sheets": sheets,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    ts = [
        "/** Premium colouring sheets (Gemini + curated references). */",
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
    TS_CATALOG.write_text("\n".join(ts), encoding="utf-8")


def extract_image_bytes(response) -> bytes | None:
    cands = getattr(response, "candidates", None) or []
    for cand in cands:
        content = getattr(cand, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
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
            import base64

            if isinstance(data, str):
                return base64.b64decode(data)
            return bytes(data)
    return None


def generate_one(ai, model: str, job: dict) -> Path:
    from google.genai import types

    contents: list = []
    ref = STYLE_REFS.get(job["style"])
    if ref and ref.exists():
        ref_bytes = ref.read_bytes()
        mime = "image/png"
        contents.append(
            types.Part.from_bytes(data=ref_bytes, mime_type=mime),
        )
        contents.append(
            "Use this image ONLY as style reference for line weight, kawaii/cute polish, "
            "and colouring-page quality. Create a NEW original scene from the text prompt. "
            "Do not copy characters or watermarks. Output must be black-and-white line art only."
        )
    contents.append(job["prompt"])

    response = ai.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
        ),
    )
    raw = extract_image_bytes(response)
    if not raw:
        raise RuntimeError(f"No image returned for {job['id']}")

    out_path = OUT / f"{job['id']}.png"
    tmp = OUT / f"{job['id']}.raw.png"
    tmp.write_bytes(raw)
    img = Image.open(tmp).convert("RGB")
    # normalize portrait canvas
    img = ImageOps.contain(img, (900, 1200), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (900, 1200), (255, 255, 255))
    canvas.paste(img, ((900 - img.size[0]) // 2, (1200 - img.size[1]) // 2))
    binarize_rgb(canvas).save(out_path, "PNG", optimize=True)
    tmp.unlink(missing_ok=True)
    return out_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--one", help="Generate a single sheet id")
    parser.add_argument(
        "--model",
        default="gemini-3.1-flash-image",
        help="Gemini image model id",
    )
    args = parser.parse_args()

    load_env()
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("GEMINI_API_KEY missing in .env.local")

    from google import genai

    ai = genai.Client(api_key=key)
    OUT.mkdir(parents=True, exist_ok=True)

    jobs = GEMINI_JOBS
    if args.one:
        jobs = [j for j in GEMINI_JOBS if j["id"] == args.one]
        if not jobs:
            raise SystemExit(f"Unknown id {args.one}")

    generated: list[dict] = []
    models_to_try = [
        args.model,
        "gemini-3.1-flash-image",
        "gemini-3.1-flash-image-preview",
        "gemini-3-pro-image",
        "gemini-3.1-flash-lite-image",
        "gemini-2.5-flash-image",
    ]

    # unique preserve order
    seen = set()
    models = []
    for m in models_to_try:
        if m not in seen:
            seen.add(m)
            models.append(m)

    for job in jobs:
        ok = False
        last_err = None
        for model in models:
            try:
                print(f"Generating {job['id']} with {model}…")
                path = generate_one(ai, model, job)
                print(f"  OK {path.name} ({path.stat().st_size // 1024} KB)")
                generated.append(
                    {
                        "id": job["id"],
                        "title": job["title"],
                        "emoji": job["emoji"],
                        "category": job["category"],
                        "src": f"/coloring/sheets/{job['id']}.png",
                    }
                )
                ok = True
                break
            except Exception as e:
                last_err = e
                print(f"  fail {model}: {e}")
                time.sleep(1)
        if not ok:
            print(f"SKIP {job['id']}: {last_err}")
        time.sleep(1.2)

    # Merge into existing premium catalog (do not drop screenshot sheets)
    by_id: dict[str, dict] = {}
    if MANIFEST.exists():
        try:
            prev = json.loads(MANIFEST.read_text(encoding="utf-8"))
            for s in prev.get("sheets", []):
                by_id[s["id"]] = s
        except Exception:
            pass
    for s in KEEP_REFS:
        by_id[s["id"]] = s
    for job in GEMINI_JOBS:
        path = OUT / f"{job['id']}.png"
        if path.exists():
            by_id[job["id"]] = {
                "id": job["id"],
                "title": job["title"],
                "emoji": job["emoji"],
                "category": job["category"],
                "src": f"/coloring/sheets/{job['id']}.png",
            }
    for s in generated:
        by_id[s["id"]] = s

    sheets = sorted(by_id.values(), key=lambda s: s["id"])
    write_catalog(sheets)
    print(f"DONE catalog={len(sheets)} newly_generated={len(generated)}")



if __name__ == "__main__":
    main()
