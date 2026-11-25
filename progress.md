# Kids Learning App — Development Progress

> Master execution log for AI developer tasks. Updated after each completed milestone.

---

## ✅ Task 1: Next.js 15 Layout, PWA & Modular Sidebar System

**Status:** Complete  
**Verified:** `npm run build` — 18 routes, zero TS/Tailwind errors

### What was built
- Next.js 15.5.20 App Router scaffold (TypeScript, Tailwind v4, ESLint, `@/*` alias)
- **14-route navigation** — Sidebar (desktop) + Framer Motion mobile drawer
- **Design system** — Lavender cream canvas, glassmorphic cards, slate-800 typography
- **Micro-interactions** — Framer Motion spring scale + `navigator.vibrate(30)` on all taps
- **PWA** — `manifest.json`, `sw.js` (UI shell + Lottie cache), SVG-only icons
- **TenMinuteTimerGuard** — 10-min spoken break alert via Web Speech API

### Key files
| File | Purpose |
|------|---------|
| `components/Sidebar.tsx` | Fixed left nav with gradient active pill |
| `components/Header.tsx` | Dynamic title, star counter, avatar |
| `components/MobileDrawer.tsx` | Glass slide-over drawer |
| `components/AppShell.tsx` | Layout wrapper |
| `utils/navigation.ts` | 14-route config + Lucide icon map |
| `public/manifest.json` + `public/sw.js` | PWA offline shell |

### Concepts used
- **App Router route groups** — Each feature on its own dedicated view
- **Glassmorphism UI** — `backdrop-blur-xl`, frosted white cards for tactile 3D feel
- **Zero raster engine** — Lucide vector icons only; no JPG/GIF/MP4 assets
- **Service Worker caching** — Stale-while-revalidate for shell; cache-first for `.lottie`
- **Framer Motion springs** — `whileHover={{ scale: 1.03 }}`, `whileTap={{ scale: 0.96 }}`

---

## ✅ Task 2: Supabase Auth, GDPR Avatars & Full Admin Dashboard

**Status:** Complete  
**Verified:** `npm run build` — 24 routes + 4 admin API endpoints

### What was built
- **Auth screens** — `/login`, `/signup`, `/forgot-password` with glassmorphic floating inputs
- **Supabase SSR** — Browser + server clients, middleware session refresh
- **GDPR profile** — Vector avatar gallery (no photo uploads), nickname + age group only
- **Admin dashboard** (`/admin`) — Coupon Studio, User Analytics, Payment Verification tabs
- **RLS policies** — Admin gate via `is_admin()` helper function
- **SQL migration** — `profiles`, `coupons`, `payment_requests`, storage bucket, expiration downgrade

### Key files
| File | Purpose |
|------|---------|
| `utils/supabase/client.ts` | Browser Supabase client |
| `utils/supabase/server.ts` | Server-side client (cookies) |
| `components/AuthProvider.tsx` | Global auth + profile context |
| `components/AvatarSelector.tsx` | COPPA-safe vector avatar grid |
| `components/admin/CouponManager.tsx` | Promo code CRUD |
| `supabase/migrations/001_profiles_auth_admin.sql` | Schema + RLS + triggers |

### Concepts used
- **Supabase Auth + RLS** — Row-level security enforces `(auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))` for admin
- **SSR cookie pattern** — `@supabase/ssr` with middleware `updateSession()` for token refresh
- **SECURITY DEFINER functions** — `approve_payment_request()`, `downgrade_expired_subscriptions()`
- **COPPA/GDPR boundary** — Pre-designed Lucide avatars only; minimal PII (nickname, age, parent email)
- **Audit trail** — `approved_by`, `approved_at` columns on `payment_requests`

---

## ✅ Task 2B: Multi-Child Profiles, Onboarding Wizard & Terms of Service

**Status:** Complete  
**Verified:** `npm run build` — 26 routes, zero TS/Next.js errors

### What was built
- **`children` table** — Multi-profile schema with `parent_user_id`, `nickname`, `avatar_id`, `age_group`, `onboarding_completed`
- **Tiered child limits** — Free = 1, Pro = 3, Family Pack = 6 (DB trigger + `get_child_limit()`)
- **`child_id` on tracking tables** — `user_progress` and `user_streaks` created with `child_id` FK from the start (ready for Task 3)
- **ChildSwitcher** — Avatar row in header/profile; switching requires Parental Gate math challenge
- **Onboarding wizard** — 3-screen flow after signup (`/onboarding`); skip link on every screen
- **Terms of Service** — `/terms` static page (billing, cancellation, acceptable use, liability)
- **Signup ToS checkbox** — Required before account creation; stores `tos_accepted_at` on profile

