-- Task 3: user_progress table (idempotent — also created in 002_children_multi_profile.sql)
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
COMMENT ON TABLE public.user_progress IS 'Shared progress log used by Tasks 3–7. Always includes child_id for multi-child tracking.';
