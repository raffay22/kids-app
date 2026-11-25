#!/usr/bin/env python3
"""
Kids Learning App — World-class 50-page worksheet PDF compiler
UK EYFS + US Common Core aligned · A4 · home print-friendly vector line-art

Usage:
  python scripts/generate_worksheets.py
  python scripts/generate_worksheets.py --one WB-MATH-01
  python scripts/generate_worksheets.py --upload

Output: public/worksheets/*.pdf
Optional: upload to Supabase bucket `worksheets` (age-*/category/ paths) when --upload and .env.local keys exist.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib.colors import Color, black, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "worksheets"
PAGE_W, PAGE_H = A4  # 595.27 x 841.89
MARGIN = 36

# Brand / print colors (covers use soft accent; interior = ink-saving black line art)
INK = black
LIGHT = Color(0.92, 0.92, 0.95)


@dataclass(frozen=True)
class Bundle:
    id: str
    title: str
    subtitle: str
    category: str  # maths | colouring | matching | verbs | pronouns
    badge: str
    accent: Color
    hero: str  # star|apple|ball|cat|run|she
    features: tuple[str, str, str]


def _c(r: float, g: float, b: float) -> Color:
    return Color(r, g, b)


BUNDLES: list[Bundle] = [
    # MATH 01-05
    Bundle("WB-MATH-01", "50-PAGE EARLY COUNTING & NUMBERS", "Interactive Early Learning & Tracing Pack for Ages 2–6", "maths", "🧮 COUNT", _c(0.39, 0.40, 0.95), "star", ("Trace 1–10", "Count objects", "Circle totals")),
    Bundle("WB-MATH-02", "50-PAGE NUMBER BONDS TO 10", "EYFS Number Sense · Common Core K.OA", "maths", "🧮 COUNT", _c(0.23, 0.51, 0.96), "apple", ("Make 10", "Part-part-whole", "Missing number")),
    Bundle("WB-MATH-03", "50-PAGE SHAPES & PATTERNS", "Geometry Foundations for Ages 2–6", "maths", "✏️ TRACE", _c(0.06, 0.73, 0.51), "ball", ("Trace shapes", "Continue patterns", "Sort by attribute")),
    Bundle("WB-MATH-04", "50-PAGE ADD & TAKE AWAY", "Early Addition & Subtraction Pack", "maths", "🧮 COUNT", _c(0.96, 0.62, 0.04), "star", ("Plus stories", "Take away", "Picture equations")),
    Bundle("WB-MATH-05", "50-PAGE COMPARE & MEASURE", "More / Less · Size · Length", "maths", "🔍 MATCH", _c(0.94, 0.27, 0.27), "cat", ("Bigger/smaller", "Tall/short", "Match sets")),
    # COLOR 01-05
    Bundle("WB-COLOR-01", "50-PAGE ANIMAL TRACING & COLOURING", "Calm Sensory Colouring for Ages 2–6", "colouring", "🎨 COLOUR", _c(0.99, 0.75, 0.14), "cat", ("Trace outlines", "Colour animals", "Name the animal")),
    Bundle("WB-COLOR-02", "50-PAGE FRUIT & FOOD COLOURING", "Healthy Foods Line-Art Pack", "colouring", "🎨 COLOUR", _c(0.93, 0.28, 0.60), "apple", ("Trace fruit", "Colour snacks", "Favourite food")),
    Bundle("WB-COLOR-03", "50-PAGE VEHICLE COLOURING", "Cars · Buses · Boats Outline Pack", "colouring", "🎨 COLOUR", _c(0.13, 0.59, 0.95), "ball", ("Trace wheels", "Colour vehicles", "Count windows")),
    Bundle("WB-COLOR-04", "50-PAGE NATURE & WEATHER", "Trees · Clouds · Sun Sensory Pages", "colouring", "🎨 COLOUR", _c(0.20, 0.78, 0.35), "star", ("Trace leaves", "Colour sky", "Weather words")),
    Bundle("WB-COLOR-05", "50-PAGE HOME & FAMILY", "Everyday Life Colouring Scenes", "colouring", "🎨 COLOUR", _c(0.61, 0.35, 0.95), "apple", ("Trace rooms", "Colour family", "Daily routines")),
    # MATCH 01-05
    Bundle("WB-MATCH-01", "50-PAGE PICTURE MATCHING", "Shadow · Pair · Same / Different", "matching", "🔍 MATCH", _c(0.02, 0.71, 0.83), "ball", ("Shadow match", "Find pairs", "Odd one out")),
    Bundle("WB-MATCH-02", "50-PAGE NOUN MATCHING", "Picture-to-Word Recognition Pack", "matching", "🔍 MATCH", _c(0.49, 0.23, 0.93), "apple", ("Picture→word", "Same meaning", "Category sort")),
    Bundle("WB-MATCH-03", "50-PAGE COLOUR & SIZE MATCH", "Attribute Matching for Ages 2–6", "matching", "🔍 MATCH", _c(0.98, 0.45, 0.09), "star", ("Match colour", "Match size", "Sort sets")),
    Bundle("WB-MATCH-04", "50-PAGE LIVING VS NON-LIVING", "Science Sorting & Category Grids", "matching", "🔍 MATCH", _c(0.16, 0.65, 0.27), "cat", ("Living?", "Non-living?", "Sort grids")),
    Bundle("WB-MATCH-05", "50-PAGE OPPOSITES MATCH", "Hot/Cold · Big/Small · Up/Down", "matching", "🔍 MATCH", _c(0.90, 0.22, 0.21), "ball", ("Opposites", "Pair cards", "Mini mazes")),
    # VERB 01-05
    Bundle("WB-VERB-01", "50-PAGE ACTION VERBS & NOUNS", "Run · Jump · Eat · Play Pack", "verbs", "✏️ TRACE", _c(0.25, 0.32, 0.71), "run", ("Trace verbs", "Act it out", "Verb vs noun")),
    Bundle("WB-VERB-02", "50-PAGE BODY ACTION VERBS", "Clap · Wave · Stomp · Stretch", "verbs", "✏️ TRACE", _c(0.88, 0.11, 0.28), "run", ("Body verbs", "Match action", "Sequence")),
    Bundle("WB-VERB-03", "50-PAGE PLAYGROUND VERBS", "Slide · Swing · Kick · Throw", "verbs", "✏️ TRACE", _c(0.05, 0.65, 0.91), "ball", ("Play verbs", "Picture stories", "Choose verb")),
    Bundle("WB-VERB-04", "50-PAGE HOME ROUTINE VERBS", "Wash · Brush · Sleep · Help", "verbs", "✏️ TRACE", _c(0.55, 0.25, 0.68), "apple", ("Routine verbs", "Day timeline", "Help at home")),
    Bundle("WB-VERB-05", "50-PAGE FEELING & SENSE VERBS", "See · Hear · Hug · Smile", "verbs", "✏️ TRACE", _c(0.96, 0.49, 0.00), "star", ("Sense verbs", "Feelings", "Kind actions")),
    # PRONOUN 01-05
    Bundle("WB-PRONOUN-01", "50-PAGE HE / SHE / IT PRONOUNS", "Gentle Pronoun Practice Pack", "pronouns", "✏️ TRACE", _c(0.31, 0.27, 0.90), "she", ("He / She / It", "Trace words", "Circle subject")),
    Bundle("WB-PRONOUN-02", "50-PAGE I / YOU / WE", "First Person Pronoun Pack", "pronouns", "✏️ TRACE", _c(0.02, 0.59, 0.41), "she", ("I / You / We", "Sentence stems", "Who is talking?")),
    Bundle("WB-PRONOUN-03", "50-PAGE THEY / THEM", "Plural Pronoun Recognition", "pronouns", "✏️ TRACE", _c(0.79, 0.16, 0.40), "she", ("They / Them", "Group pictures", "Choose pronoun")),
    Bundle("WB-PRONOUN-04", "50-PAGE MY / YOUR / HIS / HER", "Possessive Pronoun Pack", "pronouns", "✏️ TRACE", _c(0.12, 0.53, 0.90), "she", ("My / Your", "His / Her", "Belongings")),
    Bundle("WB-PRONOUN-05", "50-PAGE PRONOUN SENTENCES", "Build Simple Pronoun Sentences", "pronouns", "✏️ TRACE", _c(0.67, 0.28, 0.74), "she", ("Fill blanks", "Trace sentence", "Speak aloud")),
]


# ---------------------------------------------------------------------------
# Drawing helpers
# ---------------------------------------------------------------------------

def draw_rounded_rect(c: canvas.Canvas, x, y, w, h, r=10, stroke=1, fill=0):
    c.roundRect(x, y, w, h, r, stroke=stroke, fill=fill)


def header_block(c: canvas.Canvas, badge: str, page_no: int, total: int = 50):
    """Name / Date / Score + action badge on every interior page."""
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(1.5)
    draw_rounded_rect(c, MARGIN, PAGE_H - MARGIN - 54, PAGE_W - 2 * MARGIN, 54, 8, stroke=1, fill=0)

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN + 10, PAGE_H - MARGIN - 22, "Name: ________________")
    c.drawString(MARGIN + 220, PAGE_H - MARGIN - 22, "Date: ________")
    c.drawString(MARGIN + 380, PAGE_H - MARGIN - 22, "Score: ⭐⭐⭐⭐⭐")

    # Action badge pill
    c.setFillColor(LIGHT)
    c.setStrokeColor(INK)
    bw = c.stringWidth(badge, "Helvetica-Bold", 10) + 18
    draw_rounded_rect(c, MARGIN + 10, PAGE_H - MARGIN - 46, bw, 18, 9, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(MARGIN + 19, PAGE_H - MARGIN - 41, badge)

    c.setFont("Helvetica", 9)
    c.drawRightString(PAGE_W - MARGIN - 10, PAGE_H - MARGIN - 41, f"Page {page_no} / {total}")


def footer_note(c: canvas.Canvas):
    c.setFont("Helvetica", 8)
    c.setFillColor(Color(0.45, 0.45, 0.5))
    c.drawCentredString(PAGE_W / 2, 18, "Kids Learning Hub · Growva Business · Print at home · Colour the outlines")


def dashed(c: canvas.Canvas, on=True):
    if on:
        c.setDash(4, 4)
    else:
        c.setDash()


def draw_star(c: canvas.Canvas, cx, cy, r=28, dashed_outline=False):
    pts = []
    for i in range(10):
        ang = math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    p = c.beginPath()
    p.moveTo(pts[0][0], pts[0][1])
    for x, y in pts[1:]:
        p.lineTo(x, y)
    p.close()
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.drawPath(p, stroke=1, fill=1)
    dashed(c, False)


def draw_apple(c: canvas.Canvas, cx, cy, s=1.0, dashed_outline=False):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.ellipse(cx - 22 * s, cy - 24 * s, cx + 22 * s, cy + 20 * s, stroke=1, fill=1)
    c.line(cx, cy + 18 * s, cx + 6 * s, cy + 32 * s)
    # leaf
    c.ellipse(cx + 4 * s, cy + 24 * s, cx + 20 * s, cy + 36 * s, stroke=1, fill=1)
    dashed(c, False)


def draw_ball(c: canvas.Canvas, cx, cy, r=26, dashed_outline=False):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.circle(cx, cy, r, stroke=1, fill=1)
    c.line(cx - r, cy, cx + r, cy)
    c.arc(cx - r, cy - r * 0.4, cx + r, cy + r * 0.4, 200, 140)
    dashed(c, False)


def draw_cat(c: canvas.Canvas, cx, cy, s=1.0, dashed_outline=False):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.circle(cx, cy, 24 * s, stroke=1, fill=1)
    # ears
    p = c.beginPath()
    p.moveTo(cx - 18 * s, cy + 14 * s)
    p.lineTo(cx - 28 * s, cy + 34 * s)
    p.lineTo(cx - 6 * s, cy + 22 * s)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    p = c.beginPath()
    p.moveTo(cx + 18 * s, cy + 14 * s)
    p.lineTo(cx + 28 * s, cy + 34 * s)
    p.lineTo(cx + 6 * s, cy + 22 * s)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    c.circle(cx - 8 * s, cy + 4 * s, 3 * s, stroke=1, fill=0)
    c.circle(cx + 8 * s, cy + 4 * s, 3 * s, stroke=1, fill=0)
    c.line(cx, cy - 2 * s, cx, cy - 10 * s)
    dashed(c, False)


def draw_run_icon(c: canvas.Canvas, cx, cy, s=1.0, dashed_outline=False):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.circle(cx, cy + 22 * s, 8 * s, stroke=1, fill=1)
    c.line(cx, cy + 14 * s, cx - 4 * s, cy - 6 * s)
    c.line(cx - 4 * s, cy - 6 * s, cx - 18 * s, cy - 20 * s)
    c.line(cx - 4 * s, cy - 6 * s, cx + 14 * s, cy - 18 * s)
    c.line(cx, cy + 8 * s, cx + 16 * s, cy + 2 * s)
    c.line(cx, cy + 8 * s, cx - 16 * s, cy - 2 * s)
    dashed(c, False)


def draw_she_icon(c: canvas.Canvas, cx, cy, s=1.0, dashed_outline=False):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    if dashed_outline:
        dashed(c, True)
    c.circle(cx, cy + 18 * s, 10 * s, stroke=1, fill=1)
    c.ellipse(cx - 16 * s, cy - 22 * s, cx + 16 * s, cy + 10 * s, stroke=1, fill=1)
    dashed(c, False)


def hero_draw(c: canvas.Canvas, kind: str, cx, cy, scale=1.0, dashed_outline=False):
    if kind == "apple":
        draw_apple(c, cx, cy, scale, dashed_outline)
    elif kind == "ball":
        draw_ball(c, cx, cy, 26 * scale, dashed_outline)
    elif kind == "cat":
        draw_cat(c, cx, cy, scale, dashed_outline)
    elif kind == "run":
        draw_run_icon(c, cx, cy, scale, dashed_outline)
    elif kind == "she":
        draw_she_icon(c, cx, cy, scale, dashed_outline)
    else:
        draw_star(c, cx, cy, 28 * scale, dashed_outline)


def draw_trace_letter(c: canvas.Canvas, letter: str, x, y, size=48):
    c.setStrokeColor(INK)
    c.setFillColor(white)
    c.setLineWidth(2)
    dashed(c, True)
    c.setFont("Helvetica-Bold", size)
    # outline trick: draw text as path-like via repeated offset strokes
    c.setFillColor(INK)
    c.setStrokeColor(INK)
    # ReportLab can't easily stroke text; draw dashed guide box + big letter lightly
    dashed(c, False)
    c.setFillColor(Color(0.75, 0.75, 0.78))
    c.setFont("Helvetica-Bold", size)
    c.drawCentredString(x, y, letter)
    dashed(c, True)
    c.setStrokeColor(INK)
    c.setLineWidth(1.5)
    c.rect(x - size * 0.45, y - 8, size * 0.9, size * 0.95, stroke=1, fill=0)
    dashed(c, False)
    c.setFillColor(INK)
    c.setFont("Helvetica", 10)
    c.drawCentredString(x, y - 22, "TRACE")


# ---------------------------------------------------------------------------
# Cover (Amazon / Etsy style)
# ---------------------------------------------------------------------------

def _wrap_title(c: canvas.Canvas, title: str, font: str, size: float, max_w: float) -> list[str]:
    words = title.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, font, size) < max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines[:4]


def draw_cover(c: canvas.Canvas, b: Bundle):
    """Amazon KDP / Etsy-style premium cover — unique badges per bundle."""
    # Soft pastel wash from accent
    c.setFillColor(Color(
        min(1, b.accent.red * 0.18 + 0.92),
        min(1, b.accent.green * 0.18 + 0.92),
        min(1, b.accent.blue * 0.18 + 0.94),
    ))
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    # Outer decorative border (6pt coloured rounded frame)
    c.setStrokeColor(b.accent)
    c.setLineWidth(6)
    draw_rounded_rect(c, 18, 18, PAGE_W - 36, PAGE_H - 36, 20, stroke=1, fill=0)
    c.setLineWidth(1.25)
    c.setStrokeColor(INK)
    draw_rounded_rect(c, 30, 30, PAGE_W - 60, PAGE_H - 60, 14, stroke=1, fill=0)

    # Corner ornaments (Etsy-style)
    for ox, oy, sx, sy in ((48, PAGE_H - 48, 1, -1), (PAGE_W - 48, PAGE_H - 48, -1, -1),
                           (48, 48, 1, 1), (PAGE_W - 48, 48, -1, 1)):
        c.setStrokeColor(b.accent)
        c.setLineWidth(2)
        c.line(ox, oy, ox + 22 * sx, oy)
        c.line(ox, oy, ox, oy + 22 * sy)

    # Top header pill
    pill = "KIDS LEARNING & SENSORY HUB — OFFICIAL WORKBOOK"
    c.setFillColor(b.accent)
    tw = c.stringWidth(pill, "Helvetica-Bold", 9) + 32
    px = (PAGE_W - tw) / 2
    c.roundRect(px, PAGE_H - 88, tw, 24, 12, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 80, pill)

    # Main title 36pt Helvetica Bold
    c.setFillColor(INK)
    title_size = 36
    lines = _wrap_title(c, b.title, "Helvetica-Bold", title_size, PAGE_W - 110)
    while len(lines) > 3 and title_size > 24:
        title_size -= 2
        lines = _wrap_title(c, b.title, "Helvetica-Bold", title_size, PAGE_W - 110)
    y = PAGE_H - 140
    c.setFont("Helvetica-Bold", title_size)
    for line in lines:
        c.drawCentredString(PAGE_W / 2, y, line)
        y -= title_size + 4

    # Subtitle 16pt
    c.setFont("Helvetica", 16)
    c.setFillColor(Color(0.22, 0.22, 0.28))
    sub = b.subtitle if b.subtitle else "Interactive Early Learning & Tracing Pack for Ages 2–6"
    sub_lines = _wrap_title(c, sub, "Helvetica", 16, PAGE_W - 120)
    for sl in sub_lines[:2]:
        c.drawCentredString(PAGE_W / 2, y - 6, sl)
        y -= 20

    # Hero subject in soft circle
    cx, cy, R = PAGE_W / 2, PAGE_H / 2 - 20, 96
    c.setFillColor(Color(1, 1, 1))
    c.setStrokeColor(b.accent)
    c.setLineWidth(5)
    c.circle(cx, cy, R, stroke=1, fill=1)
    c.setFillColor(Color(
        min(1, b.accent.red * 0.12 + 0.94),
        min(1, b.accent.green * 0.12 + 0.94),
        min(1, b.accent.blue * 0.12 + 0.96),
    ))
    c.setStrokeColor(INK)
    c.setLineWidth(1.25)
    c.circle(cx, cy, R - 12, stroke=1, fill=1)
    hero_draw(c, b.hero, cx, cy + 4, 1.85)

    # Action badge under hero
    c.setFillColor(white)
    c.setStrokeColor(INK)
    c.setLineWidth(1.5)
    abw = c.stringWidth(b.badge, "Helvetica-Bold", 12) + 28
    draw_rounded_rect(c, cx - abw / 2, cy - R - 36, abw, 22, 11, stroke=1, fill=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(cx, cy - R - 29, b.badge)

    # 3 feature badges — unique Amazon/Etsy style per slot + per bundle
    badge_y = 108
    bw = 152
    gap = 10
    start_x = (PAGE_W - (3 * bw + 2 * gap)) / 2
    icons = ("★", "◆", "●")
    # rotate tip flavour by bundle id so covers differ
    tip_sets = [
        ("BESTSELLER STYLE", "PRINT AT HOME", "AGES 2–6"),
        ("PARENT FAVOURITE", "50 ACTIVITY PAGES", "INK-SAVING ART"),
        ("CLASSROOM READY", "TRACE & LEARN", "EYFS ALIGNED"),
        ("INSTANT DOWNLOAD", "COLOUR & TRACE", "COMMON CORE K"),
        ("SENSORY FRIENDLY", "PROGRESSIVE LEVELS", "GROWVA ORIGINAL"),
    ]
    tip_row = tip_sets[sum(ord(ch) for ch in b.id) % len(tip_sets)]
    for i, feat in enumerate(b.features):
        x = start_x + i * (bw + gap)
        # Distinct badge shapes: filled accent / white / thick outline
        if i == 0:
            c.setFillColor(b.accent)
            c.setStrokeColor(b.accent)
            c.setLineWidth(2)
            draw_rounded_rect(c, x, badge_y, bw, 52, 14, stroke=1, fill=1)
            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + bw / 2, badge_y + 34, f"{icons[i]} {tip_row[i]}")
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(x + bw / 2, badge_y + 14, feat.upper()[:18])
        elif i == 1:
            c.setFillColor(white)
            c.setStrokeColor(INK)
            c.setLineWidth(3)
            draw_rounded_rect(c, x, badge_y, bw, 52, 8, stroke=1, fill=1)
            c.setFillColor(b.accent)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + bw / 2, badge_y + 34, f"{icons[i]} {tip_row[i]}")
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(x + bw / 2, badge_y + 14, feat.upper()[:18])
        else:
            c.setFillColor(white)
            c.setStrokeColor(b.accent)
            c.setLineWidth(2.5)
            # pill-ish
            draw_rounded_rect(c, x, badge_y, bw, 52, 26, stroke=1, fill=1)
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + bw / 2, badge_y + 34, f"{icons[i]} {tip_row[i]}")
            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(b.accent)
            c.drawCentredString(x + bw / 2, badge_y + 14, feat.upper()[:18])

    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(b.accent)
    c.drawCentredString(PAGE_W / 2, 68, f"{b.id}  ·  50 PAGES  ·  PRINTABLE PDF")
    c.setFont("Helvetica", 8)
    c.setFillColor(Color(0.35, 0.35, 0.4))
    c.drawCentredString(PAGE_W / 2, 50, "UK EYFS & US Common Core inspired · Growva Kids Learning App")


# ---------------------------------------------------------------------------
# Interior page generators by level
# ---------------------------------------------------------------------------

def content_top() -> float:
    return PAGE_H - MARGIN - 70


def page_title(c: canvas.Canvas, text: str, y: float) -> float:
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN, y, text)
    return y - 28


def instruction(c: canvas.Canvas, text: str, y: float) -> float:
    c.setFont("Helvetica", 12)
    c.setFillColor(Color(0.2, 0.2, 0.25))
    c.drawString(MARGIN, y, text)
    return y - 22


def level_for_page(page_index: int) -> int:
    """page_index 2..50 → level 1/2/3 (page 1 is cover)."""
    if page_index <= 11:
        return 1
    if page_index <= 31:
        return 2
    return 3


def draw_level1(c: canvas.Canvas, b: Bundle, page_index: int):
    y = content_top()
    n = (page_index - 2) % 10 + 1
    y = page_title(c, f"Level 1 · Large practice · Set {n}", y)
    y = instruction(c, "Trace the big guide, then colour the picture. Take your time.", y)

    # Big tracing numeral / letter depending on category
    if b.category == "maths":
        draw_trace_letter(c, str(n % 10), PAGE_W / 2 - 80, y - 80, 72)
        hero_draw(c, b.hero, PAGE_W / 2 + 90, y - 50, 1.3, dashed_outline=True)
        y -= 160
        y = instruction(c, f"Count and colour {n} stars below.", y)
        for i in range(n):
            draw_star(c, MARGIN + 40 + i * 52, y - 30, 18)
    elif b.category in ("colouring", "matching"):
        hero_draw(c, b.hero, PAGE_W / 2, y - 70, 2.2, dashed_outline=True)
        y -= 180
        y = instruction(c, "Colour the outline. Keep inside the black lines.", y)
        for i in range(3):
            hero_draw(c, b.hero, MARGIN + 70 + i * 150, y - 50, 0.9)
    elif b.category == "verbs":
        verbs = ["RUN", "JUMP", "EAT", "PLAY", "CLAP", "WAVE", "SIT", "HUG", "LOOK", "HELP"]
        word = verbs[(page_index - 2) % len(verbs)]
        draw_trace_letter(c, word[0], PAGE_W / 2 - 100, y - 70, 64)
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(Color(0.7, 0.7, 0.75))
        c.drawCentredString(PAGE_W / 2 + 40, y - 50, word)
        hero_draw(c, "run", PAGE_W / 2, y - 160, 1.4, dashed_outline=True)
    else:  # pronouns
        words = ["HE", "SHE", "IT", "I", "YOU", "WE", "THEY", "MY", "YOUR", "HIS"]
        word = words[(page_index - 2) % len(words)]
        draw_trace_letter(c, word, PAGE_W / 2, y - 70, 56)
        hero_draw(c, "she", PAGE_W / 2, y - 180, 1.5, dashed_outline=True)
        y = instruction(c, f'Circle the pictures that match "{word}".', y - 240)


def draw_level2(c: canvas.Canvas, b: Bundle, page_index: int):
    y = content_top()
    n = page_index - 11
    y = page_title(c, f"Level 2 · Match & recognise · Card {n}", y)
    y = instruction(c, "Draw a line to match each pair. Colour when finished.", y)

    left_x, right_x = MARGIN + 50, PAGE_W - MARGIN - 50
    for i in range(4):
        yy = y - 40 - i * 110
        hero_draw(c, b.hero, left_x, yy, 0.85)
        # shadow / pair box
        c.setStrokeColor(INK)
        c.setLineWidth(1.5)
        c.setFillColor(white)
        c.rect(right_x - 40, yy - 40, 80, 80, stroke=1, fill=1)
        if b.category == "matching" and i % 2 == 0:
            # filled shadow silhouette (still line-art: denser hatch)
            c.setStrokeColor(INK)
            for h in range(-30, 31, 6):
                c.line(right_x - 30, yy + h, right_x + 30, yy + h)
        else:
            hero_draw(c, b.hero, right_x, yy, 0.7, dashed_outline=True)
        # match dots
        c.circle(left_x + 45, yy, 4, stroke=1, fill=0)
        c.circle(right_x - 45, yy, 4, stroke=1, fill=0)
        dashed(c, True)
        c.line(left_x + 55, yy, right_x - 55, yy)
        dashed(c, False)

    if b.category == "maths":
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN, MARGIN + 40, f"Bonus: How many pictures on the left? ______  (hint: 4)")


def draw_level3(c: canvas.Canvas, b: Bundle, page_index: int):
    y = content_top()
    n = page_index - 31
    y = page_title(c, f"Level 3 · Think & sort · Challenge {n}", y)
    y = instruction(c, "Sort into the grid. Then finish the pattern and maze path.", y)

    # 2x2 categorization grid
    gw, gh = (PAGE_W - 2 * MARGIN - 12) / 2, 150
    labels = {
        "maths": ("EVEN", "ODD", "SHAPES", "NUMBERS"),
        "colouring": ("ANIMAL", "FOOD", "HOME", "NATURE"),
        "matching": ("LIVING", "NON-LIVING", "BIG", "SMALL"),
        "verbs": ("VERBS", "NOUNS", "ACTIONS", "THINGS"),
        "pronouns": ("HE/SHE", "IT", "I/YOU", "THEY"),
    }[b.category]
    for i, lab in enumerate(labels):
        col, row = i % 2, i // 2
        x = MARGIN + col * (gw + 12)
        yy = y - (row + 1) * (gh + 10)
        c.setStrokeColor(INK)
        c.setLineWidth(1.5)
        c.setFillColor(white)
        draw_rounded_rect(c, x, yy, gw, gh, 8, stroke=1, fill=1)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(INK)
        c.drawCentredString(x + gw / 2, yy + gh - 18, lab)
        # empty sorting circles
        for k in range(3):
            c.circle(x + 40 + k * 55, yy + 55, 18, stroke=1, fill=0)

    # Pattern row
    py = y - 2 * (gh + 10) - 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN, py + 30, "Complete the pattern:")
    for i in range(6):
        x = MARGIN + 30 + i * 85
        if i < 4:
            hero_draw(c, b.hero if i % 2 == 0 else "star", x, py - 10, 0.55)
        else:
            c.setStrokeColor(INK)
            dashed(c, True)
            c.circle(x, py - 10, 20, stroke=1, fill=0)
            dashed(c, False)

    # Mini maze
    my = MARGIN + 70
    c.setFont("Helvetica-Bold", 11)
    c.drawString(MARGIN, my + 95, "Mini maze — help the star reach home:")
    c.setStrokeColor(INK)
    c.setLineWidth(2)
    c.rect(MARGIN, my, PAGE_W - 2 * MARGIN, 85, stroke=1, fill=0)
    # simple maze lines
    c.line(MARGIN + 40, my, MARGIN + 40, my + 55)
    c.line(MARGIN + 120, my + 30, MARGIN + 120, my + 85)
    c.line(MARGIN + 220, my, MARGIN + 220, my + 50)
    c.line(MARGIN + 320, my + 35, MARGIN + 320, my + 85)
    c.line(MARGIN + 420, my, MARGIN + 420, my + 60)
    draw_star(c, MARGIN + 20, my + 20, 10)
    c.setFont("Helvetica", 9)
    c.drawRightString(PAGE_W - MARGIN - 8, my + 8, "HOME ★")


def draw_interior(c: canvas.Canvas, b: Bundle, page_index: int):
    header_block(c, b.badge, page_index)
    level = level_for_page(page_index)
    if level == 1:
        draw_level1(c, b, page_index)
    elif level == 2:
        draw_level2(c, b, page_index)
    else:
        draw_level3(c, b, page_index)
    footer_note(c)


# ---------------------------------------------------------------------------
# Build one / all bundles
# ---------------------------------------------------------------------------

def generate_bundle(b: Bundle, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{b.id}.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"{b.id} — {b.title}")
    c.setAuthor("Growva Business · Kids Learning App")
    c.setSubject("EYFS / Common Core printable worksheet pack")

    # Page 1 — Amazon-style cover
    draw_cover(c, b)
    c.showPage()

    # Pages 2–50
    for page_index in range(2, 51):
        draw_interior(c, b, page_index)
        c.showPage()

    c.save()
    return path


def write_manifest(out_dir: Path, generated: list[Bundle]):
    payload = {
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat().replace("+00:00", "Z"),
        "standards": ["UK EYFS", "US Common Core (K)"],
        "pageSize": "A4",
        "pagesPerBundle": 50,
        "bundles": [
            {
                "id": b.id,
                "title": b.title,
                "category": b.category,
                "pages": 50,
                "pdfUrl": f"/worksheets/{b.id}.pdf",
                "blurb": b.subtitle,
                "pricePkr": 150,
            }
            for b in generated
        ],
    }
    (out_dir / "manifest.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_env_local():
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        v = v.strip().strip('"').strip("'")
        os.environ.setdefault(k.strip(), v)


def storage_path_for_bundle(bundle_id: str, file_name: str) -> str:
    """Map legacy bundle ids into worksheets age/category taxonomy paths."""
    # Default middle age band for the EYFS catalog generator.
    age = "age-4-6"
    cat = "english"
    if bundle_id.startswith("WB-MATH"):
        cat = "math"
    elif bundle_id.startswith("WB-COLOR"):
        cat = "colouring"
    elif bundle_id.startswith("WB-MATCH"):
        cat = "math" if "MATCH-04" in bundle_id else "english"
    elif bundle_id.startswith("WB-VERB") or bundle_id.startswith("WB-PRONOUN"):
        cat = "english"
    return f"{age}/{cat}/{file_name}"


def upload_to_supabase(files: list[Path]):
    """Upload one PDF at a time to public bucket `worksheets` (age/category paths)."""
    try:
        from supabase import create_client
    except ImportError:
        print("pip install supabase  # required for --upload")
        return

    load_env_local()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — skip upload")
        return

    client = create_client(url, key)
    bucket = "worksheets"
    try:
        client.storage.create_bucket(bucket, options={"public": True})
    except Exception:
        pass

    by_name = {b.id + ".pdf": b.id for b in BUNDLES}
    for f in files:
        data = f.read_bytes()
        bundle_id = by_name.get(f.name, f.stem)
        object_path = storage_path_for_bundle(bundle_id, f.name)
        print(f"Uploading {object_path} ({len(data)//1024} KB)…")
        client.storage.from_(bucket).upload(
            object_path,
            data,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
        print(f"  OK {object_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--one", help="Generate a single bundle id, e.g. WB-MATH-01")
    parser.add_argument("--upload", action="store_true", help="Upload PDFs to Supabase worksheets bucket")
    args = parser.parse_args()

    selected = BUNDLES
    if args.one:
        selected = [b for b in BUNDLES if b.id == args.one]
        if not selected:
            print(f"Unknown bundle {args.one}")
            sys.exit(1)

    print(f"Generating {len(selected)} × 50-page A4 worksheet PDFs → {OUT_DIR}")
    paths: list[Path] = []
    for b in selected:
        p = generate_bundle(b, OUT_DIR)
        size = p.stat().st_size
        print(f"  wrote {p.name} ({size/1024:.0f} KB)")
        paths.append(p)

    write_manifest(OUT_DIR, selected if args.one else BUNDLES)
    print("manifest.json updated")

    if args.upload:
        upload_to_supabase(paths)

    print("DONE")


if __name__ == "__main__":
    main()