### Key files
| File | Purpose |
|------|---------|
| `supabase/migrations/002_children_multi_profile.sql` | Children table, tracking tables, RLS, limits |
| `components/ActiveChildProvider.tsx` | App-wide active child context + localStorage persistence |
| `hooks/useActiveChild.ts` | Hook re-export for active child state |
| `components/ChildSwitcher.tsx` | Avatar row with parental gate on switch |
| `components/ParentalGate.tsx` | Math challenge modal for parent-only actions |
| `components/OnboardingWizard.tsx` | 3-step first-time setup wizard |
| `components/OnboardingGuard.tsx` | Redirects new users to `/onboarding` |
| `app/onboarding/page.tsx` | Post-signup onboarding route |
| `app/terms/page.tsx` | Terms of Service static page |
| `utils/childLimits.ts` | Tier limit logic (1 / 3 / 6) |

### Concepts used
- **Multi-tenant child context** — React Context (`ActiveChildProvider`) + `localStorage` for persisting active child across sessions; all future progress logging (Task 3+) attaches `child_id`
- **Parental Gate pattern** — Simple math CAPTCHA before child profile switching (COPPA parental control)
- **Onboarding guard middleware (client)** — `OnboardingGuard` checks `children.length === 0` and redirects to wizard; bypasses auth/terms/privacy routes
- **Database-enforced tier limits** — `BEFORE INSERT` trigger on `children` calls `get_child_limit()` — limits cannot be bypassed from client
- **Legacy data migration** — SQL `INSERT … SELECT` copies existing single-child profile fields into first `children` row
- **Progressive onboarding** — Framer Motion `AnimatePresence` step transitions; "Skip for now" creates default child with `onboarding_completed = true`

### Setup required
1. Run `supabase/migrations/002_children_multi_profile.sql` in Supabase SQL editor (after 001)
2. Ensure `.env.local` has valid Supabase credentials
3. New signups flow: `/signup` → `/onboarding` → `/`

---

## ✅ Task 3: Core Flashcard Hub, Vocal Encouragement, Opt-In Speech & Database Schema

**Status:** Complete  
**Verified:** `npm run build` — `/` Flashcard Hub 20.1 kB, zero TS/Next.js errors

### What was built
- **Category Tabs** — Nouns (sky blue), Verbs (emerald), ABC (purple) with color-coded borders per README grammar system
- **Two-tap quiz** — Select answer → `ring-4 ring-indigo-500` highlight → `✅ Confirm Choice` with spring animation
- **Khan Academy TTS** (`hooks/useTTS.ts`) — Random praise phrases via Web Speech API (no MP3 files)
- **+10 Stars** — Correct answers update `children.stars` in Supabase; header reflects active child
- **Golden Speech Trophy** — >80% session accuracy triggers DotLottie confetti modal; saves to `children.unlocked_trophies` + `profiles.unlocked_trophies`
- **Speech recognition** (`hooks/useSpeechRecognition.ts`) — Android/Chrome `webkitSpeechRecognition` + `string-similarity` (threshold 0.60); iOS opt-in Vosk lazy-load path with fallback
- **Progress logging** (`utils/logProgress.ts`) — Writes to `user_progress` with `child_id`; offline queue via `localforage`; `online` event bulk flush
- **Offline flashcard cache** — Last 20 words in IndexedDB (`utils/flashcardCache.ts`) for PWA offline play
- **SQL migration** — `003_user_progress.sql` (idempotent RLS policies)

### Key files
| File | Purpose |
|------|---------|
| `components/FlashcardHub.tsx` | Hub page wrapper with category tabs |
| `components/CategoryTabs.tsx` | Nouns / Verbs / ABC tab switcher |
| `components/QuizEngine.tsx` | Two-tap quiz, stars, speech, session accuracy |
| `components/RewardTrophyModal.tsx` | DotLottie confetti + trophy unlock overlay |
| `hooks/useTTS.ts` | Web Speech API praise engine |
| `hooks/useSpeechRecognition.ts` | Cross-platform speech with fuzzy matching |
| `utils/logProgress.ts` | Shared progress logger + offline queue (Tasks 3–7) |
| `utils/flashcardCache.ts` | IndexedDB cache for last 20 flashcard words |
| `utils/flashcards.ts` | Lucide vector deck data (zero raster assets) |
| `components/ProgressSyncInit.tsx` | Global `online` listener for queue flush |
| `supabase/migrations/003_user_progress.sql` | user_progress RLS migration |

