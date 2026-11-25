# ASD PECS & Calming Hub — 7 Activities

## Global Agent Architectural Rules (All 7 Activities)

1. **Zero Static Raster Images:** Strictly prohibit JPG, PNG, or GIF files. Use Lucide Vector Icons, HTML5 Canvas, or SVG shapes. Preferred stacks:
   - **Three.js 3D WebGL Meshes:** Realistic, rotatable 3D shapes and objects.
   - **DotLottie 3D Vector Animations:** Smooth 60FPS moving 3D characters and scenes.
   - **HTML5 Interactive Canvas:** High-speed touch-tracing and water ripples.
2. **Native Web Speech API:** All voice outputs must use `window.speechSynthesis`.
3. **Tactile 3D Glassmorphic Cards:** `bg-white/95 backdrop-blur-xl border-4 border-white shadow-xl rounded-3xl`.
4. **Haptic & Audio Feedback:** `navigator.vibrate(25)` on tap + Web Audio API oscillators for sound effects.
5. **Zero-Lag & Reduced Motion Compliant:** Respect the `loopCount <= 3` cap and static fallbacks set in `/settings`.
6. **Build order:** Read one prompt at a time. Plan and ship **one activity**, run a spoken smoke test, then move to the next.

### Progress

| # | Activity | Route | Status |
|---|----------|-------|--------|
| 1 | Emergency PECS Grid | `/asd/emergency` | done · spoken test OK |
| 2 | Daily Needs & Food PECS | `/asd/daily-needs` | done · spoken test OK |
| 3 | "I Want..." Sentence Builder | `/asd/i-want` | done · spoken test OK |
| 4 | Guided Paced Breathing | `/asd/breathe` | done · spoken test OK |
| 5 | Velocity Slow Tracing Pad | `/asd/trace` | done · spoken test OK |
| 6 | Emotion & Feelings Expresser | `/asd/feelings` | done · spoken test OK |
| 7 | Ambient Soundscape & Ripple Room | `/asd/ripple` | done · smoke test OK |

---

# Prompt 1: Emergency PECS Grid (Safety Cards)

```
[ROLE: Senior Next.js 15 Special Needs UI Developer]
Build Activity 1: Emergency PECS Grid inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Layout: High-contrast, clean 2x2 grid containing 4 oversized, tactile 3D emergency cards.
- Background: Soft non-glare cream canvas (`bg-slate-50`).
- Card 1 (Water 💧): Soft cyan card (`border-cyan-400 bg-cyan-50/90`) with Lucide `Droplets` icon.
- Card 2 (Toilet 🚽): Soft purple card (`border-purple-400 bg-purple-50/90`) with Lucide `Bath` icon.
- Card 3 (Help 🆘): Soft rose card (`border-rose-400 bg-rose-50/90`) with Lucide `ShieldAlert` icon.
- Card 4 (Break ⏸️): Soft amber card (`border-amber-400 bg-amber-50/90`) with Lucide `PauseCircle` icon.
- Card Styling: `border-b-8 shadow-xl rounded-3xl p-8 flex flex-col items-center justify-center gap-4`.

[INTERACTION & BEHAVIOR]
- Single Tap: Card executes a quick 3D spring press (`scale: 0.95`), triggers haptic vibration (`navigator.vibrate(40)`), and instantly speaks high-volume Web Speech audio:
  * Water ➔ "Water, please!"
  * Toilet ➔ "I want to go for toilet, please!"
  * Help ➔ "Help, please!"
  * Break ➔ "Break, please!"
- Safety Override: This grid is 100% FREE and never paywalled or locked under any subscription tier.

```

---

# 📋 Prompt 2: Daily Needs & Food PECS Grid

```
[ROLE: Senior Next.js 15 AAC Developer]
Build Activity 2: Daily Needs & Food PECS Grid inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Layout: Scrollable 2x3 grid displaying 6 daily routine communication cards.
- Cards Included:
  1. Food/Snack 🍎: Red border with Lucide `Apple` icon.
  2. Milk/Juice 🥛: Blue border with Lucide `Milk` icon.
  3. Sleep/Tired 😴: Indigo border with Lucide `Moon` icon.
  4. Pain/Hurt 🩹: Rose border with Lucide `Bandage` icon.
  5. Hug 🫂: Pink border with Lucide `HeartHandshake` icon.
  6. Play/Toys 🧸: Green border with Lucide `ToyBrick` icon.
- Card Visuals: Frosted glass containers (`bg-white/90 shadow-lg rounded-3xl p-6 border-4`) with large central icons and bold, readable text labels (`text-slate-800 text-xl font-bold`).

[INTERACTION & BEHAVIOR]
- Tapping a card triggers a tactile compression animation + Web Speech API vocalization (e.g., "I want a snack, please", "I want a hug").
- Highlight Ring: Active card flashes a glowing green aura ring for 1 second upon tap.

```

---

# 📋 Prompt 3: "I Want..." 2-Card Sentence Builder (AAC Strip)

