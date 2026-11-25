#!/usr/bin/env python3
"""
Premium kids colouring-sheet generator (Pillow).
Produces pure black/white closed-outline PNGs for canvas flood-fill.

Usage:
  python scripts/coloring/generate_premium_sheets.py
  python scripts/coloring/generate_premium_sheets.py --from-refs

Optional later: set GEMINI_API_KEY to enable Imagen generation path.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "coloring" / "sheets"
MANIFEST = ROOT / "public" / "coloring" / "manifest.json"
REF_DIR = Path(r"C:\Users\dell\.cursor\projects\d-kids-learning-app\assets")

W, H = 900, 1200
INK = (0, 0, 0, 255)
WHITE = (255, 255, 255, 255)


def new_canvas() -> Image.Image:
    return Image.new("RGBA", (W, H), WHITE)


def stroke(draw: ImageDraw.ImageDraw, xy, width=4):
    draw.line(xy, fill=INK, width=width, joint="curve")


def oval(draw, box, width=4):
    draw.ellipse(box, outline=INK, width=width)


def rect(draw, box, width=4, radius=0):
    if radius:
        draw.rounded_rectangle(box, radius=radius, outline=INK, width=width)
    else:
        draw.rectangle(box, outline=INK, width=width)


def poly(draw, pts, width=4):
    draw.polygon(pts, outline=INK)
    # thicken by redrawing
    if len(pts) >= 2:
        stroke(draw, pts + [pts[0]], width=width)


def heart(draw, cx, cy, s=20, width=3):
    # simple heart outline via arcs + V
    pts = []
    for t in range(0, 360, 4):
        rad = math.radians(t)
        x = s * 16 * math.sin(rad) ** 3
        y = -s * (
            13 * math.cos(rad)
            - 5 * math.cos(2 * rad)
            - 2 * math.cos(3 * rad)
            - math.cos(4 * rad)
        ) / 16
        pts.append((cx + x * 0.35, cy + y * 0.35))
    poly(draw, pts, width=width)


def sparkle(draw, cx, cy, s=16, width=3):
    stroke(draw, [(cx, cy - s), (cx, cy + s)], width)
    stroke(draw, [(cx - s, cy), (cx + s, cy)], width)
    stroke(draw, [(cx - s * 0.7, cy - s * 0.7), (cx + s * 0.7, cy + s * 0.7)], max(2, width - 1))
    stroke(draw, [(cx - s * 0.7, cy + s * 0.7), (cx + s * 0.7, cy - s * 0.7)], max(2, width - 1))


def kawaii_face(draw, cx, cy, scale=1.0, style="open"):
    # eyes
    er = int(10 * scale)
    if style == "happy":
        stroke(draw, [(cx - 22 * scale, cy - 4 * scale), (cx - 10 * scale, cy - 12 * scale), (cx + 2 * scale, cy - 4 * scale)], 3)
        stroke(draw, [(cx + 10 * scale, cy - 4 * scale), (cx + 22 * scale, cy - 12 * scale), (cx + 34 * scale, cy - 4 * scale)], 3)
    else:
        oval(draw, [cx - 28 * scale, cy - 18 * scale, cx - 8 * scale, cy + 6 * scale], 3)
        oval(draw, [cx + 8 * scale, cy - 18 * scale, cx + 28 * scale, cy + 6 * scale], 3)
        # highlights (fillable rings)
        oval(draw, [cx - 22 * scale, cy - 12 * scale, cx - 14 * scale, cy - 4 * scale], 2)
        oval(draw, [cx + 14 * scale, cy - 12 * scale, cx + 22 * scale, cy - 4 * scale], 2)
        # lashes
        for dx in (-26, -20, -14):
            stroke(draw, [(cx + dx * scale, cy - 16 * scale), (cx + (dx - 4) * scale, cy - 26 * scale)], 2)
        for dx in (14, 20, 26):
            stroke(draw, [(cx + dx * scale, cy - 16 * scale), (cx + (dx + 4) * scale, cy - 26 * scale)], 2)
    # blush
    oval(draw, [cx - 40 * scale, cy + 6 * scale, cx - 24 * scale, cy + 18 * scale], 2)
    oval(draw, [cx + 24 * scale, cy + 6 * scale, cx + 40 * scale, cy + 18 * scale], 2)
    # smile
    oval(draw, [cx - 14 * scale, cy + 8 * scale, cx + 14 * scale, cy + 28 * scale], 3)
    stroke(draw, [(cx - 14 * scale, cy + 16 * scale), (cx + 14 * scale, cy + 16 * scale)], 2)


def border(draw, pad=18, width=5):
    rect(draw, [pad, pad, W - pad, H - pad], width=width, radius=8)
    rect(draw, [pad + 10, pad + 10, W - pad - 10, H - pad - 10], width=2, radius=6)


def binarize(img: Image.Image) -> Image.Image:
    g = ImageOps.grayscale(img.convert("RGB"))
    g = g.filter(ImageFilter.SHARPEN)
    # threshold to pure B/W
    bw = g.point(lambda p: 0 if p < 180 else 255, mode="L")
    return bw.convert("RGB")


def save_sheet(img: Image.Image, name: str, title: str, emoji: str, category: str, sheets: list):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f"{name}.png"
    binarize(img).save(path, "PNG", optimize=True)
    sheets.append(
        {
            "id": name,
            "title": title,
            "emoji": emoji,
            "category": category,
            "src": f"/coloring/sheets/{name}.png",
        }
    )
    print(f"  wrote {path.name}")


# ---------- Scene drawers ----------

def draw_boba(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # cup body (tapered)
    poly(d, [(280, 380), (620, 380), (580, 980), (320, 980)], 5)
    oval(d, [280, 350, 620, 410], 5)
    # lid dome
    oval(d, [300, 220, 600, 420], 5)
    stroke(d, [(300, 360), (600, 360)], 4)
    # straw
    poly(d, [(470, 160), (520, 160), (500, 420), (460, 420)], 4)
    # pearls
    for cx, cy, r in [(360, 860, 28), (420, 900, 26), (490, 870, 30), (540, 920, 24), (400, 940, 22), (470, 940, 24), (380, 800, 20), (520, 810, 22)]:
        oval(d, [cx - r, cy - r, cx + r, cy + r], 3)
    kawaii_face(d, 450, 620, 1.35)
    for sx, sy, s in [(160, 200, 22), (720, 260, 18), (150, 500, 14), (740, 700, 20), (200, 900, 16)]:
        sparkle(d, sx, sy, s)
    heart(d, 170, 350, 18)
    heart(d, 730, 480, 16)
    for cx, cy, r in [(180, 700, 18), (760, 880, 22), (200, 250, 12)]:
        oval(d, [cx - r, cy - r, cx + r, cy + r], 3)
    save_sheet(img, "01-kawaii-boba-tea", "Kawaii Boba Tea", "🧋", "treats", sheets)


def draw_ice_cream_rainbow(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # rainbow arcs
    for i, rad in enumerate([380, 340, 300, 260]):
        oval(d, [450 - rad, 120, 450 + rad, 120 + rad * 1.1], 4)
    # hide bottom of ovals with white rect then redraw ground? clip via cover
    d.rectangle([40, 420, W - 40, H - 40], fill=WHITE)
    border(d)
    # clouds
    for cx, cy in [(180, 380), (720, 390)]:
        for ox, oy, r in [(-40, 0, 36), (0, -10, 42), (40, 0, 36), (0, 20, 30)]:
            oval(d, [cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r], 3)
    # butterflies
    for cx, cy, s in [(450, 520, 1.0), (620, 560, 1.3)]:
        oval(d, [cx - 40 * s, cy - 30 * s, cx - 5 * s, cy + 20 * s], 3)
        oval(d, [cx + 5 * s, cy - 30 * s, cx + 40 * s, cy + 20 * s], 3)
        oval(d, [cx - 30 * s, cy + 5 * s, cx - 5 * s, cy + 35 * s], 3)
        oval(d, [cx + 5 * s, cy + 5 * s, cx + 30 * s, cy + 35 * s], 3)
        oval(d, [cx - 6 * s, cy - 10 * s, cx + 6 * s, cy + 30 * s], 3)
    # ice creams
    # soft serve
    oval(d, [120, 720, 260, 900], 4)
    poly(d, [(140, 860), (240, 860), (220, 1050), (160, 1050)], 4)
    kawaii_face(d, 190, 800, 0.7, "happy")
    # popsicle
    rect(d, [380, 740, 520, 980], 4, radius=30)
    rect(d, [430, 980, 470, 1080], 4)
    kawaii_face(d, 450, 860, 0.75, "happy")
    # scoop cone
    oval(d, [620, 760, 780, 920], 4)
    poly(d, [(650, 900), (750, 900), (700, 1080)], 4)
    kawaii_face(d, 700, 840, 0.7)
    for x, y in [(160, 560), (300, 500), (780, 620), (500, 640)]:
        heart(d, x, y, 14)
        sparkle(d, x + 40, y - 30, 12)
    save_sheet(img, "02-ice-cream-rainbow", "Ice Cream Rainbow Day", "🍦", "treats", sheets)


def draw_playground(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # trees
    for cx, top in [(160, 220), (720, 200)]:
        oval(d, [cx - 80, top, cx + 80, top + 160], 4)
        rect(d, [cx - 16, top + 140, cx + 16, top + 320], 4)
    # bushes
    for cx in (280, 450, 620):
        oval(d, [cx - 60, 420, cx + 60, 520], 3)
    # slide structure
    rect(d, [220, 480, 280, 900], 5)  # ladder post
    for y in range(520, 880, 50):
        stroke(d, [(220, y), (280, y)], 3)
    # platform
    rect(d, [220, 460, 420, 510], 5, radius=8)
    # slide surface with rails (depth)
    poly(d, [(400, 500), (700, 880), (640, 920), (360, 540)], 5)
    stroke(d, [(390, 510), (680, 870)], 3)
    stroke(d, [(410, 530), (700, 890)], 3)
    # kids (chibi)
    def kid(cx, cy, hair="wavy"):
        oval(d, [cx - 28, cy - 55, cx + 28, cy - 5], 3)  # head
        kawaii_face(d, cx, cy - 35, 0.45)
        if hair == "wavy":
            oval(d, [cx - 34, cy - 60, cx - 10, cy - 20], 2)
            oval(d, [cx + 10, cy - 60, cx + 34, cy - 20], 2)
        rect(d, [cx - 26, cy - 5, cx + 26, cy + 50], 3, radius=10)
        stroke(d, [(cx - 26, cy + 10), (cx - 50, cy + 35)], 3)
        stroke(d, [(cx + 26, cy + 10), (cx + 50, cy + 35)], 3)
        stroke(d, [(cx - 12, cy + 50), (cx - 18, cy + 80)], 3)
        stroke(d, [(cx + 12, cy + 50), (cx + 18, cy + 80)], 3)

    kid(340, 470, "short")
    kid(560, 780, "wavy")
    kid(250, 700, "wavy")
    # ground
    stroke(d, [(80, 980), (820, 1000)], 4)
    for gx in range(120, 800, 70):
        stroke(d, [(gx, 1000), (gx - 8, 1025), (gx + 8, 1025), (gx, 1000)], 2)
    save_sheet(img, "03-playground-park", "Playground Park Friends", "🛝", "park", sheets)


def draw_princess_sparkle(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    cx, cy = 450, 420
    # hair
    oval(d, [cx - 120, 180, cx + 120, 520], 4)
    # face
    oval(d, [cx - 70, 250, cx + 70, 420], 4)
    kawaii_face(d, cx, 330, 1.0)
    # tiara
    poly(d, [(cx - 50, 250), (cx - 30, 200), (cx, 230), (cx + 30, 200), (cx + 50, 250)], 3)
    oval(d, [cx - 8, 210, cx + 8, 226], 2)
    # necklace
    oval(d, [cx - 35, 400, cx + 35, 440], 2)
    oval(d, [cx - 8, 430, cx + 8, 450], 2)
    # bodice
    poly(d, [(cx - 70, 430), (cx + 70, 430), (cx + 55, 560), (cx - 55, 560)], 4)
    # sleeves
    oval(d, [cx - 120, 440, cx - 60, 520], 3)
    oval(d, [cx + 60, 440, cx + 120, 520], 3)
    # voluminous skirt panels (3D depth)
    base_y = 560
    hem_y = 1080
    panels = [
        [(cx - 55, base_y), (cx - 220, hem_y), (cx - 80, hem_y)],
        [(cx - 55, base_y), (cx - 80, hem_y), (cx + 20, hem_y), (cx, base_y + 20)],
        [(cx, base_y + 20), (cx + 20, hem_y), (cx + 120, hem_y), (cx + 55, base_y)],
        [(cx + 55, base_y), (cx + 120, hem_y), (cx + 240, hem_y)],
    ]
    for p in panels:
        poly(d, p, 4)
    # scalloped hem
    for i in range(-4, 5):
        oval(d, [cx + i * 50 - 30, hem_y - 30, cx + i * 50 + 30, hem_y + 30], 3)
    d.rectangle([40, hem_y + 10, W - 40, H - 40], fill=WHITE)
    border(d)
    for sx, sy in [(140, 200), (760, 240), (120, 600), (780, 700), (200, 900), (700, 920)]:
        sparkle(d, sx, sy, 18)
    save_sheet(img, "04-princess-ballgown", "Princess Ballgown Sparkle", "👸", "dolls", sheets)


def draw_princess_garden(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # trees
    for cx, top in [(140, 260), (760, 240)]:
        oval(d, [cx - 90, top, cx + 90, top + 180], 4)
        for ox in (-40, 0, 40):
            oval(d, [cx + ox - 35, top + 40, cx + ox + 35, top + 120], 2)
        rect(d, [cx - 18, top + 160, cx + 18, top + 360], 4)
    # bird
    oval(d, [200, 180, 250, 220], 3)
    poly(d, [(210, 190), (180, 170), (210, 200)], 2)
    # princess full body
    cx = 450
    oval(d, [cx - 55, 280, cx + 55, 400], 4)
    kawaii_face(d, cx, 330, 0.75)
    oval(d, [cx - 90, 250, cx + 90, 480], 3)  # hair
    rect(d, [cx - 45, 400, cx + 45, 520], 4, radius=8)
    # petal skirt
    for ang in range(-60, 70, 20):
        rad = math.radians(ang)
        px = cx + math.sin(rad) * 160
        poly(d, [(cx - 20, 520), (cx + 20, 520), (px + 40, 980), (px - 40, 980)], 3)
    oval(d, [cx - 180, 960, cx + 180, 1040], 4)
    # bushes foreground
    for cxb in (180, 450, 720):
        oval(d, [cxb - 70, 980, cxb + 70, 1100], 3)
        for i in range(5):
            oval(d, [cxb - 40 + i * 18, 1000, cxb - 25 + i * 18, 1020], 2)
    save_sheet(img, "05-princess-garden", "Princess Garden Stroll", "🏰", "dolls", sheets)


def draw_fruit_basket(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # handle
    oval(d, [220, 220, 680, 520], 5)
    d.rectangle([240, 360, 660, 1100], fill=WHITE)
    # basket weave body
    poly(d, [(180, 520), (720, 520), (680, 980), (220, 980)], 5)
    oval(d, [180, 490, 720, 550], 5)
    # weave grid
    for x in range(240, 680, 40):
        stroke(d, [(x, 540), (x - 20, 960)], 2)
    for y in range(560, 960, 36):
        stroke(d, [(220, y), (680, y)], 2)
    # apples with faces
    for cx, cy, r in [(340, 480, 70), (470, 440, 80), (600, 500, 65), (400, 580, 55)]:
        oval(d, [cx - r, cy - r, cx + r, cy + r], 4)
        # leaf
        oval(d, [cx + 10, cy - r - 10, cx + 45, cy - r + 25], 2)
        stroke(d, [(cx, cy - r), (cx, cy - r - 25)], 2)
        kawaii_face(d, cx, cy, 0.55 if r < 70 else 0.7, "happy" if cx % 100 < 50 else "open")
    # banana
    oval(d, [520, 560, 700, 640], 4)
    kawaii_face(d, 610, 600, 0.4, "happy")
    # worm peek
    oval(d, [300, 600, 360, 680], 3)
    oval(d, [310, 620, 350, 650], 2)
    kawaii_face(d, 330, 635, 0.25, "happy")
    save_sheet(img, "06-fruit-basket-friends", "Fruit Basket Friends", "🍎", "fruits", sheets)


def draw_fruit_party(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    fruits = [
        ("lemon", 200, 220, 70),
        ("apple", 450, 200, 75),
        ("banana", 700, 250, 60),
        ("melon", 700, 520, 90),
        ("pineapple", 220, 700, 80),
        ("pear", 650, 900, 70),
        ("berry", 420, 550, 35),
        ("berry2", 480, 600, 30),
        ("cherry1", 400, 420, 28),
        ("cherry2", 450, 430, 28),
    ]
    for name, cx, cy, r in fruits:
        if "banana" in name:
            oval(d, [cx - r, cy - r / 2, cx + r, cy + r / 2], 4)
        elif "pineapple" in name:
            oval(d, [cx - r * 0.7, cy - r, cx + r * 0.7, cy + r], 4)
            for i in range(-2, 3):
                for j in range(-2, 3):
                    stroke(d, [(cx + i * 18 - 8, cy + j * 22), (cx + i * 18 + 8, cy + j * 22 + 10)], 1)
            # crown
            for a in (-30, -10, 10, 30):
                rad = math.radians(a)
                stroke(d, [(cx, cy - r), (cx + math.sin(rad) * 40, cy - r - 50)], 3)
        elif "melon" in name:
            poly(d, [(cx - r, cy), (cx + r, cy - r * 0.3), (cx + r, cy + r * 0.5), (cx - r * 0.2, cy + r * 0.6)], 4)
            for i in range(5):
                oval(d, [cx - 10 + i * 15, cy + i * 8, cx + i * 15, cy + 12 + i * 8], 2)
        else:
            oval(d, [cx - r, cy - r, cx + r, cy + r], 4)
            if "apple" in name or "pear" in name or "lemon" in name:
                stroke(d, [(cx, cy - r), (cx + 5, cy - r - 25)], 2)
                oval(d, [cx + 5, cy - r - 30, cx + 35, cy - r], 2)
        kawaii_face(d, cx, cy, max(0.35, r / 120), "happy" if r % 20 < 10 else "open")
    # cherry stem
    stroke(d, [(400, 400), (425, 360), (450, 400)], 3)
    save_sheet(img, "07-kawaii-fruit-party", "Kawaii Fruit Party", "🍉", "fruits", sheets)


def draw_veggie_garden(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # basket
    poly(d, [(160, 620), (740, 620), (700, 1000), (200, 1000)], 5)
    oval(d, [160, 590, 740, 650], 5)
    for x in range(220, 700, 45):
        stroke(d, [(x, 640), (x - 15, 980)], 2)
    # carrot
    poly(d, [(280, 480), (330, 700), (230, 700)], 4)
    for i in range(3):
        stroke(d, [(280, 480), (250 + i * 30, 400)], 3)
    kawaii_face(d, 280, 620, 0.5, "happy")
    # tomato
    oval(d, [420, 480, 560, 620], 4)
    oval(d, [470, 460, 520, 500], 2)
    kawaii_face(d, 490, 550, 0.55)
    # broccoli
    for cx, cy in [(640, 540), (600, 500), (680, 500)]:
        oval(d, [cx - 40, cy - 40, cx + 40, cy + 40], 3)
    rect(d, [620, 560, 660, 700], 3)
    kawaii_face(d, 640, 520, 0.4, "happy")
    # corn
    oval(d, [380, 720, 460, 920], 4)
    for y in range(740, 900, 20):
        stroke(d, [(395, y), (445, y)], 1)
    kawaii_face(d, 420, 800, 0.4)
    # peas
    for i, cx in enumerate((520, 560, 600)):
        oval(d, [cx - 22, 780, cx + 22, 830], 3)
        kawaii_face(d, cx, 805, 0.25, "happy")
    save_sheet(img, "08-veggie-garden-basket", "Veggie Garden Basket", "🥕", "veggies", sheets)


def draw_fairy(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    cx = 450
    # wings
    oval(d, [200, 320, 380, 560], 4)
    oval(d, [520, 320, 700, 560], 4)
    oval(d, [240, 500, 400, 680], 3)
    oval(d, [500, 500, 660, 680], 3)
    # body
    oval(d, [cx - 50, 280, cx + 50, 400], 4)
    kawaii_face(d, cx, 330, 0.7)
    poly(d, [(cx - 40, 400), (cx + 40, 400), (cx + 60, 620), (cx - 60, 620)], 4)
    # dress layers
    for y in (620, 700, 780):
        oval(d, [cx - 90 - (y - 620) // 4, y, cx + 90 + (y - 620) // 4, y + 80], 3)
    # wand
    stroke(d, [(560, 420), (720, 260)], 3)
    sparkle(d, 720, 250, 22)
    for sx, sy in [(150, 200), (780, 300), (180, 900), (750, 850)]:
        sparkle(d, sx, sy, 14)
        heart(d, sx + 30, sy + 40, 12)
    # flowers
    for cx, cy in [(200, 950), (450, 1000), (700, 940)]:
        for a in range(0, 360, 60):
            rad = math.radians(a)
            oval(d, [cx + math.cos(rad) * 25 - 12, cy + math.sin(rad) * 25 - 12, cx + math.cos(rad) * 25 + 12, cy + math.sin(rad) * 25 + 12], 2)
        oval(d, [cx - 10, cy - 10, cx + 10, cy + 10], 2)
    save_sheet(img, "09-garden-fairy", "Garden Fairy Magic", "🧚", "fantasy", sheets)


def draw_cozy_house(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # house body
    rect(d, [220, 480, 680, 920], 5, radius=6)
    # roof 3D
    poly(d, [(180, 500), (450, 220), (720, 500)], 5)
    poly(d, [(720, 500), (450, 220), (780, 280), (780, 540)], 4)
    # chimney
    rect(d, [560, 260, 620, 400], 4)
    # door
    rect(d, [400, 700, 500, 920], 4, radius=20)
    oval(d, [470, 800, 490, 820], 2)
    # windows
    for box in ([260, 560, 360, 660], [540, 560, 640, 660]):
        rect(d, box, 4, radius=8)
        stroke(d, [(box[0], (box[1] + box[3]) / 2), (box[2], (box[1] + box[3]) / 2)], 2)
        stroke(d, [((box[0] + box[2]) / 2, box[1]), ((box[0] + box[2]) / 2, box[3])], 2)
    # path
    poly(d, [(400, 920), (500, 920), (560, 1100), (340, 1100)], 3)
    # trees / flowers
    oval(d, [80, 700, 200, 860], 4)
    rect(d, [125, 850, 155, 1000], 3)
    for fx in (250, 650, 750):
        oval(d, [fx, 980, fx + 40, 1040], 2)
        stroke(d, [(fx + 20, 1040), (fx + 20, 1100)], 2)
    # sun
    oval(d, [120, 160, 220, 260], 4)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        stroke(d, [(170 + math.cos(rad) * 55, 210 + math.sin(rad) * 55), (170 + math.cos(rad) * 80, 210 + math.sin(rad) * 80)], 3)
    save_sheet(img, "10-cozy-storybook-house", "Cozy Storybook House", "🏠", "places", sheets)


def draw_animal_safari(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # lion
    oval(d, [280, 280, 620, 620], 5)  # mane
    oval(d, [340, 340, 560, 560], 4)  # face
    kawaii_face(d, 450, 440, 1.1, "happy")
    oval(d, [360, 300, 400, 350], 3)
    oval(d, [500, 300, 540, 350], 3)
    # body
    oval(d, [360, 560, 540, 760], 4)
    rect(d, [380, 720, 420, 900], 3, radius=10)
    rect(d, [480, 720, 520, 900], 3, radius=10)
    # tail
    stroke(d, [(360, 650), (220, 600), (200, 640)], 4)
    oval(d, [180, 620, 230, 670], 3)
    # grass / sun
    oval(d, [700, 160, 820, 280], 4)
    stroke(d, [(80, 980), (820, 1000)], 4)
    for gx in range(100, 820, 60):
        stroke(d, [(gx, 1000), (gx - 10, 1040), (gx + 10, 1040)], 2)
    # butterfly
    oval(d, [160, 200, 210, 250], 2)
    oval(d, [210, 200, 260, 250], 2)
    save_sheet(img, "11-happy-lion-meadow", "Happy Lion Meadow", "🦁", "animals", sheets)


def draw_doll_tea_party(sheets: list):
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # table
    oval(d, [180, 700, 720, 900], 5)
    rect(d, [260, 860, 300, 1080], 4)
    rect(d, [600, 860, 640, 1080], 4)
    # teapot
    oval(d, [380, 560, 520, 700], 4)
    oval(d, [420, 520, 480, 560], 3)
    oval(d, [520, 600, 580, 660], 3)
    oval(d, [340, 600, 390, 650], 3)
    kawaii_face(d, 450, 630, 0.45, "happy")
    # cups
    for cx in (260, 640):
        rect(d, [cx - 35, 640, cx + 35, 720], 3, radius=8)
        oval(d, [cx - 35, 630, cx + 35, 655], 3)
        kawaii_face(d, cx, 680, 0.3, "happy")
    # dolls
    for cx, side in ((200, -1), (700, 1)):
        oval(d, [cx - 40, 280, cx + 40, 370], 3)
        kawaii_face(d, cx, 320, 0.5)
        # hair
        oval(d, [cx - 50, 260, cx + 50, 360], 2)
        rect(d, [cx - 35, 370, cx + 35, 520], 3, radius=8)
        poly(d, [(cx - 35, 480), (cx + 35, 480), (cx + 70, 680), (cx - 70, 680)], 3)
        stroke(d, [(cx - 35, 420), (cx - 80, 500)], 3)
        stroke(d, [(cx + 35, 420), (cx + 80, 500)], 3)
    # cake
    rect(d, [400, 780, 500, 860], 3, radius=6)
    oval(d, [400, 760, 500, 800], 3)
    oval(d, [430, 740, 470, 770], 2)
    for sx, sy in [(150, 180), (750, 200), (450, 160)]:
        sparkle(d, sx, sy, 14)
        heart(d, sx + 40, sy + 50, 12)
    save_sheet(img, "12-doll-tea-party", "Doll Tea Party", "🧁", "dolls", sheets)


def process_reference(src: Path, name: str, title: str, emoji: str, category: str, sheets: list):
    if not src.exists():
        print(f"  skip missing ref {src.name}")
        return
    img = Image.open(src).convert("RGB")
    # crop bottom watermark strip if present
    w, h = img.size
    img = img.crop((0, 0, w, int(h * 0.96)))
    img = ImageOps.contain(img, (W, H), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (W, H), (255, 255, 255))
    ox = (W - img.size[0]) // 2
    oy = (H - img.size[1]) // 2
    canvas.paste(img, (ox, oy))
    save_sheet(canvas, name, title, emoji, category, sheets)


def write_manifest(sheets: list):
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generatedBy": "scripts/coloring/generate_premium_sheets.py",
        "count": len(sheets),
        "sheets": sheets,
    }
    MANIFEST.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    # Also emit TS catalog for the app
    ts_path = ROOT / "utils" / "coloringSheets.ts"
    lines = [
        "/** Auto-synced catalogue of premium colouring sheets (image flood-fill). */",
        "export type ColoringSheet = {",
        "  id: string;",
        "  title: string;",
        "  emoji: string;",
        "  category: string;",
        "  src: string;",
        "};",
        "",
        "export const COLORING_SHEETS: ColoringSheet[] = " + json.dumps(sheets, indent=2) + ";",
        "",
        "export function getColoringSheet(id: string) {",
        "  return COLORING_SHEETS.find((s) => s.id === id);",
        "}",
        "",
    ]
    # json.dumps uses double quotes - valid in TS
    ts_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"manifest + TS catalog: {len(sheets)} sheets")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--from-refs", action="store_true", help="Also import cleaned reference screenshots")
    args = parser.parse_args()

    print("Generating premium colouring sheets…")
    sheets: list = []

    draw_boba(sheets)
    draw_ice_cream_rainbow(sheets)
    draw_playground(sheets)
    draw_princess_sparkle(sheets)
    draw_princess_garden(sheets)
    draw_fruit_basket(sheets)
    draw_fruit_party(sheets)
    draw_veggie_garden(sheets)
    draw_fairy(sheets)
    draw_cozy_house(sheets)
    draw_animal_safari(sheets)
    draw_doll_tea_party(sheets)

    # Duplicate variations with slight theme shifts for more inventory
    # (re-run drawers with renamed ids by calling extras)
    extras = [
        ("13-unicorn-meadow", "Unicorn Meadow", "🦄", "fantasy", draw_fairy),
    ]
    # Add more unique drawers inline
    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # unicorn
    oval(d, [360, 360, 540, 540], 4)
    kawaii_face(d, 450, 440, 0.8)
    poly(d, [(450, 300), (430, 200), (470, 300)], 3)
    oval(d, [300, 520, 600, 780], 4)
    oval(d, [250, 480, 360, 600], 3)
    oval(d, [540, 480, 650, 600], 3)
    for sx, sy in [(150, 220), (750, 260), (200, 900)]:
        sparkle(d, sx, sy, 16)
        heart(d, sx + 50, sy + 40, 12)
    save_sheet(img, "13-unicorn-meadow", "Unicorn Meadow", "🦄", "fantasy", sheets)

    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # underwater
    for cx, cy, r in [(250, 400, 70), (500, 350, 90), (700, 500, 55)]:
        # fish body
        oval(d, [cx - r, cy - r * 0.6, cx + r, cy + r * 0.6], 4)
        poly(d, [(cx - r, cy), (cx - r - 40, cy - 30), (cx - r - 40, cy + 30)], 3)
        kawaii_face(d, cx + 10, cy, 0.4, "happy")
    for cx, cy in [(200, 800), (400, 850), (600, 780), (750, 900)]:
        oval(d, [cx - 15, cy - 15, cx + 15, cy + 15], 2)
    # seaweed
    for x in (120, 300, 500, 700):
        stroke(d, [(x, 1100), (x + 20, 900), (x - 10, 700)], 3)
    save_sheet(img, "14-ocean-fish-friends", "Ocean Fish Friends", "🐠", "animals", sheets)

    img = new_canvas()
    d = ImageDraw.Draw(img)
    border(d)
    # puppy kitten
    oval(d, [220, 400, 420, 620], 4)
    kawaii_face(d, 320, 500, 0.8)
    oval(d, [240, 360, 300, 430], 3)
    oval(d, [340, 360, 400, 430], 3)
    oval(d, [500, 420, 720, 650], 4)
    kawaii_face(d, 610, 520, 0.75)
    # cat ears
    poly(d, [(540, 450), (560, 360), (600, 450)], 3)
    poly(d, [(640, 450), (680, 360), (700, 450)], 3)
    oval(d, [250, 620, 400, 820], 4)
    oval(d, [540, 640, 700, 840], 4)
    heart(d, 450, 300, 20)
    sparkle(d, 160, 250, 16)
    sparkle(d, 780, 280, 16)
    save_sheet(img, "15-puppy-kitten-play", "Puppy & Kitten Play", "🐶", "animals", sheets)

    # More premium scenes
    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # castle
    rect(d, [300, 420, 600, 920], 5)
    rect(d, [180, 360, 320, 920], 5); rect(d, [580, 360, 720, 920], 5)
    poly(d, [(180, 360), (250, 220), (320, 360)], 4)
    poly(d, [(300, 420), (450, 240), (600, 420)], 4)
    poly(d, [(580, 360), (650, 220), (720, 360)], 4)
    rect(d, [400, 700, 500, 920], 4, radius=24)
    for box in ([220, 500, 280, 580], [620, 500, 680, 580], [420, 500, 480, 580]):
        oval(d, box, 3)
    oval(d, [120, 160, 220, 260], 4)
    save_sheet(img, "16-fairy-tale-castle", "Fairy Tale Castle", "🏰", "places", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # birthday cake
    rect(d, [280, 620, 620, 920], 5, radius=12)
    rect(d, [320, 480, 580, 640], 5, radius=12)
    oval(d, [320, 450, 580, 510], 4)
    for x in (360, 450, 540):
        rect(d, [x - 8, 360, x + 8, 460], 3)
        oval(d, [x - 14, 330, x + 14, 370], 3)
    kawaii_face(d, 450, 720, 0.9, "happy")
    for sx, sy in [(160, 220), (740, 240), (200, 900)]:
        sparkle(d, sx, sy, 18); heart(d, sx + 40, sy + 50, 14)
    save_sheet(img, "17-birthday-cake-party", "Birthday Cake Party", "🎂", "treats", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # farm
    rect(d, [500, 480, 780, 900], 5)
    poly(d, [(480, 500), (640, 300), (800, 500)], 4)
    oval(d, [180, 620, 360, 820], 4)  # sheep body
    oval(d, [220, 560, 320, 660], 4)
    kawaii_face(d, 270, 600, 0.55, "happy")
    oval(d, [200, 900, 280, 980], 3); oval(d, [300, 900, 380, 980], 3)
    # barn door
    rect(d, [580, 650, 700, 900], 4)
    stroke(d, [(580, 650), (700, 900)], 2); stroke(d, [(700, 650), (580, 900)], 2)
    save_sheet(img, "18-happy-farm-day", "Happy Farm Day", "🐑", "animals", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # fashion doll closet
    cx = 450
    oval(d, [cx - 60, 200, cx + 60, 340], 4)
    kawaii_face(d, cx, 260, 0.85)
    oval(d, [cx - 100, 180, cx + 100, 400], 3)
    rect(d, [cx - 50, 340, cx + 50, 520], 4, radius=8)
    poly(d, [(cx - 50, 500), (cx + 50, 500), (cx + 140, 980), (cx - 140, 980)], 4)
    for i in range(-2, 3):
        stroke(d, [(cx + i * 35, 520), (cx + i * 50, 960)], 2)
    oval(d, [cx - 30, 360, cx + 30, 400], 2)
    for sx, sy in [(140, 220), (760, 260), (160, 800)]:
        sparkle(d, sx, sy, 16)
    save_sheet(img, "19-fashion-doll-gown", "Fashion Doll Gown", "👗", "dolls", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # vegetable parade
    for i, (cx, name) in enumerate([(180, "carrot"), (350, "pepper"), (520, "onion"), (700, "eggplant")]):
        if name == "carrot":
            poly(d, [(cx, 400), (cx + 50, 900), (cx - 50, 900)], 4)
            for j in range(3):
                stroke(d, [(cx, 400), (cx - 30 + j * 30, 300)], 3)
        elif name == "pepper":
            oval(d, [cx - 55, 480, cx + 55, 820], 4)
            stroke(d, [(cx, 480), (cx + 10, 420)], 3)
        elif name == "onion":
            oval(d, [cx - 60, 520, cx + 60, 860], 4)
            for j in range(4):
                stroke(d, [(cx, 520), (cx - 20 + j * 12, 440)], 2)
        else:
            oval(d, [cx - 45, 500, cx + 45, 880], 4)
            oval(d, [cx - 15, 450, cx + 25, 510], 3)
        kawaii_face(d, cx, 650, 0.55, "happy" if i % 2 == 0 else "open")
    save_sheet(img, "20-veggie-parade", "Veggie Parade", "🫑", "veggies", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # park picnic
    oval(d, [200, 780, 700, 980], 5)  # blanket
    rect(d, [340, 620, 560, 760], 4, radius=10)  # basket
    oval(d, [340, 590, 560, 650], 4)
    oval(d, [250, 700, 330, 780], 3); oval(d, [580, 700, 660, 780], 3)
    kawaii_face(d, 290, 740, 0.35, "happy"); kawaii_face(d, 620, 740, 0.35)
    # trees
    for cx in (150, 750):
        oval(d, [cx - 70, 280, cx + 70, 460], 4); rect(d, [cx - 15, 440, cx + 15, 700], 3)
    oval(d, [650, 180, 780, 300], 4)
    save_sheet(img, "21-park-picnic", "Park Picnic Day", "🧺", "park", sheets)

    img = new_canvas(); d = ImageDraw.Draw(img); border(d)
    # space adventure (kid rocket - original)
    poly(d, [(450, 180), (560, 700), (340, 700)], 5)
    oval(d, [410, 320, 490, 420], 4)
    poly(d, [(340, 620), (280, 780), (360, 720)], 4)
    poly(d, [(560, 620), (620, 780), (540, 720)], 4)
    poly(d, [(400, 700), (450, 900), (500, 700)], 4)
    for cx, cy, s in [(150, 250, 18), (750, 300, 14), (200, 600, 12), (720, 700, 16)]:
        sparkle(d, cx, cy, s)
    oval(d, [650, 450, 780, 580], 4)
    oval(d, [630, 500, 800, 540], 2)
    save_sheet(img, "22-space-rocket-adventure", "Space Rocket Adventure", "🚀", "fantasy", sheets)

    if args.from_refs and REF_DIR.exists():
        print("Importing cleaned reference screenshots…")
        refs = [
            ("image-90238a99-7c9d-4fd4-9fbe-cde99ba26f48.png", "23-ref-boba-premium", "Premium Boba Cup", "🧋", "treats"),
            ("image-bd535e6d-441b-419a-9b7e-f7e770849ced.png", "24-ref-summer-treats", "Summer Treats Rainbow", "🌈", "treats"),
            ("image-9a8ad283-93bf-4588-931b-fb6591b8b00b.png", "25-ref-park-slide", "Park Slide Adventure", "🏞️", "park"),
            ("image-26b9a92c-6bd2-431f-aee2-074c866da29e.png", "26-ref-fruit-friends", "Smiley Fruit Friends", "🍓", "fruits"),
            ("image-749e1bba-bbb5-4849-922d-fdb66ac7373c.png", "27-ref-apple-basket", "Apple Basket Buddies", "🧺", "fruits"),
            ("image-2ee7f65b-578f-4f22-9714-3dff5d0199df.png", "28-ref-princess-sparkle", "Sparkle Princess Doll", "✨", "dolls"),
            ("image-3318428a-4494-4938-bdb8-d8865cf4a66d.png", "29-ref-princess-garden", "Princess Garden Walk", "🌷", "dolls"),
            ("image-e371f6ea-8e40-4663-9752-c5c9881f5f62.png", "30-ref-woven-fruit", "Woven Fruit Basket", "🍎", "fruits"),
        ]
        for file, name, title, emoji, cat in refs:
            process_reference(REF_DIR / file, name, title, emoji, cat, sheets)

    write_manifest(sheets)
    print("DONE", len(sheets))



if __name__ == "__main__":
    main()