### Concepts used
- **Two-step confirmation pattern** — Reduces accidental taps for motor-impaired learners; selection state separate from submission
- **Web Speech API TTS** — Zero-asset audio synthesis replaces MP3 praise clips (Khan Academy-style vocal encouragement)
- **Fuzzy speech matching** — `string-similarity` `compareTwoStrings` with `SPEECH_MATCH_THRESHOLD = 0.60` tolerates child pronunciation variance
- **Opt-in lazy WASM loading** — iOS Vosk loaded only on mic tap via dynamic import; Android uses native `webkitSpeechRecognition` with zero extra download
- **Offline-first progress queue** — `localforage` stores failed Supabase writes; `window.addEventListener('online')` flushes queue in bulk
- **Multi-child progress attribution** — Every log includes `child_id` from `useActiveChild()` context (Task 2B integration)
- **DotLottie vector confetti** — Remote `.lottie` URL for trophy celebration; no local raster/video assets
- **IndexedDB flashcard cache** — LRU-style 20-word cache enables offline PWA quiz when network unavailable
- **Grammar color coding** — Category-specific Tailwind tokens (`border-blue-400`, `border-emerald-400`, `border-purple-400`) from product design system

---

---

## ✅ Task 4: Interactive Phonics Sound & Dynamic Vector Engine (`/phonics`)

**Status:** Complete  
**Verified:** `npm run build` — `/phonics` 6.4 kB, zero TS/Next.js errors

### What was built
- **Dynamic phonic cards** — Fetches `phonics_blends` from Supabase; Lucide icons via `icon_name` map; offline fallback deck
- **Web Speech synthesis** — Tap card speaks blend at `rate = 0.7` (zero MP3 files)
- **Infinite carousel** — Modulo index rotation `(index + 1) % length` with prev/next controls
- **Alphabet tracing canvas** — Touch-friendly HTML5 canvas with mask-based 100% coverage detection
- **Sparkle + audio feedback** — Framer Motion ✨ particles + Web Audio API oscillator tones while tracing
- **Completion rewards** — 100% coverage → vocal praise, +10 stars, **Phonics Champion 🏆** trophy
- **Speech repetition** — Reuses `useSpeechRecognition` for echo practice
- **Progress logging** — All tap/speech/trace attempts via shared `logProgress.ts` with `feature_route = '/phonics'`

### Key files
| File | Purpose |
|------|---------|
| `components/PhonicsHub.tsx` | Page orchestrator linking sound + trace sections |
| `components/PhonicsSoundBreakdown.tsx` | Supabase carousel + speech at 0.7 rate |
| `components/AlphabetTracingCanvas.tsx` | Touch canvas, coverage %, sparkles, Web Audio |
| `utils/phonics.ts` | Types + offline fallback blend data |
| `utils/iconMap.ts` | Dynamic Lucide icon lookup by DB `icon_name` |
| `supabase/migrations/004_phonics_table.sql` | Table, RLS, seed blends (BA, MA, DA…) |

### Concepts used
- **Modulo carousel pattern** — Seamless infinite loop for toddler-friendly repetition without dead ends
- **Dynamic icon resolution** — DB-driven `icon_name` → Lucide component map (zero raster assets)
- **Canvas mask coverage algorithm** — Render guide letter to pixel mask; compare traced strokes for % completion
- **Web Audio oscillator feedback** — Short sine bursts on trace (no MP3 sound files)
- **Pointer capture API** — Reliable touch drawing on iOS/Android without stroke drops
- **Graceful Supabase degradation** — `FALLBACK_PHONICS` local array when DB unavailable/offline
- **Shared progress pipeline** — Reuses Task 3 `logProgress.ts` with multi-child `child_id` from Task 2B

### Setup required
Run `supabase/migrations/004_phonics_table.sql` in Supabase SQL editor (after 002).

---

## ✅ Task 5: Duolingo-Style Daily Sentences & Vocab (`/sentences`)

**Status:** Complete  
**Verified:** `npm run build` — `/sentences` 193 kB, zero TS/Next.js errors