```
[ROLE: Senior Next.js 15 Speech Therapy UX Specialist]
Build Activity 3: "I Want..." 2-Card Sentence Builder (AAC Strip) inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Top AAC Sentence Strip: Fixed top glassmorphic bar (`bg-amber-100/80 border-4 border-amber-300 rounded-3xl p-4 flex items-center gap-4 min-h-[100px]`).
  * Slot 1 (Fixed): Pre-filled permanent card `[ I WANT ✋ ]`.
  * Slot 2 (Target): Glowing dotted placeholder box `[ Select Item Below ]`.
- Bottom Choice Tray: Grid of selectable noun cards (Water 💧, Milk 🥛, Apple 🍎, Toy 🧸, Park 🛝, Hug 🫂).
- Action Controls: Floating green 🔊 "Speak Sentence" button + red ↺ "Clear" button.

[INTERACTION & BEHAVIOR]
- Tapping a bottom noun card animates it into Slot 2 using Framer Motion `layoutId` spring physics.
- Tapping "Speak Sentence" triggers full sequential Web Speech API synthesis: *"I want [Selected Item], please!"*.
- Tapping "Clear" resets Slot 2 back to the dotted outline.

```

---

# 📋 Prompt 4: Guided Paced Breathing Mascot

```
[ROLE: Senior Next.js 15 Sensory Regulation Developer]
Build Activity 4: Guided Paced Breathing Mascot inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Canvas: Soothing pastel lavender-to-sky gradient background (`bg-gradient-to-b from-indigo-100 via-purple-50 to-sky-100 min-h-screen flex flex-col items-center justify-center`).
- Central Mascot: Render a soft 3D vector mascot (a glowing cute cloud/star character) enclosed within two concentric pulsing aura rings.
- Text Guide: Dynamic glowing prompt above mascot displaying `"Press and Hold to Breathe"`.

[INTERACTION & BEHAVIOR]
- Touch-and-Hold Mechanism: The breathing cycle ONLY runs while the child holds their finger on the mascot.
  * Inhale Phase (4 Seconds): Mascot smoothly expands (`scale: 1.4`), background rings glow warm gold, and prompt reads `"Inhale slowly..."`.
  * Exhale Phase (4 Seconds): Mascot smoothly contracts (`scale: 1.0`), rings shift to soft cyan, and prompt reads `"Exhale slowly..."`.
- Releasing Finger: Pauses the rhythm gently and prompts: `"Hold to continue breathing together"`.
- Strict Rule: Zero timers, zero stars, zero scores, and zero competitive elements.

```

---

# 📋 Prompt 5: Velocity-Controlled Slow Tracing Pad

```
[ROLE: Senior Next.js 15 Fine-Motor & Sensory Developer]
Build Activity 5: Velocity-Controlled Slow Tracing Pad inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Canvas: Full-screen HTML5 Canvas with a soft glowing guide path (smooth wave, spiral, or star outline).
- Tracing Line: Render a neon-pastel crayon trail following finger touch.

[INTERACTION & BEHAVIOR]
- Touch Movement Speed Sensor: Calculate touch movement velocity (`distance / timeDelta`).
- Speed Guard Enforcement:
  * If velocity exceeds safe threshold (fast/erratic swipes): Instantly freeze line tracing, turn the path translucent orange, and play gentle spoken Web Speech audio: *"Slow down to guide your friend!"*.
  * If velocity is slow and controlled: Render continuous glowing crayon trail with soft Web Audio API C-major oscillator tones + sparkle particles.
- Completion: Successfully tracing the path slowly awards a quiet glowing star burst.

```

---

# 📋 Prompt 6: Emotion & Feelings Expresser ("How I Feel")

```
[ROLE: Senior Next.js 15 ASD Emotional Communication Developer]
Build Activity 6: Emotion & Feelings Expresser inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Layout: 5 distinct, color-coded oversized emotion cards arranged in a responsive grid:
  1. Happy 😊: Soft yellow container (`bg-yellow-100 border-yellow-400`).
  2. Sad 😢: Soft blue container (`bg-blue-100 border-blue-400`).
  3. Overwhelmed/Angry 😡: Soft peach/red container (`bg-rose-100 border-rose-400`).
  4. Tired 😴: Soft purple container (`bg-purple-100 border-purple-400`).
  5. Scared 😨: Soft amber container (`bg-amber-100 border-amber-400`).
- Card Visuals: Large vector mood icons + bold title + descriptive phrase underneath.

[INTERACTION & BEHAVIOR]
- Tapping a card expands it into a soft modal dialog, dims background lighting, and speaks the full emotional state via Web Speech API:
  * Overwhelmed ➔ *"I am feeling overwhelmed right now. I need a quiet space."*
  * Sad ➔ *"I am feeling sad right now."*
- Helps non-verbal children express internal sensory overload to parents and caregivers without experiencing meltdowns.

```

---

# 📋 Prompt 7: Ambient Soundscape & Ripple Room

```
[ROLE: Senior Next.js 15 WebGL & Web Audio Developer]
Build Activity 7: Ambient Soundscape & Ripple Room inside the ASD PECS & Calming Hub.

[CLEAR VISUALIZATION & LAYOUT]
- Screen Canvas: Deep night-mode indigo canvas (`bg-slate-900 min-h-screen relative overflow-hidden`).
- Floating Visuals: Slow-moving translucent pastel bubbles drifting gently across the screen using CSS keyframes.
- Bottom Control Tray: 3 ambient sound toggle cards — Rain 🌧️, Ocean Waves 🌊, Soft Wind 🍃.

[INTERACTION & BEHAVIOR]
- Interactive Water Ripples: Tapping anywhere on the dark canvas spawns expanding HTML5 water ripple rings (`ctx.arc()`) with soft pastel colors that fade out smoothly over 2 seconds.
- Ambient Sound Generator: Tapping a sound card toggles procedural Web Audio API noise synthesis (filtered pink/brown noise for rain and ocean waves).
Strict Rule: Zero scoring, zero timers, zero goals. Designed purely for visual and auditory de-escalation and relaxation.