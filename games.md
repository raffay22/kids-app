# 🎮 Early 3D Math Lab (`/games/math`) — LIVE

### Game Structure

**Level 1: Toddlers (Under 3 Years)** — Visual Object Addition & Counting
- Visual Math: 🍓🍓 2 Strawberries + 🍓🍓 2 Strawberries = ❓
- Interaction: Child taps each strawberry; voice counts (`"1!"` … `"4!"`). Correct total makes fruits pop and bounce.
- Focus: Visual association (no abstract symbols, zero stress).

**Level 2: Explorers (3+ Years)** — Coins Addition, Subtraction & Basic Groups
- Addition with Coins: 🪙🪙 2 Gold Coins + 🪙🪙🪙🪙 4 Gold Coins = 6
- Subtraction with Coins: drag take-away coins into the Saving Box 🐻
- Basic Groups (intro multiplication): 2 groups of 2 Apples = 4 🍎🍎 | 🍎🍎

**Level 3: Pro Challenge (7–8 Years · Pro)** — Harder ops + real multiplication
- Times tables with fruit arrays (e.g. 4 × 5)
- Harder addition / subtraction within ~30
- Missing factor: `5 × ? = 20`
- Gated to Pro / open-access

---

### 📋 Cursor / Grok Agent Execution Prompt (`/games/math`)

Aap yeh prompt direct copy karke apne Agent ko de sakti hain:

```
[ROLE: Senior Next.js 15 Web Game Developer & Early Childhood Math UX Specialist]
You are tasked with building the 3D Early Math & Fruit Counter Game at route `/games/math`.
Deliver a commercial-grade, tactile 3D kids puzzle UI (inspired by top Play Store math apps like Endless Numbers).

[ASSET RE-USE DIRECTIVE]
Strictly RE-USE existing 3D visual assets from `alphabet_phonics_3d_schema.json`
(3D Apple, Strawberry, Banana) and gold coins from `/games/coin-shop`.
Do NOT create or fetch new raster graphics.

[AGE-SEPARATED GAME MODES & MATH LOGIC]

1. AGE SELECTION SCREEN:
   - 👶 Mode A: Toddler Visual Math (Under 3 Years)
   - 👦 Mode B: Explorer Coin Math & Subtraction (3+ Years)
   - 🧠 Mode C: Pro Challenge Math (7–8 Years · Pro)

2. MODE A: TODDLER VISUAL MATH (UNDER 3 YEARS):
   - Two floating glass trays of phonics fruit videos (e.g. 🍓🍓 + 🍓🍓)
   - Touch-to-count with gold ring + spoken `"1!"`, `"2!"`, …
   - Three tactile number cards; correct answer plays `playDing()` +
     `"2 Strawberries plus 2 Strawberries equals 4 Strawberries!"`

3. MODE B: EXPLORER COIN MATH & SUBTRACTION (3+ YEARS):
   - ADDITION: coins trays + total jar drag OR number card
   - SUBTRACTION: drag take-away coins into Saving Box 🐻 (`playBankSave()`), then answer
   - GROUPS: baskets of apples — `"2 groups of 2 apples make 4 apples!"`

3b. MODE C: PRO CHALLENGE (7–8 YEARS):
   - MULTIPLY: visual fruit arrays + `a × b`
   - HARD ADD / HARD SUB: larger numbers with equation cards
   - MISSING FACTOR: `a × ? = product`
   - Requires Pro (or open-access test mode)

4. FEEDBACK & CELEBRATION:
   - Correct: spring bounce `scale: [1, 1.25, 1]`, confetti, +5 Stars, next round
   - Incorrect: wiggle `x: [-5, 5, -5, 0]`, `"Good try! Let's count them together again!"` (zero penalty)

5. TIER CONTROL & GATING:
   - Import `isProUser` from `lib/membership.ts`
   - Free: 3 math rounds per session
   - Pro / open-access: unlimited rounds
```

**Implementation status:** Live at `/games/math` · catalog `early-math-lab` · Modes A/B/C (Toddler, Explorer, Pro 7–8) · Saving Box 🐻 · Pro multiply + hard add/sub + missing factor · free 3 rounds / Pro unlimited.

---