### What was built
- **Vocabulary prep card** — Target word, meaning, dynamic Lucide icon, and Web Speech “Hear word” button
- **Word bank assembly** — 3D tactile pills (`border-b-4 border-slate-200 active:translate-y-1`); tap moves words into sentence box
- **Framer Motion layout animations** — Shared `layoutId` per pill animates between word bank tray and sentence box with spring physics
- **Infinite sentence loop** — On correct answer, `(currentIndex + 1) % sentenceList.length` advances; wraps to sentence #1 at end
- **Vocal praise** — `useTTS` speaks *“Super Star! Perfect sentence!”* on success
- **Supabase migration** — `public.sentences` table with ~100 daily-routine sentences seeded via `jsonb_array_elements`
- **RLS public read** — `SELECT` policy where `is_active = true`
- **Offline IndexedDB cache** — Last 30 sentence objects via `localforage` (`utils/sentenceCache.ts`)
- **Granular attempt logging** — Every check logged via shared `logProgress.ts` with `feature_route = '/sentences'` and `child_id`

### Key files
| File | Purpose |
|------|---------|
| `app/sentences/page.tsx` | Route shell with intro copy for Ages 3–6 daily routines |
| `components/DuolingoSentenceBuilder.tsx` | Vocab card, word bank, sentence box, check/reset, modulo loop |
| `utils/sentences.ts` | `SentenceRecord` types, `buildWordPills()`, `arraysEqual()`, offline fallback deck |
| `utils/sentenceCache.ts` | IndexedDB cache for last 30 sentences (localforage) |
| `utils/iconMap.ts` | Dynamic Lucide lookup by DB `icon_name` (reused from Task 4) |
| `supabase/migrations/005_sentences_table.sql` | Schema, RLS, indexes, bulk sentence seed |

### Concepts used
- **Duolingo word-assembly UX** — Decoy words in `word_bank` vs. `correct_order` validation; tap-to-add / tap-to-remove in sentence box
- **Shared layout animation (`layoutId`)** — Framer Motion `LayoutGroup` + matching `layoutId` on bank and box pills creates fluid “word flying” transitions without drag-and-drop libraries
- **Modulo infinite loop** — Same carousel pattern as Task 4 phonics; toddlers never hit a dead end after finishing the deck
- **JSONB sentence schema** — `target_vocabulary`, `word_bank`, and `correct_order` stored as JSONB for flexible pill data without extra join tables
- **Three-tier data fallback** — Supabase fetch → IndexedDB cache → hardcoded `FALLBACK_SENTENCES` (3 items) for fully offline PWA use
- **Zero-asset audio** — Web Speech API for vocab pronunciation and success praise (no MP3 uploads)
- **Dynamic Lucide icons** — DB-driven `icon_name` resolved at runtime; no raster vocabulary images
- **Granular progress attribution** — Each sentence check writes `attempt_type: "tap"`, `target_word: sentence_id`, and retry logs on incorrect attempts

### Setup required
Run `supabase/migrations/005_sentences_table.sql` in Supabase SQL editor (after 004).

---

## ✅ UI/UX Visual Overhaul — Tasks 1–5 (2026 Duolingo-Style Refresh)

**Status:** Complete  
**Verified:** `npm run build` — zero TS/Tailwind errors, zero lint errors

### What was changed
- **Kid-friendly design system** — `Fredoka` bubble font (next/font), layered pastel radial-gradient body background (sky → sunshine → lavender), `.kid-card` (rounded-3xl, border-4, shadow-xl), Duolingo-style chunky `.btn-3d-*` buttons with 8px bottom borders that compress on press
- **Hand-drawn vector illustration engine (no emoji, no raster)** — First pass used emoji scenes; **replaced after user feedback** with a fully custom animated SVG + Framer Motion illustration library, since system emoji render inconsistently across OS and looked "cheap." Every word now resolves to one of:
  - A **signature mascot** (`components/scenes/KidCharacter.tsx`) with pose-driven limb animation for action verbs — run (alternating stride), drink (tilting cup + sloshing liquid), eat, jump, sleep (Zzz + tilt)
  - A **dedicated hand-drawn scene** (`components/scenes/CoreScenes.tsx`) for 17 core nouns — glowing rotating-ray sun, glossy squashing apple, wagging-ear dog, blinking cat, fizzing milk, rippling water droplet, page-turning book, twitching rabbit, drifting cloud, twinkling moon, bouncing ball, swaying tree, swimming fish, pulsing lion, steaming pizza, swaying elephant, plus an animated golden trophy
  - A **colorful rotating theme badge** (`components/scenes/BadgeScenes.tsx`) as the fallback for long-tail sentence/phonics vocabulary, grouped by 12 themes (school, food, weather, bedtime, outdoor, family, celebration, safety, time, hygiene, social, sparkle)
  - `components/Illustration.tsx` renders the resolved scene inside a **large hero bubble frame** (up to 250px), `shadow-2xl`, thick white border, and floating vector star/dot particles behind it (`components/scenes/Particles.tsx`)
  - An optional `lottieUrl` extension point (`@lottiefiles/dotlottie-react`, already wired) lets curated, verified LottieFiles CDN links be dropped in per-word later; DotLottie is tried first and falls back to the vector scene automatically via the `loadError` event if the asset fails
