-- =============================================================================
-- KIDS LEARNING APP — RUN ALL MIGRATIONS IN SUPABASE SQL EDITOR (ONE PASTE)
-- =============================================================================
-- Order: 001 → 002 → 003 → 004 → 005 (already concatenated below)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT
--
-- TABLES (exact names used in Next.js code — do NOT rename):
--   profiles          → AuthProvider, signup, profile, admin
--   children          → ActiveChildProvider, onboarding, QuizEngine, PhonicsHub
--   user_progress     → utils/logProgress.ts (feature_route: '/', '/phonics', '/sentences')
--   user_streaks      → future streak features (Task 11+)
--   coupons           → admin CouponManager
--   payment_requests  → admin payments API
--   phonics_blends    → PhonicsSoundBreakdown (.from('phonics_blends'))
--   sentences         → DuolingoSentenceBuilder (.from('sentences'))
--   storage bucket    → payment-slips (admin receipt uploads)
-- =============================================================================

-- Task 2: Profiles, Auth, Coupons, Payment Requests, RLS, Expiration Downgrade
-- Run via Supabase SQL editor or `supabase db push`

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_email TEXT,
  child_nickname TEXT,
  target_age_group TEXT CHECK (target_age_group IN ('1-3', '3-6')),
  avatar_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  stars INTEGER NOT NULL DEFAULT 0,
  unlocked_trophies JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_toys JSONB NOT NULL DEFAULT '[]'::jsonb,
  reduce_motion BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_profiles_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, parent_email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  plan_type TEXT NOT NULL DEFAULT 'both' CHECK (plan_type IN ('monthly', 'yearly', 'both')),
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Payment Requests (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT NOT NULL DEFAULT 'manual',
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'PKR',
  receipt_path TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_status, subscription_expires_at);

-- ---------------------------------------------------------------------------
-- Admin helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- Automated subscription expiration downgrade
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.downgrade_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.profiles
  SET subscription_status = 'free'
  WHERE subscription_status = 'pro'
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at < NOW();

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Schedule nightly at 02:00 UTC (requires pg_cron extension on Supabase Pro)
-- SELECT cron.schedule(
--   'downgrade-expired-subscriptions',
--   '0 2 * * *',
--   $$SELECT public.downgrade_expired_subscriptions();$$
-- );

-- Approve payment helper (called from admin API with service role or admin RLS)
CREATE OR REPLACE FUNCTION public.approve_payment_request(
  request_id UUID,
  approver_id UUID
)
RETURNS VOID AS $$
DECLARE
  req public.payment_requests%ROWTYPE;
  extension INTERVAL;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = approver_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  SELECT * INTO req FROM public.payment_requests WHERE id = request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found';
  END IF;

  extension := CASE WHEN req.plan_type = 'yearly' THEN INTERVAL '365 days' ELSE INTERVAL '30 days' END;

  UPDATE public.payment_requests
  SET status = 'approved', approved_by = approver_id, approved_at = NOW()
  WHERE id = request_id;

  UPDATE public.profiles
  SET subscription_status = 'pro', subscription_expires_at = NOW() + extension
  WHERE id = req.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: own row access
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Coupons: public read active; admin write
DROP POLICY IF EXISTS coupons_select_active ON public.coupons;
CREATE POLICY coupons_select_active ON public.coupons
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS coupons_admin_all ON public.coupons;
CREATE POLICY coupons_admin_all ON public.coupons
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Payment requests: users see own; admin sees all
DROP POLICY IF EXISTS payment_requests_select_own ON public.payment_requests;
CREATE POLICY payment_requests_select_own ON public.payment_requests
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS payment_requests_insert_own ON public.payment_requests;
CREATE POLICY payment_requests_insert_own ON public.payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS payment_requests_admin_update ON public.payment_requests;
CREATE POLICY payment_requests_admin_update ON public.payment_requests
  FOR UPDATE USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for payment receipt screenshots
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-slips', 'payment-slips', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS payment_slips_upload ON storage.objects;
CREATE POLICY payment_slips_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-slips'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS payment_slips_read ON storage.objects;
CREATE POLICY payment_slips_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-slips'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );
-- Task 2B: Multi-Child Profiles, Tracking Tables with child_id, Tier Limits
-- Run after 001_profiles_auth_admin.sql

-- ---------------------------------------------------------------------------
-- Extend profiles for ToS + Family Pack add-on
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS family_pack BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- Children (multi-profile per parent)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL DEFAULT 'Explorer',
  avatar_id TEXT,
  age_group TEXT CHECK (age_group IN ('1-3', '3-6')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  stars INTEGER NOT NULL DEFAULT 0,
  unlocked_trophies JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_toys JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_children_parent ON public.children(parent_user_id);

-- Migrate legacy single-child data from profiles â†’ children (one-time)
INSERT INTO public.children (parent_user_id, nickname, avatar_id, age_group, onboarding_completed)
SELECT
  p.id,
  COALESCE(NULLIF(TRIM(p.child_nickname), ''), 'Explorer'),
  p.avatar_id,
  p.target_age_group,
  TRUE
FROM public.profiles p
WHERE (p.child_nickname IS NOT NULL OR p.avatar_id IS NOT NULL OR p.target_age_group IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM public.children c WHERE c.parent_user_id = p.id
  );

-- ---------------------------------------------------------------------------
-- Child limit helper (Free=1, Pro=3, Family Pack=6)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_child_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  sub_status TEXT;
  has_family BOOLEAN;
BEGIN
  SELECT subscription_status, family_pack
  INTO sub_status, has_family
  FROM public.profiles
  WHERE id = p_user_id;

  IF has_family THEN RETURN 6; END IF;
  IF sub_status = 'pro' THEN RETURN 3; END IF;
  RETURN 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.enforce_child_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.children
  WHERE parent_user_id = NEW.parent_user_id;

  max_allowed := public.get_child_limit(NEW.parent_user_id);

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Child profile limit reached (%). Upgrade to add more.', max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS children_limit_check ON public.children;
CREATE TRIGGER children_limit_check
  BEFORE INSERT ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.enforce_child_limit();

-- ---------------------------------------------------------------------------
-- Tracking tables with child_id from the start (used by Tasks 3+)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  feature_route TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('tap', 'speech')),
  target_word TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_child ON public.user_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);

CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  feature_route TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, feature_route)
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_child ON public.user_streaks(child_id);

-- ---------------------------------------------------------------------------
-- RLS: children
-- ---------------------------------------------------------------------------
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS children_select_own ON public.children;
CREATE POLICY children_select_own ON public.children
  FOR SELECT USING (parent_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS children_insert_own ON public.children;
CREATE POLICY children_insert_own ON public.children
  FOR INSERT WITH CHECK (parent_user_id = auth.uid());

DROP POLICY IF EXISTS children_update_own ON public.children;
CREATE POLICY children_update_own ON public.children
  FOR UPDATE USING (parent_user_id = auth.uid());

DROP POLICY IF EXISTS children_delete_own ON public.children;
CREATE POLICY children_delete_own ON public.children
  FOR DELETE USING (parent_user_id = auth.uid());

-- user_progress: parent reads/writes own children's rows
DROP POLICY IF EXISTS user_progress_select_own ON public.user_progress;
CREATE POLICY user_progress_select_own ON public.user_progress
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS user_progress_insert_own ON public.user_progress;
CREATE POLICY user_progress_insert_own ON public.user_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.parent_user_id = auth.uid()
    )
  );

