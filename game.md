### 15-Sub-Level Architecture Blueprint

* **Group 1: Tiny Explorers (Ages 2 to 4)**
  * **Level 1:** Primary Shapes (Circle, Square, Triangle) + "Red Circle... BOOM!"
  * **Level 2:** Extended Shapes (Star, Heart, Oval, Diamond) + "Yellow Star... BOOM!"
  * **Level 3:** Single Color Challenges (*"Blast only BLUE!"*)
  * **Level 4:** Big vs Small Shapes (*"Blast only BIG shapes!"*)
  * **Level 5:** Fast Shape Rainbow Mix (Final Mastery Test to unlock Group 2)


  \# TASK: BUILD BRAND NEW "BLOOM BLAST" (GRID LINK &amp; MATCH-3 PUZZLE) - STEP 1 (LEVEL 1) Build a fresh, tile-based Link &amp; Connect Match-3 puzzle game at \`/app/games/bloom-blast/page.tsx\` for toddlers (Ages 2-4). ## 1\. GAME BOARD &amp; GRID (BOXES) - Create a clean 5x5 grid of rounded glass/wooden garden boxes. - Each box contains one colorful 3D shape: \* Red Circle \* Blue Square \* Yellow Triangle \* Green Star ## 2\. TOUCH &amp; DRAG MECHANIC (FINGER LINK) - The child touches one shape (e.g. Red Circle) and drags their finger to connect adjacent matching shapes (horizontal, vertical, or diagonal). - Draw a glowing neon line/vine following the finger as it connects the tiles. - Minimum Match: 3 connected shapes. - Connected tiles gently pulse and glow. ## 3\. THE "BOOM!" RELEASE &amp; REFILL - When the child lifts their finger: \* If 3 or more matched: - All connected tiles shatter with crystal glass particles! - Trigger voiceover: \`${color} ${shape}... BOOM!\` (e.g., "Red Circle... BOOM!"). - Empty boxes are refilled by new shapes falling down from the top (gravity drop). - Add +1 to the blast counter. \* If less than 3 connected: - The line disappears harmlessly and tiles return to normal. ## 4\. WIN CONDITION (LEVEL 1) - Target: Complete 10 successful matches to win Level 1\. - Star progress bar at the top filling up towards 10\. - Celebratory modal when 10 matches are reached.


  ### 🌟 STAGE 2: CURIOUS MINDS (AGES 4 TO 6) — LEVELS 6 TO 10

Is age group ka focus **Vocabulary Expansion, Adjectives, aur Category Filtering** par hai:

* **Level 6 (Sweet &amp; Crunchy Fruits):**
  * *Items:* Apple, Banana, Strawberry, Orange, Grapes, Watermelon.
  * *Voiceover:* `[Adjective] + [Fruit] + "... BOOM!"` *(e.g., "Crunchy Apple... BOOM!", "Sweet Strawberry... BOOM!", "Juicy Orange... BOOM!")*
* **Level 7 (Healthy Garden Vegetables):**
  * *Items:* Carrot, Broccoli, Tomato, Corn, Peas, Pumpkin.
  * *Voiceover:* `[Adjective] + [Vegetable] + "... BOOM!"` *(e.g., "Fresh Carrot... BOOM!", "Green Broccoli... BOOM!", "Yummy Corn... BOOM!")*
* **Level 8 (Vehicles &amp; Fast Transport):**
  * *Items:* Car, Airplane, Rocket, Train, Boat, Bicycle.
  * *Voiceover:* `[Adjective] + [Vehicle] + "... BOOM!"` *(e.g., "Speedy Car... BOOM!", "Flying Airplane... BOOM!", "Fast Rocket... BOOM!")*
* **Level 9 (Category Classification Challenge):**
  * *Top HUD Banner:* **"Blast only VEGETABLES!"**
  * *Screen Spawn:* Mixed fruits aur vegetables sath girenge.
  * *Gameplay:* Sirf sabziyon ko slice karna hai. Agar bacha fruit slice karega toh soft water-drop sound ke sath 1 life minus hogi.
* **Level 10 (Color + Category Double Combo):**
  * *Top HUD Banner:* **"Blast only GREEN VEGETABLES!"** ya **"Blast only RED FRUITS!"**
  * *Cognitive Test:* Bacha do alag attributes (Color + Food Type) ko ek sath process karega.

---

#### 🚀 CURSOR AGENT PROMPT: GROUP 2 (LEVELS 6 TO 10)