## 🎮 Shape Blast (planned)

1. **3D Tactile Shapes (Three.js / WebGL):**
  * Flat graphics ke bajaye Three.js ke 3D Meshes honge: **3D Glowing Sphere (Circle) 🔵**, **3D Soft Cube (Square) 🟥**, **3D Sparkling Star ⭐**, **3D Pyramid (Triangle) 🔺**, aur **3D Heart 🩷**.
2. **Kid-Friendly Blast Physics:**
  * Jab bacha 3 ya us se ziada same shapes ko match/tap karega, toh shapes **3D Particle Confetti Burst** ke saath pop hongi!
3. **Phonics &amp; Audio Integration:**
  * Jab Star match hoga toh voice bolegi: *"Star! ⭐"*, jab Circle match hoga: *"Circle! 🔵"*. Is se bacha khele khele mein shape names seekh jayega.
4. **No-Stress Play:**
  * Bachon ke liye koi mushkil timer nahi hoga — sirf target complete karna hoga (jaise *"Blast 5 Stars to win! ⭐"*).

---

### 📋 Cursor / Grok Agent Execution Prompt (`/games/shape-blast`)

Aap yeh prompt direct copy karke apne Agent ko de sakti hain:

```
[ROLE: Senior Next.js 15 WebGL Game Architect &amp; Three.js Specialist]
You are tasked with building the 3D Tactile Shape Blast Game at route `/games/shape-blast`.

[GAME MECHANICS &amp; 3D WEBGL GRAPHICS]

1. 3D SHAPE MESHES &amp; GRID (React Three Fiber / Three.js):
   - Render a 5x5 or 6x6 3D grid of vibrant geometric meshes:
     - 🔵 3D Sphere (Circle)
     - 🟥 3D Round-cornered Cube (Square)
     - ⭐ 3D Sparkling Star
     - 🔺 3D Pyramid (Triangle)
     - 🩷 3D Heart
   - Display a frosted glass 3D viewport canvas.

2. MATCH &amp; BLAST MECHANICS:
   - Tap or Swipe Connection: When the child taps a cluster of 3+ adjacent identical shapes OR drags a line connecting them:
     a. 3D Pop Physics: Shapes scale up (`scale: 1.3`), execute a 3D spring spin, and burst into colorful star particles.
     b. Play Web Audio pop chime (`playPop()`) + Vocal pronunciation of the shape: `"Star! ⭐"` or `"Circle! 🔵"`.
     c. Top shapes tumble down smoothly along the Y-axis to fill empty slots (`useFrame` physics loop).
     d. Award +5 Stars (⭐) per blast.

3. AGE-BASED TARGET OBJECTIVES:
   - Level 1 (Toddlers 2-3): "Blast 5 Circles! 🔵"
   - Level 2 (Explorers 3-5): "Blast 8 Stars &amp; 8 Cubes! ⭐🟥"
   - Display a top progress bar with target counters.

4. REWARDS &amp; TIER LIMITS:
   - Completing the target triggers a big 3D star confetti burst + voice celebration: `"Woohoo! You are a Shape Master!"`.
   - Import `isProUser` from `lib/membership.ts`.
   - Free Tier: Access up to 3 Shape Blast rounds per session.
   - Pro Tier: Unlimited rounds and advanced 3D shapes unlocked.
```

## Word Search (`/games/word-search`) — LIVE

### 🎨 Newspaper + Colorful Kids UI Style Specs:

1. **Background:** Colorful Soft Pastel Canvas (`bg-gradient-to-br from-amber-100 via-pink-100 to-purple-100`).
2. **Main Game Card (The Newspaper Board):**
  * Warm Paper Texture Card (`bg-[#FFFDF7]` / Off-white newsprint paper style).
  * Classic Newspaper Header Banner: `"📰 DAILY KIDS WORD PUZZLE"` with retro/clean bold typography.
  * Dashed/Drawn grid lines around letters like a real newspaper puzzle column.
3. **Pencil / Crayon Highlighter Effect:** Jab bacha finger se letters connect karega, toh yellow/pink **crayon marker line** banti hui dikhegi (jaise newspaper par marker se circle banate hain).
4. **Target Words Section:** Top par newspaper cutout tags ki tarah words show honge jo find hone par marker se strikethrough (cross-out) ho jayein ge.