- **Emoji-free copy & icons** — Swept every remaining decorative emoji (⭐ 👤 🏆 🔊 ✅ 🎤 ✨ 🌟 ✍️ 🧺) out of `Header`, `StarFly`, `RewardTrophyModal`, `FlashcardHub`, `QuizEngine`, `PhonicsHub`, `PhonicsSoundBreakdown`, `AlphabetTracingCanvas`, and `DuolingoSentenceBuilder`, replacing them with Lucide vector icons or the new SVG scenes
- **Category tabs** — Replaced 🧸/🏃/🔤 text emoji with custom animated SVG badges (`components/scenes/CategoryBadge.tsx`): rotating cube (Nouns), motion-trail checkmark (Verbs), bouncing blocks (ABC)
- **Instant reward system** (`utils/celebrate.ts`) —
  - `burstConfetti()` / `starShower()` via `canvas-confetti` (respects reduced-motion)
  - `playDing()` cheerful C5-E5-G5-C6 Web Audio chime, `playBoop()` gentle retry tone — zero MP3 files
  - `components/StarFly.tsx` floating "+10 ★" pop-up (Lucide `Star` icon) springing toward header star counter
- **Flashcards** — XL hero illustration in bubble frame, gradient ABC letters, bigger 4-option grid with border-b-8 tactile cards, confetti + ding + star fly on every correct answer
- **Phonics** — Blend text in pink-orange gradient (`.gradient-letter`), hero scene per example word, rainbow crayon tracing strokes (hue follows position) with vector `Sparkles` particles, gradient guide letter, star shower on tracing completion
- **Sentences** — Vocab word in cool gradient with hero scene, indigo gradient pills in sentence box, warm amber word-bank tray, celebration burst on perfect sentence
- **Header/Trophy** — Star counter is an amber gradient pill with a Lucide `Star` icon that springs when count changes; trophy modal shows an animated golden `TrophyScene` (glow, sparkles, floating) inside its own hero bubble frame with a star shower

### Key files
| File | Purpose |
|------|---------|
| `app/globals.css` | Pastel gradients, kid-card, btn-3d, float/glow/wiggle keyframes |
| `utils/illustrations.ts` | Word → scene registry (kid pose / core scene / theme badge) + `lottieUrl` extension point |
| `components/Illustration.tsx` | Hero bubble frame — DotLottie-first, vector-scene fallback, floating particles |
| `components/scenes/KidCharacter.tsx` | Shared mascot with per-pose limb animation (run/drink/eat/jump/sleep) |
| `components/scenes/CoreScenes.tsx` | 17 hand-drawn animated SVG scenes + `TrophyScene` |
| `components/scenes/BadgeScenes.tsx` | 12 themed rotating-badge fallback scenes |
| `components/scenes/Particles.tsx` | Floating vector star/dot background particles |
| `components/scenes/CategoryBadge.tsx` | Animated SVG badges for flashcard category tabs |
| `utils/celebrate.ts` | Confetti bursts + Web Audio chimes |
| `components/StarFly.tsx` | Floating +10 ★ reward pop-up |