-- user_streaks
DROP POLICY IF EXISTS user_streaks_select_own ON public.user_streaks;
CREATE POLICY user_streaks_select_own ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS user_streaks_all_own ON public.user_streaks;
CREATE POLICY user_streaks_all_own ON public.user_streaks
  FOR ALL USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.parent_user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.parent_user_id = auth.uid()
    )
  );
-- Task 3: user_progress table (idempotent â€” also created in 002_children_multi_profile.sql)
-- Run if applying Task 3 schema independently.

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  feature_route TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('tap', 'speech')),
  target_word TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_child ON public.user_progress(child_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_route ON public.user_progress(feature_route);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_progress_select_own ON public.user_progress;
CREATE POLICY user_progress_select_own ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS user_progress_insert_own ON public.user_progress;
CREATE POLICY user_progress_insert_own ON public.user_progress
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id AND c.parent_user_id = auth.uid()
    )
  );

-- Bulk flush support: users can read own rows for analytics export (Task 11)
COMMENT ON TABLE public.user_progress IS 'Shared progress log used by Tasks 3â€“7. Always includes child_id for multi-child tracking.';
-- Task 4: Phonics blends table + seed data + RLS
-- Run after 002_children_multi_profile.sql

CREATE TABLE IF NOT EXISTS public.phonics_blends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blend TEXT NOT NULL,
  letter TEXT NOT NULL,
  example_word TEXT NOT NULL,
  speak_text TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phonics_blends_active ON public.phonics_blends(is_active, sort_order);

ALTER TABLE public.phonics_blends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS phonics_blends_public_read ON public.phonics_blends;
CREATE POLICY phonics_blends_public_read ON public.phonics_blends
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS phonics_blends_admin_write ON public.phonics_blends;
CREATE POLICY phonics_blends_admin_write ON public.phonics_blends
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed only when table is empty
INSERT INTO public.phonics_blends (blend, letter, example_word, speak_text, icon_name, sort_order)
SELECT * FROM (VALUES
  -- SINGLE LETTER BLENDS (A-Z)
  ('AA', 'A', 'Apple', 'Aa like Apple', 'Apple', 1),
  ('BB', 'B', 'Ball', 'Bb like Ball', 'CircleDot', 2),
  ('CC', 'C', 'Cat', 'Cc like Cat', 'Cat', 3),
  ('DD', 'D', 'Dog', 'Dd like Dog', 'Dog', 4),
  ('EE', 'E', 'Elephant', 'Ee like Elephant', 'Footprints', 5),
  ('FF', 'F', 'Fish', 'Ff like Fish', 'Fish', 6),
  ('GG', 'G', 'Garden', 'Gg like Garden', 'Sprout', 7),
  ('HH', 'H', 'Hat', 'Hh like Hat', 'HardHat', 8),
  ('II', 'I', 'Igloo', 'Ii like Igloo', 'Home', 9),
  ('JJ', 'J', 'Jump', 'Jj like Jump', 'ArrowUp', 10),
  ('KK', 'K', 'Kite', 'Kk like Kite', 'Wind', 11),
  ('LL', 'L', 'Lion', 'Ll like Lion', 'Crown', 12),
  ('MM', 'M', 'Moon', 'Mm like Moon', 'Moon', 13),
  ('NN', 'N', 'Nest', 'Nn like Nest', 'Home', 14),
  ('OO', 'O', 'Orange', 'Oo like Orange', 'Circle', 15),
  ('PP', 'P', 'Pizza', 'Pp like Pizza', 'Pizza', 16),
  ('QQ', 'Q', 'Queen', 'Qq like Queen', 'Crown', 17),
  ('RR', 'R', 'Rain', 'Rr like Rain', 'CloudRain', 18),
  ('SS', 'S', 'Sun', 'Ss like Sun', 'Sun', 19),
  ('TT', 'T', 'Tree', 'Tt like Tree', 'Trees', 20),
  ('UU', 'U', 'Umbrella', 'Uu like Umbrella', 'CloudRain', 21),
  ('VV', 'V', 'Van', 'Vv like Van', 'Truck', 22),
  ('WW', 'W', 'Water', 'Ww like Water', 'Droplet', 23),
  ('XX', 'X', 'X-ray', 'Xx like X-ray', 'Scan', 24),
  ('YY', 'Y', 'Yawn', 'Yy like Yawn', 'Smile', 25),
  ('ZZ', 'Z', 'Zebra', 'Zz like Zebra', 'Footprints', 26),

  -- DIGRAPHS (2-LETTER COMBINATIONS)
  ('SH', 'S', 'Ship', 'Sh like Ship', 'Ship', 27),
  ('CH', 'C', 'Chair', 'Ch like Chair', 'Armchair', 28),
  ('TH', 'T', 'Thumb', 'Th like Thumb', 'ThumbsUp', 29),
  ('PH', 'P', 'Phone', 'Ph like Phone', 'Phone', 30),
  ('WH', 'W', 'Whale', 'Wh like Whale', 'Fish', 31),

  -- 3-LETTER BLENDS
  ('STR', 'S', 'Street', 'Str like Street', 'LayoutGrid', 32),
  ('SPR', 'S', 'Spring', 'Spr like Spring', 'Sprout', 33),
  ('SCR', 'S', 'Scratch', 'Scr like Scratch', 'Hand', 34),
  ('THR', 'T', 'Three', 'Thr like Three', 'Binary', 35),
  ('SPL', 'S', 'Splash', 'Spl like Splash', 'Droplets', 36)
) AS v(blend, letter, example_word, speak_text, icon_name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_blends LIMIT 1);

COMMENT ON TABLE public.phonics_blends IS 'Toddler phonic sound blends for /phonics route. icon_name maps to lucide-react exports.';
-- Step 1: Create Table Schema for Daily Sentences & Vocab
CREATE TABLE IF NOT EXISTS public.sentences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sentence_id TEXT UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,              -- e.g. 'School & Homework', 'Morning Routine'
  target_age_group VARCHAR(10) DEFAULT '3-6',
  target_vocabulary JSONB NOT NULL,           -- Word, meaning, and dynamic Lucide icon name
  full_sentence TEXT NOT NULL,
  word_bank JSONB NOT NULL,                   -- Shuffled array of interactive word pills
  correct_order JSONB NOT NULL,               -- Ordered array for validation
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow read access to sentences'
  ) THEN
    CREATE POLICY "Allow read access to sentences" 
    ON public.sentences FOR SELECT 
    USING (is_active = true);
  END IF;
END $$;