```
# TASK: IMPLEMENT "BLOOM BLAST" GROUP 2: CURIOUS MINDS (LEVELS 6 TO 10)

You are updating the "Bloom Blast" game in `/components/games/bloom-blast/levelsConfig.ts` and `/components/games/bloom-blast/GameCanvas.tsx`.
Implement Levels 6 through 10 designed for Ages 4 to 6.

## 1. SHARED VISUAL &amp; SOUND SPECIFICATIONS
- Retain the 3D crystal glass aesthetic with specular highlights and neon blade slash physics.
- Speech format rule (window.speechSynthesis): Every correct slice MUST conclude with an excited "... BOOM!".
  Pitch: 1.15, Rate: 0.95.
- Scoring &amp; Lives: 10 correct slices to win. 3 lives (hearts) per level. Slicing an excluded object loses 1 life.

## 2. LEVEL CONFIGURATIONS (6 TO 10)

### LEVEL 6: SWEET &amp; CRUNCHY FRUITS
- Spawns: 3D Crystal Fruits (Apple, Banana, Strawberry, Orange, Grapes, Watermelon).
- Speech Trigger:
  * "Crunchy Apple... BOOM!"
  * "Sweet Strawberry... BOOM!"
  * "Juicy Orange... BOOM!"
  * "Tasty Banana... BOOM!"

### LEVEL 7: HEALTHY VEGETABLES
- Spawns: 3D Crystal Vegetables (Carrot, Broccoli, Tomato, Corn, Peas, Pumpkin).
- Speech Trigger:
  * "Fresh Carrot... BOOM!"
  * "Green Broccoli... BOOM!"
  * "Sweet Corn... BOOM!"
  * "Bright Tomato... BOOM!"

### LEVEL 8: SPEEDY VEHICLES
- Spawns: 3D Crystal Vehicles (Car, Airplane, Rocket, Train, Boat, Bicycle).
- Speech Trigger:
  * "Speedy Car... BOOM!"
  * "Flying Airplane... BOOM!"
  * "Fast Rocket... BOOM!"
  * "Choo-Choo Train... BOOM!"

### LEVEL 9: CATEGORY CHALLENGE (VEGETABLES ONLY)
- Top Challenge Card: "Target: Blast only VEGETABLES! 🥦🥕"
- Spawns: Mixed stream of 50% Fruits and 50% Vegetables.
- Collision Logic:
  * Slicing a Vegetable: +1 point, plays "[Adjective] [Vegetable]... BOOM!".
  * Slicing a Fruit: Triggers wobble penalty, loses 1 heart, soft buzzer sound: "Oops! That is a fruit!".

### LEVEL 10: COLOR + CATEGORY MASTER COMBO
- Top Challenge Card: Switches dynamically between "Blast only GREEN VEGETABLES!" and "Blast only RED FRUITS!".
- Tests multi-attribute cognition.
- On Completion of Level 10: Trigger confetti, award "Curious Explorer Trophy", and unlock Group 3 (Level 11).

```

---

### 🔬 STAGE 3: MASTER CHAMPIONS (AGES 6 TO 9) — LEVELS 11 TO 15

Is age group mein game real **Science, Nature, Grammar, aur Mental Math** mastery tool ban jata hai:

* **Level 11 (Outer Space and sky):**
  * *Items:* Sun, Earth, Moon, Saturn, Shooting Star, Cloud/Rain.
  * *Voiceover:* `[Object] + [Space Fact] + "... BOOM!"` *(e.g., "Sun... Hot Star... BOOM!")*
* **Level 12 (Living Science &amp; Plant Biology):**
  * *Items:* Green Leaf, Roots, Flower Petal, Seed, Stem.
  * *Top Challenge:* *"Blast the parts of a plant that absorb water!"* ya *"Blast the Green Leaf!"*
  * *Voiceover:* *"Green Leaf makes food... BOOM!"*, *"Roots drink water... BOOM!"*
  * **Level 13 (living and non living things):**
  * *Top Challenge Banner:* *"Blast only LIQUIDS!"* ya *"Blast only SOLIDS!"*
  * *Items:* tree, car, sun, rock,diffrent animales, human, see crature, mountains and many other as you can add them .
  * *Voiceover:* *"Living Thing +BOOM!"*, same when next time play senario change to nonlivin things blast sound* Non Living Thing boom BOOM!"*
* **Level 14 (States of Matter: Solid, Liquid, Gas):**
  * *Top Challenge Banner:* *"Blast only LIQUIDS!"* ya *"Blast only SOLIDS!"*
  * *Items:* Ice cube (Solid), Water Splash (Liquid), Steam/Cloud (Gas), Wooden Block (Solid), Juice Bottle (Liquid).
  * *Voiceover:* *"Water is a Liquid... BOOM!"*, *"Ice is a Solid... BOOM!"*
 