### Concepts used
- **Zero-emoji, zero-raster vector art** — Every illustration is inline SVG + Framer Motion (gradients, multi-shape characters, motion-driven limbs/rays/liquid); renders identically crisp on every OS/browser, unlike system emoji
- **DotLottie-first with graceful fallback** — `dotLottieRefCallback` subscribes to the `loadError` event so a bad or unverified Lottie URL never breaks the UI — it silently swaps to the vector scene
- **Duolingo 3D button pattern** — `border-b-8` + `active:translate-y-1 active:border-b-4` simulates a physical press
- **Web Audio synthesis rewards** — Triangle-wave arpeggio replaces MP3 "ding" sound effects
- **Reduced-motion accessibility** — CSS `prefers-reduced-motion` disables float/glow/wiggle; confetti uses `disableForReducedMotion`
- **Mascot consistency** — One shared chibi character (not five different emoji) performs every action verb, reinforcing brand identity like Duolingo's owl

### Note
`sentences.target_vocabulary.icon_name` and `phonics_blends.icon_name` remain in the DB schema (unchanged per scope). No verified public DotLottie CDN URLs were embedded for specific words (LottieFiles doesn't expose a scrapable direct asset link without an in-browser "Asset & Embed" click) — fabricating one risked a broken/404 asset, which is the opposite of the requested premium feel. The `lottieUrl` field in `utils/illustrations.ts` is ready for real curated links to be added later; today every scene renders via the custom vector library.

---

## ✅ Tasks 4–7 Completion Pass (Lottie wiring + Stories + Mini-Games)

**Status:** Complete  
**Verified:** `npm run build` — exit 0, 26 routes, zero TS errors

### Task 4 enhancements (`/phonics`)
- **`lottie_url` wired** — `PhonicsSoundBreakdown` passes DB URL to `<Illustration lottieUrl={...} />`
- **Tracing works without login** — celebration + stars/trophy when logged in; trace completion always shows feedback
- Phonics speech rate remains **0.75** via `PHONICS_SPEECH_RATE`

### Task 5 enhancements (`/sentences`)
- **`lottie_url` wired** — vocab hero uses Supabase CDN URL when set (placeholder URLs skipped)
- `SentenceRecord` type extended with optional `lottie_url`

### Cross-cutting: Supabase Lottie pipeline
- [`utils/lottieUrl.ts`](utils/lottieUrl.ts) — skips `placeholder.com` / `replace_me` stubs
- [`Illustration.tsx`](components/Illustration.tsx) — `lottieUrl` prop; DB → local registry → SVG fallback chain
- [`QuizEngine.tsx`](components/QuizEngine.tsx) — fetches `public.flashcards`; maps `alphabet`↔`abc`, `flashcard_id`↔`id`

### ✅ Task 6: IQ Stories Engine (`/games/stories/*`)

- [`supabase/migrations/006_stories_table.sql`](supabase/migrations/006_stories_table.sql) — schema + 3 seed stories
- [`utils/iqStories.ts`](utils/iqStories.ts) — types, fetch, offline fallback decks
- [`components/StoryEngine.tsx`](components/StoryEngine.tsx) — infinite story loop, trophy + progress logging
- [`components/StoryScene.tsx`](components/StoryScene.tsx) — narrative, Illustration/Lottie, tap-to-continue
- [`components/IQPuzzleRenderer.tsx`](components/IQPuzzleRenderer.tsx) — tangram, pattern, odd-one-out, color match
- Toddler + Explorer pages wired to `<StoryEngine />`

### ✅ Task 7: Mini-Games (`/games/trolley` & `/games/coin-shop`)

- [`components/TrolleyGame.tsx`](components/TrolleyGame.tsx) — date-seeded ABC aisle, draggable shelf, progress logging
- [`components/CoinShopGame.tsx`](components/CoinShopGame.tsx) — 1–3 coin shop, piggy bank counting TTS, `unlocked_toys` save

### Setup required
Run `supabase/migrations/006_stories_table.sql` in Supabase SQL editor (after 005).

---

## Project audit summary (as of Tasks 4–7)

| Area | State |
|------|-------|
| Framework | Next.js 15.5.20, React 19, Tailwind v4, Turbopack |
| Auth + Multi-child | AuthProvider, ActiveChildProvider, ChildSwitcher |
| Flashcards | Supabase `flashcards` fetch + local fallback; `lottie_url` support |
| Phonics | Supabase blends + `lottie_url`; trace without login |
| Sentences | 100 sentences + `lottie_url`; offline cache |
| Stories | StoryEngine + puzzles; migration 006 |
| Mini-games | Trolley + Coin Shop playable |
| Admin | 3-tab dashboard, RLS-gated API routes |
| PWA | manifest + service worker + SVG icons |
| Migrations | `001`–`006_stories_table.sql` |
| Routes | 26 app routes |