-- Step 2: Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sentences_category ON public.sentences(category);
CREATE INDEX IF NOT EXISTS idx_sentences_age_group ON public.sentences(target_age_group);

-- Step 3: Insert 100 Daily Sentences
INSERT INTO public.sentences (sentence_id, category, target_age_group, target_vocabulary, full_sentence, word_bank, correct_order)
SELECT 
  item->>'sentence_id',
  item->>'category',
  item->>'target_age_group',
  item->'target_vocabulary' AS target_vocabulary,
  item->>'full_sentence',
  item->'word_bank' AS word_bank,
  item->'correct_order' AS correct_order
FROM jsonb_array_elements('
[
  {
    "sentence_id": "sent_routine_001",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Assignments",
      "meaning": "School tasks given by teacher",
      "icon_name": "BookOpen"
    },
    "full_sentence": "My teacher gave me homework today",
    "word_bank": ["My", "teacher", "gave", "me", "homework", "today", "tomorrow", "play"],
    "correct_order": ["My", "teacher", "gave", "me", "homework", "today"]
  },
  {
    "sentence_id": "sent_routine_002",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Visiting",
      "meaning": "Going to see someone",
      "icon_name": "Users"
    },
    "full_sentence": "I am going to my friend''s house",
    "word_bank": ["I", "am", "going", "to", "my", "friend''s", "house", "school"],
    "correct_order": ["I", "am", "going", "to", "my", "friend''s", "house"]
  },
  {
    "sentence_id": "sent_routine_003",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Promptly",
      "meaning": "Quickly without delay",
      "icon_name": "AlarmClock"
    },
    "full_sentence": "I wake up promptly in the morning",
    "word_bank": ["I", "wake", "up", "promptly", "in", "the", "morning", "night"],
    "correct_order": ["I", "wake", "up", "promptly", "in", "the", "morning"]
  },
  {
    "sentence_id": "sent_routine_004",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Thoroughly",
      "meaning": "Completely and carefully",
      "icon_name": "Sparkles"
    },
    "full_sentence": "I brush my teeth thoroughly twice daily",
    "word_bank": ["I", "brush", "my", "teeth", "thoroughly", "twice", "daily", "hair"],
    "correct_order": ["I", "brush", "my", "teeth", "thoroughly", "twice", "daily"]
  },
  {
    "sentence_id": "sent_routine_005",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Scrumptious",
      "meaning": "Extremely delicious food",
      "icon_name": "UtensilsCrossed"
    },
    "full_sentence": "Breakfast was scrumptious this morning",
    "word_bank": ["Breakfast", "was", "scrumptious", "this", "morning", "evening", "cold"],
    "correct_order": ["Breakfast", "was", "scrumptious", "this", "morning"]
  },
  {
    "sentence_id": "sent_routine_006",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Exhausted",
      "meaning": "Very tired after activity",
      "icon_name": "Moon"
    },
    "full_sentence": "I am exhausted after playing football",
    "word_bank": ["I", "am", "exhausted", "after", "playing", "football", "dancing"],
    "correct_order": ["I", "am", "exhausted", "after", "playing", "football"]
  },
  {
    "sentence_id": "sent_routine_007",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Assisting",
      "meaning": "Helping someone with work",
      "icon_name": "HeartHandshake"
    },
    "full_sentence": "I am assisting Mom with cleaning",
    "word_bank": ["I", "am", "assisting", "Mom", "with", "cleaning", "sleeping"],
    "correct_order": ["I", "am", "assisting", "Mom", "with", "cleaning"]
  },
  {
    "sentence_id": "sent_routine_008",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Attentively",
      "meaning": "Listening with full attention",
      "icon_name": "Ear"
    },
    "full_sentence": "I listen attentively to my teacher",
    "word_bank": ["I", "listen", "attentively", "to", "my", "teacher", "singing"],
    "correct_order": ["I", "listen", "attentively", "to", "my", "teacher"]
  },
  {
    "sentence_id": "sent_routine_009",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Energetic",
      "meaning": "Full of energy and active",
      "icon_name": "Zap"
    },
    "full_sentence": "We are energetic at the park",
    "word_bank": ["We", "are", "energetic", "at", "the", "park", "store"],
    "correct_order": ["We", "are", "energetic", "at", "the", "park"]
  },
  {
    "sentence_id": "sent_routine_010",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Peaceful",
      "meaning": "Quiet and calm state",
      "icon_name": "Bed"
    },
    "full_sentence": "Reading books brings a peaceful sleep",
    "word_bank": ["Reading", "books", "brings", "a", "peaceful", "sleep", "noise"],
    "correct_order": ["Reading", "books", "brings", "a", "peaceful", "sleep"]
  },
  {
    "sentence_id": "sent_routine_011",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Punctual",
      "meaning": "Arriving on exact time",
      "icon_name": "Clock"
    },
    "full_sentence": "The school bus arrives punctual daily",
    "word_bank": ["The", "school", "bus", "arrives", "punctual", "daily", "late"],
    "correct_order": ["The", "school", "bus", "arrives", "punctual", "daily"]
  },
  {
    "sentence_id": "sent_routine_012",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Nourishing",
      "meaning": "Healthy food good for body",
      "icon_name": "Apple"
    },
    "full_sentence": "Fresh milk is a nourishing drink",
    "word_bank": ["Fresh", "milk", "is", "a", "nourishing", "drink", "soda"],
    "correct_order": ["Fresh", "milk", "is", "a", "nourishing", "drink"]
  },
  {
    "sentence_id": "sent_routine_013",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sharing",
      "meaning": "Giving a portion to others",
      "icon_name": "Gift"
    },
    "full_sentence": "Sharing toys makes everyone happy friends",
    "word_bank": ["Sharing", "toys", "makes", "everyone", "happy", "friends", "sad"],
    "correct_order": ["Sharing", "toys", "makes", "everyone", "happy", "friends"]
  },
  {
    "sentence_id": "sent_routine_014",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Refreshing",
      "meaning": "Making you feel fresh again",
      "icon_name": "Droplets"
    },
    "full_sentence": "A warm bath is very refreshing",
    "word_bank": ["A", "warm", "bath", "is", "very", "refreshing", "dirty"],
    "correct_order": ["A", "warm", "bath", "is", "very", "refreshing"]
  },
  {
    "sentence_id": "sent_routine_015",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Organizing",
      "meaning": "Putting things in right order",
      "icon_name": "LayoutGrid"
    },
    "full_sentence": "I am organizing my school shoes",
    "word_bank": ["I", "am", "organizing", "my", "school", "shoes", "toys"],
    "correct_order": ["I", "am", "organizing", "my", "school", "shoes"]
  },
  {
    "sentence_id": "sent_routine_016",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Delighted",
      "meaning": "Extremely pleased or happy",
      "icon_name": "Smile"
    },
    "full_sentence": "I am delighted to see grandma",
    "word_bank": ["I", "am", "delighted", "to", "see", "grandma", "teacher"],
    "correct_order": ["I", "am", "delighted", "to", "see", "grandma"]
  },
  {
    "sentence_id": "sent_routine_017",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Cautious",
      "meaning": "Being safe and careful",
      "icon_name": "ShieldAlert"
    },
    "full_sentence": "We are cautious when crossing roads",
    "word_bank": ["We", "are", "cautious", "when", "crossing", "roads", "running"],
    "correct_order": ["We", "are", "cautious", "when", "crossing", "roads"]
  },
  {
    "sentence_id": "sent_routine_018",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Curious",
      "meaning": "Eager to learn new things",
      "icon_name": "HelpCircle"
    },
    "full_sentence": "Curious kids ask wonderful smart questions",
    "word_bank": ["Curious", "kids", "ask", "wonderful", "smart", "questions", "sleep"],
    "correct_order": ["Curious", "kids", "ask", "wonderful", "smart", "questions"]
  },
  {
    "sentence_id": "sent_routine_019",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Hydrated",
      "meaning": "Having enough water in body",
      "icon_name": "GlassWater"
    },
    "full_sentence": "Drinking water keeps me healthy hydrated",
    "word_bank": ["Drinking", "water", "keeps", "me", "healthy", "hydrated", "candy"],
    "correct_order": ["Drinking", "water", "keeps", "me", "healthy", "hydrated"]
  },
  {
    "sentence_id": "sent_routine_020",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Grateful",
      "meaning": "Feeling thankful for good things",
      "icon_name": "Heart"
    },
    "full_sentence": "I am grateful for my family",
    "word_bank": ["I", "am", "grateful", "for", "my", "family", "angry"],
    "correct_order": ["I", "am", "grateful", "for", "my", "family"]
  },
  {
    "sentence_id": "sent_routine_021",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Stretching",
      "meaning": "Reaching muscles after sleep",
      "icon_name": "Sun"
    },
    "full_sentence": "Stretching my arms feels so good",
    "word_bank": ["Stretching", "my", "arms", "feels", "so", "good", "bad"],
    "correct_order": ["Stretching", "my", "arms", "feels", "so", "good"]
  },
  {
    "sentence_id": "sent_routine_022",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Combing",
      "meaning": "Untangling hair neatly",
      "icon_name": "Scissors"
    },
    "full_sentence": "I am combing my hair neatly",
    "word_bank": ["I", "am", "combing", "my", "hair", "neatly", "dirty"],
    "correct_order": ["I", "am", "combing", "my", "hair", "neatly"]
  },
  {
    "sentence_id": "sent_routine_023",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Focused",
      "meaning": "Giving full attention to task",
      "icon_name": "Target"
    },
    "full_sentence": "I stay focused during drawing class",
    "word_bank": ["I", "stay", "focused", "during", "drawing", "class", "sleeping"],
    "correct_order": ["I", "stay", "focused", "during", "drawing", "class"]
  },
  {
    "sentence_id": "sent_routine_024",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Chewing",
      "meaning": "Crushing food with teeth",
      "icon_name": "Smile"
    },
    "full_sentence": "Chewing food slowly helps healthy digestion",
    "word_bank": ["Chewing", "food", "slowly", "helps", "healthy", "digestion", "fast"],
    "correct_order": ["Chewing", "food", "slowly", "helps", "healthy", "digestion"]
  },
  {
    "sentence_id": "sent_routine_025",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Polite",
      "meaning": "Having good manners with respect",
      "icon_name": "ThumbsUp"
    },
    "full_sentence": "Saying please and thank you is polite",
    "word_bank": ["Saying", "please", "and", "thank", "you", "is", "polite", "rude"],
    "correct_order": ["Saying", "please", "and", "thank", "you", "is", "polite"]
  },
  {
    "sentence_id": "sent_routine_026",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Exploring",
      "meaning": "Searching around a new place",
      "icon_name": "Compass"
    },
    "full_sentence": "We are exploring butterflies in garden",
    "word_bank": ["We", "are", "exploring", "butterflies", "in", "garden", "house"],
    "correct_order": ["We", "are", "exploring", "butterflies", "in", "garden"]
  },
  {
    "sentence_id": "sent_routine_027",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Folded",
      "meaning": "Brought cloth together neatly",
      "icon_name": "CheckSquare"
    },
    "full_sentence": "I folded my clean laundry shirts",
    "word_bank": ["I", "folded", "my", "clean", "laundry", "shirts", "dirty"],
    "correct_order": ["I", "folded", "my", "clean", "laundry", "shirts"]
  },
  {
    "sentence_id": "sent_routine_028",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Patient",
      "meaning": "Waiting calmly without getting mad",
      "icon_name": "Hourglass"
    },
    "full_sentence": "I am patient while waiting turns",
    "word_bank": ["I", "am", "patient", "while", "waiting", "turns", "crying"],
    "correct_order": ["I", "am", "patient", "while", "waiting", "turns"]
  },
  {
    "sentence_id": "sent_routine_029",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sanitizing",
      "meaning": "Cleaning germs off hands",
      "icon_name": "Shield"
    },
    "full_sentence": "Sanitizing hands removes invisible bad germs",
    "word_bank": ["Sanitizing", "hands", "removes", "invisible", "bad", "germs", "dirt"],
    "correct_order": ["Sanitizing", "hands", "removes", "invisible", "bad", "germs"]
  },
  {
    "sentence_id": "sent_routine_030",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Cozy",
      "meaning": "Warm and comfortable feeling",
      "icon_name": "Home"
    },
    "full_sentence": "My bed feels warm and cozy",
    "word_bank": ["My", "bed", "feels", "warm", "and", "cozy", "cold"],
    "correct_order": ["My", "bed", "feels", "warm", "and", "cozy"]
  },
  {
    "sentence_id": "sent_routine_031",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Prepared",
      "meaning": "Ready for something",
      "icon_name": "CheckCircle"
    },
    "full_sentence": "I am always prepared for my class",
    "word_bank": ["I", "am", "always", "prepared", "for", "my", "class", "late"],
    "correct_order": ["I", "am", "always", "prepared", "for", "my", "class"]
  },
  {
    "sentence_id": "sent_routine_032",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Invited",
      "meaning": "Asked to come to an event",
      "icon_name": "Mail"
    },
    "full_sentence": "I am invited to my friend''s party",
    "word_bank": ["I", "am", "invited", "to", "my", "friend''s", "party", "school"],
    "correct_order": ["I", "am", "invited", "to", "my", "friend''s", "party"]
  },
  {
    "sentence_id": "sent_routine_033",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sunny",
      "meaning": "Bright with lots of sunlight",
      "icon_name": "Sun"
    },
    "full_sentence": "It is a bright sunny day outside",
    "word_bank": ["It", "is", "a", "bright", "sunny", "day", "outside", "rainy"],
    "correct_order": ["It", "is", "a", "bright", "sunny", "day", "outside"]
  },
  {
    "sentence_id": "sent_routine_034",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Flossing",
      "meaning": "Cleaning between teeth",
      "icon_name": "Droplet"
    },
    "full_sentence": "Flossing keeps my teeth extra clean",
    "word_bank": ["Flossing", "keeps", "my", "teeth", "extra", "clean", "dirty"],
    "correct_order": ["Flossing", "keeps", "my", "teeth", "extra", "clean"]
  },
  {
    "sentence_id": "sent_routine_035",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Flavorful",
      "meaning": "Having strong good taste",
      "icon_name": "Coffee"
    },
    "full_sentence": "The soup tastes very flavorful today",
    "word_bank": ["The", "soup", "tastes", "very", "flavorful", "today", "yesterday"],
    "correct_order": ["The", "soup", "tastes", "very", "flavorful", "today"]
  },
  {
    "sentence_id": "sent_routine_036",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Excited",
      "meaning": "Feeling very happy about something",
      "icon_name": "PartyPopper"
    },
    "full_sentence": "I am excited for our school trip",
    "word_bank": ["I", "am", "excited", "for", "our", "school", "trip", "home"],
    "correct_order": ["I", "am", "excited", "for", "our", "school", "trip"]
  },
  {
    "sentence_id": "sent_routine_037",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Caring",
      "meaning": "Showing love and kindness",
      "icon_name": "Heart"
    },
    "full_sentence": "My grandma is very caring and kind",
    "word_bank": ["My", "grandma", "is", "very", "caring", "and", "kind", "mean"],
    "correct_order": ["My", "grandma", "is", "very", "caring", "and", "kind"]
  },
  {
    "sentence_id": "sent_routine_038",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Climbing",
      "meaning": "Going up high on things",
      "icon_name": "ArrowUp"
    },
    "full_sentence": "We are climbing on the playground slide",
    "word_bank": ["We", "are", "climbing", "on", "the", "playground", "slide", "swing"],
    "correct_order": ["We", "are", "climbing", "on", "the", "playground", "slide"]
  },
  {
    "sentence_id": "sent_routine_039",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Reading",
      "meaning": "Looking at words in books",
      "icon_name": "Book"
    },
    "full_sentence": "I love reading story books daily",
    "word_bank": ["I", "love", "reading", "story", "books", "daily", "weekly"],
    "correct_order": ["I", "love", "reading", "story", "books", "daily"]
  },
  {
    "sentence_id": "sent_routine_040",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Dreaming",
      "meaning": "Having thoughts while sleeping",
      "icon_name": "Moon"
    },
    "full_sentence": "Dreaming about fun adventures at night",
    "word_bank": ["Dreaming", "about", "fun", "adventures", "at", "night", "day"],
    "correct_order": ["Dreaming", "about", "fun", "adventures", "at", "night"]
  },
  {
    "sentence_id": "sent_routine_041",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Homework",
      "meaning": "Work to do after school",
      "icon_name": "PenTool"
    },
    "full_sentence": "My homework is finished and complete",
    "word_bank": ["My", "homework", "is", "finished", "and", "complete", "missing"],
    "correct_order": ["My", "homework", "is", "finished", "and", "complete"]
  },
  {
    "sentence_id": "sent_routine_042",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Together",
      "meaning": "Doing something with someone",
      "icon_name": "Users"
    },
    "full_sentence": "We play together in the garden",
    "word_bank": ["We", "play", "together", "in", "the", "garden", "house"],
    "correct_order": ["We", "play", "together", "in", "the", "garden"]
  },
  {
    "sentence_id": "sent_routine_043",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Waking",
      "meaning": "Opening eyes after sleep",
      "icon_name": "Sunrise"
    },
    "full_sentence": "Waking up early makes me happy",
    "word_bank": ["Waking", "up", "early", "makes", "me", "happy", "sad"],
    "correct_order": ["Waking", "up", "early", "makes", "me", "happy"]
  },
  {
    "sentence_id": "sent_routine_044",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Washing",
      "meaning": "Cleaning with soap and water",
      "icon_name": "Hand"
    },
    "full_sentence": "Washing hands with soap is important",
    "word_bank": ["Washing", "hands", "with", "soap", "is", "important", "optional"],
    "correct_order": ["Washing", "hands", "with", "soap", "is", "important"]
  },
  {
    "sentence_id": "sent_routine_045",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Hungry",
      "meaning": "Feeling like eating something",
      "icon_name": "Utensils"
    },
    "full_sentence": "I am feeling hungry for lunch",
    "word_bank": ["I", "am", "feeling", "hungry", "for", "lunch", "dinner"],
    "correct_order": ["I", "am", "feeling", "hungry", "for", "lunch"]
  },
  {
    "sentence_id": "sent_routine_046",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Proud",
      "meaning": "Feeling good about achievement",
      "icon_name": "Award"
    },
    "full_sentence": "I am proud of my drawing skill",
    "word_bank": ["I", "am", "proud", "of", "my", "drawing", "skill", "mistake"],
    "correct_order": ["I", "am", "proud", "of", "my", "drawing", "skill"]
  },
  {
    "sentence_id": "sent_routine_047",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Cooked",
      "meaning": "Prepared food with cooking",
      "icon_name": "ChefHat"
    },
    "full_sentence": "Mom cooked delicious pasta for us",
    "word_bank": ["Mom", "cooked", "delicious", "pasta", "for", "us", "them"],
    "correct_order": ["Mom", "cooked", "delicious", "pasta", "for", "us"]
  },
  {
    "sentence_id": "sent_routine_048",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Swinging",
      "meaning": "Moving back and forth on swings",
      "icon_name": "Repeat"
    },
    "full_sentence": "I am swinging high on the swing",
    "word_bank": ["I", "am", "swinging", "high", "on", "the", "swing", "slide"],
    "correct_order": ["I", "am", "swinging", "high", "on", "the", "swing"]
  },
  {
    "sentence_id": "sent_routine_049",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Spelling",
      "meaning": "Writing words correctly",
      "icon_name": "PenTool"
    },
    "full_sentence": "I am practicing my spelling words",
    "word_bank": ["I", "am", "practicing", "my", "spelling", "words", "numbers"],
    "correct_order": ["I", "am", "practicing", "my", "spelling", "words"]
  },
  {
    "sentence_id": "sent_routine_050",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Lullaby",
      "meaning": "Soft song to help sleep",
      "icon_name": "Music"
    },
    "full_sentence": "Mom sings a sweet lullaby softly",
    "word_bank": ["Mom", "sings", "a", "sweet", "lullaby", "softly", "loudly"],
    "correct_order": ["Mom", "sings", "a", "sweet", "lullaby", "softly"]
  },
  {
    "sentence_id": "sent_routine_051",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Studying",
      "meaning": "Learning from books and teachers",
      "icon_name": "BookOpen"
    },
    "full_sentence": "I am studying new things at school",
    "word_bank": ["I", "am", "studying", "new", "things", "at", "school", "home"],
    "correct_order": ["I", "am", "studying", "new", "things", "at", "school"]
  },
  {
    "sentence_id": "sent_routine_052",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Friendship",
      "meaning": "Being friends with someone",
      "icon_name": "Heart"
    },
    "full_sentence": "Friendship makes everyone feel very happy",
    "word_bank": ["Friendship", "makes", "everyone", "feel", "very", "happy", "sad"],
    "correct_order": ["Friendship", "makes", "everyone", "feel", "very", "happy"]
  },
  {
    "sentence_id": "sent_routine_053",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Fresh",
      "meaning": "New and clean",
      "icon_name": "Sparkles"
    },
    "full_sentence": "I feel fresh after taking a bath",
    "word_bank": ["I", "feel", "fresh", "after", "taking", "a", "bath", "shower"],
    "correct_order": ["I", "feel", "fresh", "after", "taking", "a", "bath"]
  },
  {
    "sentence_id": "sent_routine_054",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Clean",
      "meaning": "Not dirty",
      "icon_name": "Sparkle"
    },
    "full_sentence": "Clean clothes feel very nice to wear",
    "word_bank": ["Clean", "clothes", "feel", "very", "nice", "to", "wear", "dirty"],
    "correct_order": ["Clean", "clothes", "feel", "very", "nice", "to", "wear"]
  },
  {
    "sentence_id": "sent_routine_055",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Yummy",
      "meaning": "Tastes very good",
      "icon_name": "Cookie"
    },
    "full_sentence": "Mom made yummy cookies for us",
    "word_bank": ["Mom", "made", "yummy", "cookies", "for", "us", "them"],
    "correct_order": ["Mom", "made", "yummy", "cookies", "for", "us"]
  },
  {
    "sentence_id": "sent_routine_056",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Calm",
      "meaning": "Feeling peaceful and relaxed",
      "icon_name": "Cloud"
    },
    "full_sentence": "I feel calm and relaxed in my room",
    "word_bank": ["I", "feel", "calm", "and", "relaxed", "in", "my", "room", "park"],
    "correct_order": ["I", "feel", "calm", "and", "relaxed", "in", "my", "room"]
  },
  {
    "sentence_id": "sent_routine_057",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Helpful",
      "meaning": "Helping others with work",
      "icon_name": "HandHelping"
    },
    "full_sentence": "I try to be helpful in my family",
    "word_bank": ["I", "try", "to", "be", "helpful", "in", "my", "family", "school"],
    "correct_order": ["I", "try", "to", "be", "helpful", "in", "my", "family"]
  },
  {
    "sentence_id": "sent_routine_058",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Running",
      "meaning": "Moving fast with legs",
      "icon_name": "Footprints"
    },
    "full_sentence": "I love running fast in the park",
    "word_bank": ["I", "love", "running", "fast", "in", "the", "park", "school"],
    "correct_order": ["I", "love", "running", "fast", "in", "the", "park"]
  },
  {
    "sentence_id": "sent_routine_059",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Writing",
      "meaning": "Using a pen to make letters",
      "icon_name": "Pen"
    },
    "full_sentence": "I am writing a letter to my friend",
    "word_bank": ["I", "am", "writing", "a", "letter", "to", "my", "friend", "teacher"],
    "correct_order": ["I", "am", "writing", "a", "letter", "to", "my", "friend"]
  },
  {
    "sentence_id": "sent_routine_060",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Rest",
      "meaning": "Sleeping and relaxing",
      "icon_name": "Bed"
    },
    "full_sentence": "I need good rest for tomorrow",
    "word_bank": ["I", "need", "good", "rest", "for", "tomorrow", "today"],
    "correct_order": ["I", "need", "good", "rest", "for", "tomorrow"]
  },
  {
    "sentence_id": "sent_routine_061",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Learning",
      "meaning": "Gaining new knowledge",
      "icon_name": "GraduationCap"
    },
    "full_sentence": "Learning new things is so much fun",
    "word_bank": ["Learning", "new", "things", "is", "so", "much", "fun", "boring"],
    "correct_order": ["Learning", "new", "things", "is", "so", "much", "fun"]
  },
  {
    "sentence_id": "sent_routine_062",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Celebrate",
      "meaning": "Enjoying a happy event",
      "icon_name": "PartyPopper"
    },
    "full_sentence": "We celebrate birthdays with our friends",
    "word_bank": ["We", "celebrate", "birthdays", "with", "our", "friends", "family"],
    "correct_order": ["We", "celebrate", "birthdays", "with", "our", "friends"]
  },
  {
    "sentence_id": "sent_routine_063",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Morning",
      "meaning": "Early part of the day",
      "icon_name": "Sun"
    },
    "full_sentence": "Every morning I eat healthy breakfast",
    "word_bank": ["Every", "morning", "I", "eat", "healthy", "breakfast", "dinner"],
    "correct_order": ["Every", "morning", "I", "eat", "healthy", "breakfast"]
  },
  {
    "sentence_id": "sent_routine_064",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Healthy",
      "meaning": "Strong and well body",
      "icon_name": "Activity"
    },
    "full_sentence": "We eat healthy food to grow strong",
    "word_bank": ["We", "eat", "healthy", "food", "to", "grow", "strong", "weak"],
    "correct_order": ["We", "eat", "healthy", "food", "to", "grow", "strong"]
  },
  {
    "sentence_id": "sent_routine_065",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Delicious",
      "meaning": "Tasting really good",
      "icon_name": "Coffee"
    },
    "full_sentence": "This delicious cake is for dessert",
    "word_bank": ["This", "delicious", "cake", "is", "for", "dessert", "lunch"],
    "correct_order": ["This", "delicious", "cake", "is", "for", "dessert"]
  },
  {
    "sentence_id": "sent_routine_066",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Brave",
      "meaning": "Not afraid of things",
      "icon_name": "Shield"
    },
    "full_sentence": "I am very brave during thunderstorms",
    "word_bank": ["I", "am", "very", "brave", "during", "thunderstorms", "rain"],
    "correct_order": ["I", "am", "very", "brave", "during", "thunderstorms"]
  },
  {
    "sentence_id": "sent_routine_067",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Relax",
      "meaning": "Resting after work",
      "icon_name": "Armchair"
    },
    "full_sentence": "We relax together after school time",
    "word_bank": ["We", "relax", "together", "after", "school", "time", "home"],
    "correct_order": ["We", "relax", "together", "after", "school", "time"]
  },
  {
    "sentence_id": "sent_routine_068",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Playing",
      "meaning": "Having fun with activities",
      "icon_name": "Gamepad"
    },
    "full_sentence": "Playing with toys is my favorite",
    "word_bank": ["Playing", "with", "toys", "is", "my", "favorite", "least"],
    "correct_order": ["Playing", "with", "toys", "is", "my", "favorite"]
  },
  {
    "sentence_id": "sent_routine_069",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Practice",
      "meaning": "Doing something again to learn",
      "icon_name": "Repeat"
    },
    "full_sentence": "I practice my handwriting every day",
    "word_bank": ["I", "practice", "my", "handwriting", "every", "day", "week"],
    "correct_order": ["I", "practice", "my", "handwriting", "every", "day"]
  },
  {
    "sentence_id": "sent_routine_070",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Evening",
      "meaning": "Late part of the day",
      "icon_name": "Moon"
    },
    "full_sentence": "In the evening I brush my teeth",
    "word_bank": ["In", "the", "evening", "I", "brush", "my", "teeth", "hair"],
    "correct_order": ["In", "the", "evening", "I", "brush", "my", "teeth"]
  },
  {
    "sentence_id": "sent_routine_071",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Teacher",
      "meaning": "Person who teaches at school",
      "icon_name": "User"
    },
    "full_sentence": "My teacher helps me with my work",
    "word_bank": ["My", "teacher", "helps", "me", "with", "my", "work", "play"],
    "correct_order": ["My", "teacher", "helps", "me", "with", "my", "work"]
  },
  {
    "sentence_id": "sent_routine_072",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Kind",
      "meaning": "Nice and caring to others",
      "icon_name": "Heart"
    },
    "full_sentence": "Being kind to friends is very good",
    "word_bank": ["Being", "kind", "to", "friends", "is", "very", "good", "bad"],
    "correct_order": ["Being", "kind", "to", "friends", "is", "very", "good"]
  },
  {
    "sentence_id": "sent_routine_073",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Dressed",
      "meaning": "Putting clothes on",
      "icon_name": "Shirt"
    },
    "full_sentence": "I get dressed quickly in the morning",
    "word_bank": ["I", "get", "dressed", "quickly", "in", "the", "morning", "evening"],
    "correct_order": ["I", "get", "dressed", "quickly", "in", "the", "morning"]
  },
  {
    "sentence_id": "sent_routine_074",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Brushing",
      "meaning": "Using a brush on hair or teeth",
      "icon_name": "Brush"
    },
    "full_sentence": "Brushing my hair makes it look shiny",
    "word_bank": ["Brushing", "my", "hair", "makes", "it", "look", "shiny", "dull"],
    "correct_order": ["Brushing", "my", "hair", "makes", "it", "look", "shiny"]
  },
  {
    "sentence_id": "sent_routine_075",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Thirsty",
      "meaning": "Feeling like drinking water",
      "icon_name": "GlassWater"
    },
    "full_sentence": "I am thirsty after playing outside",
    "word_bank": ["I", "am", "thirsty", "after", "playing", "outside", "inside"],
    "correct_order": ["I", "am", "thirsty", "after", "playing", "outside"]
  },
  {
    "sentence_id": "sent_routine_076",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Lonely",
      "meaning": "Feeling alone and missing others",
      "icon_name": "User"
    },
    "full_sentence": "I feel lonely when friends are away",
    "word_bank": ["I", "feel", "lonely", "when", "friends", "are", "away", "near"],
    "correct_order": ["I", "feel", "lonely", "when", "friends", "are", "away"]
  },
  {
    "sentence_id": "sent_routine_077",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Gardening",
      "meaning": "Growing plants and flowers",
      "icon_name": "Sprout"
    },
    "full_sentence": "We are gardening in our backyard",
    "word_bank": ["We", "are", "gardening", "in", "our", "backyard", "front"],
    "correct_order": ["We", "are", "gardening", "in", "our", "backyard"]
  },
  {
    "sentence_id": "sent_routine_078",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Skipping",
      "meaning": "Jumping over a rope",
      "icon_name": "Footprints"
    },
    "full_sentence": "Skipping rope is great exercise fun",
    "word_bank": ["Skipping", "rope", "is", "great", "exercise", "fun", "hard"],
    "correct_order": ["Skipping", "rope", "is", "great", "exercise", "fun"]
  },
  {
    "sentence_id": "sent_routine_079",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Listening",
      "meaning": "Hearing and understanding",
      "icon_name": "Ear"
    },
    "full_sentence": "We listen carefully to our teacher",
    "word_bank": ["We", "listen", "carefully", "to", "our", "teacher", "friend"],
    "correct_order": ["We", "listen", "carefully", "to", "our", "teacher"]
  },
  {
    "sentence_id": "sent_routine_080",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Quiet",
      "meaning": "Making very little noise",
      "icon_name": "Volume2"
    },
    "full_sentence": "The night is very quiet and dark",
    "word_bank": ["The", "night", "is", "very", "quiet", "and", "dark", "bright"],
    "correct_order": ["The", "night", "is", "very", "quiet", "and", "dark"]
  },
  {
    "sentence_id": "sent_routine_081",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Smart",
      "meaning": "Very intelligent and bright",
      "icon_name": "Brain"
    },
    "full_sentence": "I want to be a smart student",
    "word_bank": ["I", "want", "to", "be", "a", "smart", "student", "teacher"],
    "correct_order": ["I", "want", "to", "be", "a", "smart", "student"]
  },
  {
    "sentence_id": "sent_routine_082",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Caring",
      "meaning": "Showing love and concern",
      "icon_name": "Heart"
    },
    "full_sentence": "Caring friends make me feel warm",
    "word_bank": ["Caring", "friends", "make", "me", "feel", "warm", "cold"],
    "correct_order": ["Caring", "friends", "make", "me", "feel", "warm"]
  },
  {
    "sentence_id": "sent_routine_083",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Early",
      "meaning": "Before the usual time",
      "icon_name": "Sunrise"
    },
    "full_sentence": "I wake up early to see the sun",
    "word_bank": ["I", "wake", "up", "early", "to", "see", "the", "sun", "moon"],
    "correct_order": ["I", "wake", "up", "early", "to", "see", "the", "sun"]
  },
  {
    "sentence_id": "sent_routine_084",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Showering",
      "meaning": "Washing body with water",
      "icon_name": "Droplets"
    },
    "full_sentence": "Showering every day keeps me clean",
    "word_bank": ["Showering", "every", "day", "keeps", "me", "clean", "dirty"],
    "correct_order": ["Showering", "every", "day", "keeps", "me", "clean"]
  },
  {
    "sentence_id": "sent_routine_085",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Fruit",
      "meaning": "Sweet food from plants",
      "icon_name": "Apple"
    },
    "full_sentence": "Eating fresh fruit makes me healthy",
    "word_bank": ["Eating", "fresh", "fruit", "makes", "me", "healthy", "sick"],
    "correct_order": ["Eating", "fresh", "fruit", "makes", "me", "healthy"]
  },
  {
    "sentence_id": "sent_routine_086",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Worried",
      "meaning": "Feeling anxious about something",
      "icon_name": "AlertCircle"
    },
    "full_sentence": "I feel worried when I lose things",
    "word_bank": ["I", "feel", "worried", "when", "I", "lose", "things", "find"],
    "correct_order": ["I", "feel", "worried", "when", "I", "lose", "things"]
  },
  {
    "sentence_id": "sent_routine_087",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Dusting",
      "meaning": "Removing dust from surfaces",
      "icon_name": "Sparkles"
    },
    "full_sentence": "I am dusting the shelves in the room",
    "word_bank": ["I", "am", "dusting", "the", "shelves", "in", "the", "room", "kitchen"],
    "correct_order": ["I", "am", "dusting", "the", "shelves", "in", "the", "room"]
  },
  {
    "sentence_id": "sent_routine_088",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Cycling",
      "meaning": "Riding a bicycle",
      "icon_name": "Bike"
    },
    "full_sentence": "I am cycling fast on the street",
    "word_bank": ["I", "am", "cycling", "fast", "on", "the", "street", "road"],
    "correct_order": ["I", "am", "cycling", "fast", "on", "the", "street"]
  },
  {
    "sentence_id": "sent_routine_089",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Drawing",
      "meaning": "Making pictures with pencils",
      "icon_name": "Pencil"
    },
    "full_sentence": "Drawing beautiful pictures is my hobby",
    "word_bank": ["Drawing", "beautiful", "pictures", "is", "my", "hobby", "work"],
    "correct_order": ["Drawing", "beautiful", "pictures", "is", "my", "hobby"]
  },
  {
    "sentence_id": "sent_routine_090",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sleepy",
      "meaning": "Feeling like going to sleep",
      "icon_name": "Moon"
    },
    "full_sentence": "I am feeling very sleepy tonight",
    "word_bank": ["I", "am", "feeling", "very", "sleepy", "tonight", "morning"],
    "correct_order": ["I", "am", "feeling", "very", "sleepy", "tonight"]
  },
  {
    "sentence_id": "sent_routine_091",
    "category": "School & Homework",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Counting",
      "meaning": "Saying numbers in order",
      "icon_name": "Binary"
    },
    "full_sentence": "I am counting numbers up to one hundred",
    "word_bank": ["I", "am", "counting", "numbers", "up", "to", "one", "hundred", "ten"],
    "correct_order": ["I", "am", "counting", "numbers", "up", "to", "one", "hundred"]
  },
  {
    "sentence_id": "sent_routine_092",
    "category": "Social & Friends",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sharing",
      "meaning": "Giving some to others",
      "icon_name": "Gift"
    },
    "full_sentence": "Sharing my snacks with friends is good",
    "word_bank": ["Sharing", "my", "snacks", "with", "friends", "is", "good", "bad"],
    "correct_order": ["Sharing", "my", "snacks", "with", "friends", "is", "good"]
  },
  {
    "sentence_id": "sent_routine_093",
    "category": "Morning Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Breakfast",
      "meaning": "First meal of the day",
      "icon_name": "Coffee"
    },
    "full_sentence": "I always eat breakfast before school",
    "word_bank": ["I", "always", "eat", "breakfast", "before", "school", "home"],
    "correct_order": ["I", "always", "eat", "breakfast", "before", "school"]
  },
  {
    "sentence_id": "sent_routine_094",
    "category": "Hygiene & Care",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Nails",
      "meaning": "Hard parts at finger tips",
      "icon_name": "Hand"
    },
    "full_sentence": "I clip my nails when they are long",
    "word_bank": ["I", "clip", "my", "nails", "when", "they", "are", "long", "short"],
    "correct_order": ["I", "clip", "my", "nails", "when", "they", "are", "long"]
  },
  {
    "sentence_id": "sent_routine_095",
    "category": "Mealtime & Food",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Vegetables",
      "meaning": "Healthy green food",
      "icon_name": "Leaf"
    },
    "full_sentence": "Vegetables help me grow and stay strong",
    "word_bank": ["Vegetables", "help", "me", "grow", "and", "stay", "strong", "weak"],
    "correct_order": ["Vegetables", "help", "me", "grow", "and", "stay", "strong"]
  },
  {
    "sentence_id": "sent_routine_096",
    "category": "Feelings & Emotion",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Grateful",
      "meaning": "Feeling thankful for things",
      "icon_name": "Heart"
    },
    "full_sentence": "I am grateful for my happy family",
    "word_bank": ["I", "am", "grateful", "for", "my", "happy", "family", "sad"],
    "correct_order": ["I", "am", "grateful", "for", "my", "happy", "family"]
  },
  {
    "sentence_id": "sent_routine_097",
    "category": "Home & Family",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Sweeping",
      "meaning": "Cleaning floor with a broom",
      "icon_name": "Sparkles"
    },
    "full_sentence": "I am sweeping the kitchen floor today",
    "word_bank": ["I", "am", "sweeping", "the", "kitchen", "floor", "today", "yesterday"],
    "correct_order": ["I", "am", "sweeping", "the", "kitchen", "floor", "today"]
  },
  {
    "sentence_id": "sent_routine_098",
    "category": "Outdoor & Play",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Jumping",
      "meaning": "Pushing up with legs",
      "icon_name": "ArrowUp"
    },
    "full_sentence": "I am jumping high on the trampoline",
    "word_bank": ["I", "am", "jumping", "high", "on", "the", "trampoline", "ground"],
    "correct_order": ["I", "am", "jumping", "high", "on", "the", "trampoline"]
  },
  {
    "sentence_id": "sent_routine_099",
    "category": "School & Learning",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Remember",
      "meaning": "Keeping things in memory",
      "icon_name": "Brain"
    },
    "full_sentence": "I remember all my friends'' names",
    "word_bank": ["I", "remember", "all", "my", "friends''", "names", "faces"],
    "correct_order": ["I", "remember", "all", "my", "friends''", "names"]
  },
  {
    "sentence_id": "sent_routine_100",
    "category": "Night Routine",
    "target_age_group": "3-6",
    "target_vocabulary": {
      "word": "Tomorrow",
      "meaning": "The day after today",
      "icon_name": "Calendar"
    },
    "full_sentence": "I am ready for tomorrow at school",
    "word_bank": ["I", "am", "ready", "for", "tomorrow", "at", "school", "home"],
    "correct_order": ["I", "am", "ready", "for", "tomorrow", "at", "school"]
  }
]
'::jsonb) AS item
ON CONFLICT (sentence_id) DO UPDATE SET
  category = EXCLUDED.category,
  target_vocabulary = EXCLUDED.target_vocabulary,
  full_sentence = EXCLUDED.full_sentence,
  word_bank = EXCLUDED.word_bank,
  correct_order = EXCLUDED.correct_order;

-- Step 4: Verify the data
SELECT 
  COUNT(*) as total_sentences,
  category,
  COUNT(*) as count_per_category
FROM public.sentences
GROUP BY category
ORDER BY category;

-- ---------------------------------------------------------------------------
-- Phonics 3D media bucket (public) + URL columns
-- Upload A/A1.mp4 only after the A1 card is approved.
-- ---------------------------------------------------------------------------
ALTER TABLE public.phonics_blends
  ADD COLUMN IF NOT EXISTS variant_id TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('phonics', 'phonics', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS phonics_media_public_read ON storage.objects;
CREATE POLICY phonics_media_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'phonics');

DROP POLICY IF EXISTS phonics_media_admin_write ON storage.objects;
CREATE POLICY phonics_media_admin_write ON storage.objects
  FOR ALL USING (bucket_id = 'phonics' AND public.is_admin())
  WITH CHECK (bucket_id = 'phonics' AND public.is_admin());

