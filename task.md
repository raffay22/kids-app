📄 TASKS.md (Master Developer Execution Plan)
[PROJECT CONTEXT & TRUTH SOURCE]
Role: Senior Special Education & Speech Therapy Full-Stack App Developer.

Tech Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, DotLottie vector canvas runtimes, Supabase (Auth, RLS, Storage), Web Speech API (window.speechSynthesis), and PWA offline storage (localforage / IndexedDB).

Mandatory Architectural Rules
ZERO STATIC ASSET DEPENDENCIES: Strictly PROHIBIT static raster JPGs, GIFs, heavy MP4 videos, or local offline MP3 audio files. All visuals must use Lucide vector icons or dotLottie JSON runtimes. All audio/speech must use browser native Web Speech API synthesis or Web Audio API oscillators.

FREEMIUM ETHICS & MONETIZATION (7-Day Trial Model):

New users receive a 7-Day Full-Access Free Trial upon account creation.

On Day 8, if not upgraded, access locks down across all learning routes (/, /phonics, /sentences, /games/*).

SAFETY CRITICAL EXCEPTION: Emergency PECS communication cards (Water, Toilet, Help, Break) on /pecs MUST NEVER be locked or paywalled, regardless of trial status, subscription expiry, or payment state.

🟢 TASK 1: Next.js 15 Layout, PWA & Modular Sidebar System
Objective: Set up Next.js 15 (App Router) with PWA offline service worker caching, Lucide icons, glassmorphism UI, soft color canvas styling, and a grouped 15-route sidebar/drawer navigation system.

Developer Requirements:
Design Tokens & Theme Canvas System:

Canvas Background: Non-glare soft Lavender Cream (bg-slate-50 / bg-indigo-50/30 min-h-screen).

Cards (Glassmorphic Tactile 3D): Frosted White Glass (bg-white/90 backdrop-blur-xl border-2 border-white/80 shadow-2xl rounded-3xl). Every card must render with drop-shadow depth to feel like a physical toy button.

Typography: Deep Slate Navy (text-slate-800), avoiding harsh pure #000000 black glare.

Micro-Interactions (Framer Motion + Haptics): Every clickable card/button MUST feature Framer Motion spring scaling (whileHover={{ scale: 1.03 }}, whileTap={{ scale: 0.96 }}) and trigger light haptic feedback (navigator.vibrate(30)).

Vector Visual Engine: Strictly PROHIBIT static raster JPGs, GIFs, or heavy MP4 videos. All scene assets must use vector .lottie JSON files (lottie-react / @dotlottie/react-player) for 60 FPS crisp resolution on Retina/iPad displays.

Modular Grouped 15-Route Hierarchy (components/Sidebar.tsx & components/MobileDrawer.tsx):

"Learn":

/ — Flashcard Hub (Sparkles)

/phonics — Toddler Phonics Blends (Volume2)

/sentences — Daily Sentences & Vocab (MessageCircleCode)

"Play & Think":

/games/stories/toddlers — Toddler Calming Stories (BookOpen)

/games/stories/explorers — Explorer IQ Stories (Compass)

/games/trolley — Supermarket Trolley Game (ShoppingBag)

/games/coin-shop — Math Coin Toy Shop (Coins)

/games/logic — Cognitive Logic Games (Puzzle)

/games/memory — Memory Matching Game (Brain)

"Calm & Talk":

/calm — Calming Sensory Zone (HeartHandshake) — Protected: No competitive metrics

/pecs — PECS AAC Board (Grid)

"Me":

/profile — Profile, Badges & Trophy Showcase (UserCheck)

/analytics — Practice Log & Email Export (BarChart3)

/settings — Sensory & Privacy Controls (Sliders)

Section Headers & Actions: Section headers are small, muted, non-interactive labels (expanded by default). "Upgrade to Pro" (/upgrade) renders as a distinct highlighted button below the grouped list, and "Admin" (/admin) renders only if profiles.is_admin === true.

PWA Offline Service Worker: Configure PWA manifest and service worker caching for UI shell, icons, and Lottie JSON files for offline play.

Code Output:
Generate app/layout.tsx, components/Sidebar.tsx, components/Header.tsx, components/MobileDrawer.tsx, and PWA manifest configurations.

🟢 TASK 2: Supabase Auth, GDPR Parent Profiles & Full Admin Dashboard (/admin)
Objective: Implement Supabase Auth (Email/Password), parent account profile management, database RLS security, and a full-featured admin dashboard.

Developer Requirements:
Supabase Auth Screens (/login, /signup, /forgot-password):

Responsive glassmorphic card form with floating input labels and Lucide icons (Mail, Lock, User).

Sign Up requires Parent Email and Password + Terms of Service checkbox verification.

"Forgot Password" triggers supabase.auth.resetPasswordForEmail.

Clear "Logout" button in profile, sidebar, and drawer (LogOut icon).

Parent Account Boundaries (/profile & profiles table):

Data Separation Rule: The profiles table holds ONLY parent-level account data: id (references auth.users), parent_email, subscription_status ('trial' | 'free' | 'pro'), trial_started_at, subscription_expires_at, and is_admin (boolean).

Child Data Strict Exclusion: All individual child nicknames, avatar choices, age groups, streaks, and progress records belong exclusively in the children table (Task 2B) and logging tables to support clean multi-child isolation.

Full Admin Dashboard (/admin):

RLS Policy Enforcement: Route & API endpoints strictly enforced via Supabase RLS policy: (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)).

Tab 1: Coupon Manager Studio: Interface to create and manage promo codes (e.g., SCHOOL50), set percentage discounts (50%), plan duration applicability (Monthly vs Yearly), expiration dates, usage limits, and active toggles.

Tab 2: User Registration Analytics: Metrics showing total registered users, free vs. pro subscription counts, sign-up growth charts, and child age distribution.

Tab 3: Payment Verification & Approval: Review automated card transactions and pending screenshot receipt uploads from Supabase Storage (payment-slips). One-click "Approve" button sets subscription_status = 'pro', subscription_expires_at = NOW() + (30 days OR 365 days), and logs approved_by and approved_at in payment_requests.

Automated Expiration Downgrade Logic:

Add a Supabase SQL trigger/function to check trial and subscription expiration dates nightly. If trial_started_at + 7 days or subscription_expires_at has passed, set subscription_status = 'free', preserving all earned stars and unlocked toys in child profiles.

Code Output:
Generate /utils/supabase/client.ts, Auth page routes, /admin/page.tsx, /profile/page.tsx, and SQL schema migration files with RLS policies and audit trail columns.

🟡 TASK 2B: Multi-Child Profiles, Child Switcher, Onboarding & Terms of Service
Objective: Extend Task 2 auth system with multi-child profile support, avatar selection, onboarding wizard, and ToS acceptance.

Developer Requirements:
Multi-Child Schema (children table):

Create children table: id (uuid), parent_user_id (references auth.users), nickname, avatar_id, target_age_group ('1-3' | '3-6'), unlocked_trophies (text[]), unlocked_toys (text[]), onboarding_completed (boolean), created_at.

RLS: Parents can only read/write children rows where parent_user_id = auth.uid().

Tiered Profile Limits: Trial/Free tier = 1 child profile max. Pro Pass = up to 3 included. Family Pack add-on = up to 6 total.

Avatar Gallery Selector (components/AvatarSelector.tsx): Built-in gallery of pre-designed vector avatars (cute animals, flowers, geometric badges) to guarantee COPPA/GDPR compliance (no real photo uploads).

Child Switcher (components/ChildSwitcher.tsx): Avatar selector in top header; switching updates active child context (activeChildId) app-wide behind a simple Parental Gate (math prompt or hold-3-seconds).

First-Time Onboarding Wizard (app/onboarding/page.tsx):

Shown once immediately after signup, before landing on /.

Screen 1: Brief welcome (non-clinical, encouraging tone).

Screen 2: Pick avatar + nickname for the first child profile.

Screen 3: Select age group ('1-3' or '3-6') — adjusts default difficulty.

"Skip for now" link on every screen. Sets children.onboarding_completed = true on finish or skip.

Terms of Service (app/terms/page.tsx):

Static route covering subscription billing, cancellation/refund policy, acceptable use, and liability limits.

Add required checkbox to Task 2's signup form: "I agree to the Terms of Service and Privacy Policy".

Code Output:
Generate components/ChildSwitcher.tsx, components/AvatarSelector.tsx, hooks/useActiveChild.ts, app/onboarding/page.tsx, components/OnboardingWizard.tsx, app/terms/page.tsx, and Supabase migration for children table + RLS.

🟢 TASK 3: Flashcard Hub (/), Vocal Encouragement, Opt-In Speech & Database Schema
Objective: Build primary flashcards backed by Supabase public.flashcards, infinite array looping, two-tap answer confirmation, Khan Academy-style vocal praise engine, opt-in voice recognition, shared progress logging, and IndexedDB caching.

Developer Requirements:
Direct Supabase SQL Migration (supabase/migrations/003_flashcards_table.sql):

Table Schema: id, flashcard_id, word, category ('nouns' | 'verbs' | 'alphabet'), target_age_group, icon_name, lottie_asset_url, is_active.

Populate with default seed data for all three categories.

Category Tabs & Infinite Array Rotation:

Nouns & Objects: Essential vocabulary cards with Sky Blue borders.

Action Verbs: Movement cards with Emerald Green borders (showing character illustrations executing the action).

ABC Alphabet: Letter cards with Purple borders.

Infinite Array Loop: Selecting cards follows modulo rotation (currentIndex + 1) % flashcardList.length so children never reach a dead-end screen.

Two-Step Answer Confirmation & Vocal Praise Engine:

Tapping an answer card highlights it with a glowing border ring.

Tapping ✅ Confirm Choice plays Framer Motion spring click animation and awards +10 Stars to the active child.

Vocal Encouragement Engine (hooks/useTTS.ts): On correct completion, randomly play joyful spoken feedback: "Awesome!", "Wonderful!", "Well done!", "Super Star!", "Fantastic!".

High-Accuracy (>80%) Trophy Modal:

If session accuracy reaches >80%, trigger Lottie confetti overlay and append Golden Speech Trophy 🏆 to children.unlocked_trophies.

Cross-Platform Speech Engine (hooks/useSpeechRecognition.ts):

Android / Chrome Path: Use native webkitSpeechRecognition paired with string-similarity fuzzy matching using constant SPEECH_MATCH_THRESHOLD = 0.60.

iOS Safari / iPhone Path (Opt-In): Display a prominent "🎤 Speak" mic button triggering lazy-load of @vosk/vosk-browser WebAssembly model.

Fallback: If offline or download fails, hide mic and fall back to Two-Tap confirmation.

Shared Child Progress Logging (utils/logProgress.ts):

Shared utility logging record: { user_id, child_id, feature_route: '/', attempt_type: 'tap' | 'speech', target_word, is_correct, timestamp: now() }.

Offline Queue Logic: If network/Supabase write fails, append record to IndexedDB (localforage) queue pending_progress_logs with a global window online listener to bulk-insert upon reconnection.

Database Schema Creation (user_progress SQL Migration):

SQL migration creating user_progress table with foreign keys user_id (references profiles) AND child_id (references children), secured via RLS.

Code Output:
Generate app/page.tsx, components/CategoryTabs.tsx, components/QuizEngine.tsx, components/RewardTrophyModal.tsx, hooks/useSpeechRecognition.ts, hooks/useTTS.ts, utils/logProgress.ts, supabase/migrations/003_flashcards_table.sql, and supabase/migrations/003b_user_progress.sql.

🟢 TASK 4: Interactive Phonics Sound & Dynamic Vector Engine (/phonics) [Ages 1–3]
Objective: Build a standalone, dynamic Phonics Sound Blend route at /phonics tailored for toddlers using dynamic vector icons, native Web Speech API synthesis, and an infinite array looping engine.

Developer Requirements:
Dynamic Vector Cards & Web Speech Engine:

Fetch phonic blend records directly from Supabase public.phonics_blends.

Render example cards dynamically using Lucide React vector icons based on icon_name stored in the DB record.

Tapping a card triggers native browser speech synthesis (window.speechSynthesis.speak(text)) at rate = 0.7.

Infinite Looping Carousel Engine:

Implement modulo array index rotation (currentIndex = (currentIndex + 1) % phonicsList.length).

When a toddler reaches the end of the phonic list, automatically loop back to index 0 seamlessly.

Touch-based Alphabet Tracing Canvas (components/AlphabetTracingCanvas.tsx):

HTML5 Canvas / SVG stroke engine compatible with touch events on Android and iOS.

Particle/sparkle animations with Web Audio API oscillator feedback on tracing.

Completion Trigger: 100% stroke coverage triggers vocal praise ("Wonderful! B says Ba!"), +10 Stars, and appends Phonics Champion Trophy 🏆 to children.unlocked_trophies.

Progress Logging: Log attempts via shared utils/logProgress.ts including user_id and child_id with feature_route = '/phonics'.

Code Output:
Generate app/phonics/page.tsx, components/PhonicsSoundBreakdown.tsx, components/AlphabetTracingCanvas.tsx, and supabase/migrations/004_phonics_table.sql.

🟢 TASK 5: Duolingo-Style Daily Sentences & Vocab (/sentences) [Ages 3–6]
Objective: Build a Duolingo-style sentence assembly route at /sentences fetching sentences directly from public.sentences with infinite array looping, Web Speech API audio, Lucide vector icons, and child progress logging.

Developer Requirements:
Vocabulary Prep Card:

Display target word with definition, Web Speech API audio, and dynamic Lucide vector icon.

Word Bank Assembly & Infinite Array Loop:

Render word bank selection tray with 3D tactile pills (border-b-4 border-slate-200 active:translate-y-1).

Tapping a word pill moves it into sentence box with Framer Motion spring layout animations (layoutId).

Infinite Looping Mechanism: On completing a sentence, calculate next index via (currentIndex + 1) % sentenceList.length. On reaching the end of the array, loop back to sentence #1 automatically.

Vocal praise ("Super Star! Perfect sentence!") via useTTS.ts.

Direct Supabase Migration (supabase/migrations/005_sentences_table.sql):

Static SQL migration creating public.sentences and inserting routine sentences via jsonb_array_elements.

RLS public read policy (is_active = true).

Cache last 30 sentence objects in IndexedDB (localforage) for offline fallback.

Granular Sentence Attempt Logging: Log results via utils/logProgress.ts with user_id and child_id (feature_route = '/sentences').

Code Output:
Generate app/sentences/page.tsx, components/DuolingoSentenceBuilder.tsx, and supabase/migrations/005_sentences_table.sql.

🟢 TASK 6: IQ Stories Engine, Unfiltered Dual Routes & Infinite Loop (/games/stories/*)
Objective: Build two accessible, dedicated story routes (/games/stories/toddlers and /games/stories/explorers) supporting stories loaded directly from Supabase public.stories with dotLottie vector animations and infinite array rotation.

Developer Requirements:
Direct Supabase SQL Migration (supabase/migrations/006_stories_table.sql):

Static SQL migration file defining schema and RLS policies for public.stories.

Table Schema: id, story_id, title, target_age_group ('1-3' | '3-6'), difficulty_level, theme, content (jsonb), is_active.

Dual Unfiltered Route Architecture & Infinite Loop Engine:

Route 1 (app/games/stories/toddlers/page.tsx): Fetches toddler stories (target_age_group = '1-3'). Rotating index: (currentIndex + 1) % toddlerStories.length.

Route 2 (app/games/stories/explorers/page.tsx): Fetches explorer stories (target_age_group = '3-6'). Rotating index: (currentIndex + 1) % explorerStories.length.

Seamless Rotation: Finishing story #70 automatically loops back to story #1 without interrupting play. Zero profile age gating.

High-Quality Vector UI & Interactive Puzzles (components/StoryScene.tsx):

Render visual assets via @lottiefiles/dotlottie-react vector runtimes for 60 FPS performance.

Smart IQ Puzzle Templates (Shape Tangrams, Pattern Sequences, Odd-One-Out, Object Matching).

3D glassmorphic cards (bg-white/90 backdrop-blur-xl border-2 border-white/80 shadow-2xl rounded-3xl) with spring animations and haptic feedback (navigator.vibrate(30)).

Vocal Encouragement & Trophy Rewards:

Correct answers trigger vocal praise ("Super Star!", "Fantastic job!") via useTTS.ts.

Appends IQ Story Trophy 🏆 to children.unlocked_trophies.

Progress Logging: Log attempts via shared utils/logProgress.ts with user_id and child_id (feature_route = '/games/stories').

Code Output:
Generate app/games/stories/toddlers/page.tsx, app/games/stories/explorers/page.tsx, components/StoryScene.tsx, components/IQPuzzleRenderer.tsx, and supabase/migrations/006_stories_table.sql.

🟢 TASK 7: Free Interactive Mini-Games (/games/trolley & /games/coin-shop)
Objective: Build two lightweight mini-games with 60 FPS Framer Motion animations accessible via the Sidebar menu.

Developer Requirements:
Game 1: Alphabet Supermarket Trolley (/games/trolley):

Horizontal scrolling supermarket aisle with moving Shopping Trolley and floating alphabet item cards.

Infinite/continuous loop mechanism for ongoing gameplay.

Daily Variation via date-seeded shuffle (new Date().toISOString().slice(0,10)).

Log item collections via shared utils/logProgress.ts (user_id, child_id).

Game 2: First Math & Coin Shop (/games/coin-shop):

Dedicated counting game route for toddlers (ages 2–4). Display items priced at 1–3 Gold Coins. Drag coins into Piggy Bank / Register slot with vocal counting audio.

Purchased items save to children.unlocked_toys. Log purchases via shared utils/logProgress.ts (user_id, child_id).

Code Output:
Generate app/games/trolley/page.tsx, app/games/coin-shop/page.tsx, and state/Supabase hooks.

🟢 TASK 8: Calming Sensory Zone (/calm) & Global Motion Controls
Objective: Build sensory regulation games and enforce global reduced-motion settings across all routes.

Developer Requirements:
Guided Paced Breathing Game (/calm):

Interactive SVG mascot that slowly expands and contracts (4s inhale / 4s exhale). Requires continuous finger touch to keep mascot breathing.

Protected Route Rule (No Competitive Metrics): /calm must NEVER display scores, timers, leaderboards, star counts, streak counters, or any performance-based UI element. This route's sole purpose is nervous-system regulation.

Velocity-Controlled Tracing Pad: Measure touch movement speed. If exceeding threshold, pause progress with audio prompt ("Slow down to guide your friend!").

Global Reduced-Motion Setting: Replace active Lottie vector animations with static vector illustrations when enabled in /settings.

Haptic Touch Response: Enable physical vibration (navigator.vibrate(25)).

Code Output:
Generate app/calm/page.tsx, components/BreathingMascot.tsx, components/TracingPad.tsx, and context/SensoryContext.tsx.

🟢 TASK 9: ASD PECS Board (/pecs) & Safety First Exception Guard
Objective: Add non-verbal AAC communication tools and enforce safety access overrides.

Developer Requirements:
PECS Tap-to-Speak Communication Board (/pecs):

Visual grid of essential tap-to-speak cards with large Lucide icons.

Tapping a card speaks the word instantly via Web Speech API (window.speechSynthesis).

SAFETY CRITICAL UNLOCKED EXCEPTION:

The safety essential cards (Water, Toilet, Help, Break) MUST remain 100% accessible and usable at all times, even if the 7-day trial has expired. These 4 cards are excluded from all paywalls.

Code Output:
Generate app/pecs/page.tsx and components/PecsCard.tsx.

🟢 TASK 10: Dynamic Regional Pricing, GST Tax & Geolocation Detection (/upgrade)
Objective: Build region-aware checkout with automatic country detection, PKR pricing for Pakistan, USD/EUR pricing internationally, GST tax display, and manual overrides.

Developer Requirements:
Server-Side Geo-Detection (middleware.ts):

Use @vercel/functions's geolocation() helper to read the visitor's country from Vercel's edge network.

Set a region cookie ('PK' or 'INTL') before /upgrade renders.

Manual Override: Link below pricing cards — "Not in Pakistan? View USD/EUR pricing" (flips cookie via components/RegionToggle.tsx).

Fallback: Default to USD/EUR if geo-detection fails.

Dynamic Regional Price Engine:

International: $3.00 USD/EUR monthly, $15.00 USD/EUR yearly.

Pakistan: 600 PKR monthly (inclusive of tax), 300 PKR + 13% GST with SCHOOL50 coupon, 6,000 PKR yearly.

Family Pack Add-on: +200 PKR/month or +1,000 PKR/year locally; +$2/month internationally.

Payment Gateways & Receipts:

Local: JazzCash/Easypaisa webhook, with direct bank transfer + receipt upload fallback.

International: Payoneer receiving details for transfer + receipt upload.

Manual receipts upload to Supabase Storage (payment-slips) and create records in payment_requests for /admin review.

Automated Confirmation Email: On payment approval, send via Resend API: "Your Pro Pass subscription is active!".

Code Output:
Generate middleware.ts, components/RegionToggle.tsx, app/upgrade/page.tsx, app/api/payments/local/webhook/route.ts, app/api/payments/upload-receipt/route.ts, and Supabase storage handlers.

🟢 TASK 11: 7-Day Trial Guard, Lockdown Middleware & Expiry Enforcement
Objective: Enforce the 7-Day Full-Access Free Trial model and route lockdown middleware across all paid learning activities while preserving safety accessibility.

Developer Requirements:
Trial Calculation Logic:

Upon parent registration (profiles creation), populate trial_started_at = NOW().

Trial Period: trial_started_at to trial_started_at + 7 days.

During Days 1–7: Full access to all 15 routes across all child profiles.

Day 8 Lockdown Middleware & Route Guards (components/TrialGuard.tsx):

On Day 8+, if subscription_status !== 'pro', intercept navigation to /, /phonics, /sentences, /games/*.

Redirect user to /upgrade with a non-intrusive banner: "Your 7-Day Free Trial has expired. Upgrade to Pro Pass to continue learning!".

PECS Emergency Exemption Enforcement:

STRICT RULE: Middleware and TrialGuard must explicitly EXEMPT the /pecs route.

The PECS emergency cards (Water, Toilet, Help, Break) must render and speak audio without restriction forever.

Code Output:
Generate components/TrialGuard.tsx and updated route guard middleware.

🟢 TASK 12: Cognitive Logic & Memory Matching Games (/games/logic & /games/memory)
Objective: Implement two brain-training mini-games with dynamic pattern generation and infinite replay loops.

Developer Requirements:
Cognitive Logic Games (/games/logic):

Shape Tangrams, Pattern Completion, and Odd-One-Out mini-puzzles.

Dynamic pattern generation algorithm for endless variations.

Log completions via utils/logProgress.ts (user_id, child_id).

Memory Matching Game (/games/memory):

Card-flip matching game with sound blend pairs and vocabulary icons.

Modulo/infinite level generation scaling grid size (4, 6, 8 cards).

Log completions via utils/logProgress.ts (user_id, child_id).

Code Output:
Generate app/games/logic/page.tsx and app/games/memory/page.tsx.

🟢 TASK 13: Privacy Policy (/privacy) & COPPA/GDPR Compliance
Objective: Add static privacy documentation fulfilling iOS App Store and Google Play Store submission requirements for child applications.

Developer Requirements:
Privacy Policy Route (app/privacy/page.tsx):

Fully detailed COPPA (Children's Online Privacy Protection Act) & GDPR disclosure.

Explicitly declare: Zero real child photos collected, zero third-party advertising trackers, local Web Speech API processing, secure Supabase encryption.

Code Output:
Generate app/privacy/page.tsx.

🟢 TASK 14: Analytics, Progress Export & Email Reports (/analytics)
Objective: Build parental analytics dashboard with child-specific progress summaries and CSV/email report exporting.

Developer Requirements:
Parent Analytics Dashboard (app/analytics/page.tsx):

Filter stats by active child (child_id).

Display accuracy percentages, practice duration, total stars earned, and weak/strong speech sounds.

Export & Email Engine:

Button to download CSV report of user_progress logs.

"Send Weekly Email Report" button triggering Resend API to send summary to parent's email.

Code Output:
Generate app/analytics/page.tsx and app/api/export-progress/route.ts.

🟢 TASK 15: Child Daily Practice Streaks (user_streaks Table)
Objective: Track daily learning streaks per child profile with automated streak protection logic.

Developer Requirements:
Supabase Schema Migration (supabase/migrations/015_streaks_table.sql):

Create user_streaks table: id, user_id (references profiles), child_id (references children), current_streak, longest_streak, last_practiced_at, updated_at.

Foreign key and RLS enforced.

Streak Tracking Logic:

Completing any activity logs today's date. If yesterday was logged, current_streak += 1. If more than 1 day missed, reset current_streak = 1.

Display streak flame icon 🔥 in top header based on active child context.

Code Output:
Generate hooks/useStreak.ts and supabase/migrations/015_streaks_table.sql.

🟢 TASK 16: Sensory Settings & High-Contrast Controls (/settings)
Objective: Provide full sensory customization controls for parents and therapists.

Developer Requirements:
Settings Screen (app/settings/page.tsx):

Toggles for: Reduced Motion (disables Lottie animations), High Contrast Mode (increases text/border contrast), Audio Pitch/Speed adjusters for TTS, and Speech Recognition Sensitivity (SPEECH_MATCH_THRESHOLD).

Save preferences to SensoryContext and persist in IndexedDB.

Code Output:
Generate app/settings/page.tsx.