* **Level 15 (Parts of Speech / Grammar Blast):**
  * *Top Challenge Banner:* Alternates between **"Blast the ADJECTIVES!"** and **"Blast the VERBS!"**
  * *Floating Word Gems:* "Jump", "Run", "Fluffy", "Shiny", "Dance", "Cold", "Sleep", "Quick".
  * *Voiceover:* *"Fluffy is an Adjective... BOOM!"*, *"Run is an Action Verb... BOOM!"*
* **Level 16 (Rapid Equation Balloons — Math Finale):**
  * *Top Challenge Banner:* Large glowing target number: **Target: 10** (or 12, 15, 20,30).
  * *Floating Equation Bubbles:* `[5 × 2]`, `[7 + 3]`, `[15 - 5]`, `[4 + 2]`, `[3 × 3]`.
  * *Gameplay:* Bacha sirf un bubbles ko slice karega jinka sum target number ke barabar ho!
  * *Voiceover:* *"5 times 2 is 10... BOOM!"*, *"7 plus 3 is 10... BOOM!"*

---

#### 🚀 CURSOR AGENT PROMPT: GROUP 3 (LEVELS 11 TO 15)

```
# TASK: IMPLEMENT "BLOOM BLAST" GROUP 3: MASTER CHAMPIONS (LEVELS 11 TO 15)

You are completing the "Bloom Blast" progression engine in `/components/games/bloom-blast/levelsConfig.ts` and `/components/games/bloom-blast/GameCanvas.tsx`.
Implement Sub-levels 11 through 15 tailored for Ages 6 to 9 with high visual flair, Science, Grammar, and Math logic.

## 1. VISUAL &amp; AUDIO FIDELITY
- Visuals: Speed trail combo multiplier (x2, x3), glowing neon equation bubbles, and cosmic space refraction.
- Audio Standard: Every correct slice triggers instant speech ending in an excited "... BOOM!".
  Pitch: 1.05, Rate: 1.0.

## 2. SUB-LEVEL SPECIFICATIONS (11 TO 15)

### LEVEL 11: SPACE &amp; NATURE WONDERS
- Spawns: 3D Crystal Space Assets (Sun, Earth, Moon, Saturn, Shooting Star, Rain Cloud).
- Educational Speech:
  * "Planet Earth... Our Home... BOOM!"
  * "Sun... Giant Star... BOOM!"
  * "Saturn... Beautiful Rings... BOOM!"
  * "Rain Cloud... Water Cycle... BOOM!"

### LEVEL 12: LIVING SCIENCE &amp; PLANT BIOLOGY
- Spawns: Botanical Glass Elements (Green Leaf, Deep Roots, Flower Petal, Sprouting Seed, Plant Stem).
- Educational Speech:
  * "Green Leaf... Photosynthesis... BOOM!"
  * "Plant Roots... Absorbs Water... BOOM!"
  * "Flower Petal... Attracts Bees... BOOM!"

### LEVEL 13: STATES OF MATTER (SOLID, LIQUID, GAS)
- Challenge Prompt at Top: Switches between "Target: Slice LIQUIDS!" and "Target: Slice SOLIDS!".
- Spawns:
  * Solids: Ice Cube, Rock, Wood Block.
  * Liquids: Water Splash, Fruit Juice, Milk Bottle.
  * Gases: Steam Cloud, Helium Balloon, Smoke Puff.
- Speech: "[Item] is a [State]... BOOM!" (e.g. "Water is a Liquid... BOOM!").

### LEVEL 14: PARTS OF SPEECH (GRAMMAR BLAST)
- Challenge Prompt: "Target: Slice only ADJECTIVES! (Describing Words)" or "Target: Slice only VERBS! (Action Words)".
- Spawns: Crystal Word Gems with clean typography inside:
  * Adjectives: Fluffy, Shiny, Cold, Loud, Quick, Sweet.
  * Verbs: Run, Jump, Sing, Dance, Sleep, Swim.
  * Nouns (Distractors): Book, Chair, Dog, Tree.
- Collision: Valid words trigger "+1! [Word] is an Adjective... BOOM!". Invalid words trigger a mild buzz and shake.

### LEVEL 15: RAPID MATH EQUATION BALLOONS (THE GRAND FINALE)
- Top Display: Large glowing target display, e.g. "TARGET: 10".
- Spawns: Floating balloons displaying arithmetic equations:
  * Correct for 10: "5 x 2", "7 + 3", "20 / 2", "14 - 4", "6 + 4".
  * Incorrect distractors: "3 x 3", "5 + 4", "2 x 4", "12 - 5".
- Velocity: Slightly faster upward floating with gentle horizontal drift.
- Speech: Instant arithmetic confirmation: "[Equation] equals 10... BOOM!".
- Victory State: Grand fireworks animation, "Master Math &amp; Science Champion" badge, with option to replay any level.
```