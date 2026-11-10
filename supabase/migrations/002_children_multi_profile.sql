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

-- Migrate legacy single-child data from profiles → children (one-time)
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