---
### `/games/word-search`) Mechanics

1. **Age-Based Difficulty Levels:**
  * **Level 1 (Ages 2-3):** 3-Letter Words (CAT, DOG, SUN, BUS, CUP) [cite: 441, 462].
  * **Level 2 (Ages 3-4):** 4-Letter Words (FISH, DUCK, FROG, STAR, BEAR) [cite: 441, 462].
  * **Level 3 (Ages 4-5):** 5-Letter Words (APPLE, PANDA, ROBOT, CLOUD, TIGER) [cite: 441, 462].
  * **Level 4 (Ages 5-6):** 6-Letter Words (MONKEY, TURTLE, RABBIT, PENCIL, BANANA) [cite: 441, 462].

### 📋 Updated 

  / Grok Agent Prompt (Copy &amp; Paste)

Aap yeh updated prompt direct Agent ko de sakti hain:

```
[ROLE: Senior Next.js 15 UI/UX &amp; Game Developer]
AGENT MANDATE: Re-architect the Word Search Game UI at `/games/word-search` to combine a Classic Newspaper Print Puzzle Grid with a Vibrant Colorful Kids Background.

[NEWSPAPER PRINT + COLORFUL KIDS DESIGN SYSTEM]

1. COLORFUL OUTER CANVAS:
   - Screen Canvas: Vibrant multi-tone pastel gradient (`bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100 min-h-screen p-4`).

2. NEWSPAPER PRINT GAME CARD:
   - Main Grid Container: Render a tactile 3D Newsprint Sheet (`bg-[#FFFDF9] border-4 border-amber-900/20 shadow-2xl rounded-3xl p-6`).
   - Newspaper Header Banner:
     - Top Badge: `"📰 DAILY KIDS WORD PUZZLE"` styled like a classic newspaper headline banner.
   - Grid Styling: Clean grid with dashed column dividers (`border-dashed border-amber-900/20`), featuring crisp bold typography (`font-bold text-slate-800`).

3. CRAYON / MARKER FINGER HIGHLIGHTER:
   - Touch Drag Line: When dragging across letters, render a translucent neon yellow/pink crayon marker trail (`bg-yellow-300/60 backdrop-blur-xs rounded-full`).
   - When a word is found: The crayon line permanently locks over the word with a cheerful spring bounce.

4. UNDO &amp; TARGET WORD TRAY:
   - Target Words: Display target word chips styled like newspaper article tags at the top.
   - Strikethrough Effect: Found words get crossed out with a playful red marker stroke + 3D Phonics Icon reveal.
   - Floating ↺ "Reset Line" button styled as a cute eraser icon (`bg-rose-400 text-white rounded-full p-3 shadow-lg`).

5. LEVEL SELECTION &amp; TIER LIMITS:
   - Retain 4 age-based levels: 3-letter, 4-letter, 5-letter, and 6-letter words (10 words per puzzle).
   - Import `isProUser` from `lib/membership.ts` for Free vs Pro gating
```

---

## 3D Picture Frame Puzzle (`/games/picture-puzzle`) — LIVE

**Picture puzzle (not video):** still JPGs extracted from phonics MP4s into `public/puzzle-stills/`.

### Layout (3 sections)

1. **Top target (small height):** full completed picture so kids know what to build.
2. **Build board (largest height):** empty cardboard-style slots — **no ghost/guide image**. Kids study section 1 and place pieces themselves (real physical-puzzle feel).
3. **Piece tray (small height):** cutout still tiles from the same picture; drag/tap to snap.

### Piece banks

- **Basic (free):** 2×2 = **4 pieces** · **60** stills (`a1_apple` … through early M).
- **Advanced (Pro):** 2×4 = **8 pieces** · **60 different** stills (no overlap with basic).

### Play rules

- Drag within snap radius or tap piece → tap slot; wrong slot wiggles + “Try putting it in another slot!”
- Complete: bounce + confetti + `"Awesome job! You built the 3D [Item]!"` +5 stars · free 3 rounds / Pro unlimited.
- Regenerate stills: `node scripts/extract-puzzle-stills.mjs`

