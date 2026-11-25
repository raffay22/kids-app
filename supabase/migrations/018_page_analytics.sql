-- Page-by-page traffic analytics + helpers for live admin dashboard

CREATE TABLE IF NOT EXISTS public.page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_route TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL DEFAULT '',
  total_views INTEGER NOT NULL DEFAULT 0,
  active_users_now INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_analytics_views_idx
  ON public.page_analytics (total_views DESC);

ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_analytics_public_read" ON public.page_analytics;
CREATE POLICY "page_analytics_public_read"
  ON public.page_analytics FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "page_analytics_admin_all" ON public.page_analytics;
CREATE POLICY "page_analytics_admin_all"
  ON public.page_analytics FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Atomic view increment (upsert by route)
CREATE OR REPLACE FUNCTION public.increment_page_view(
  p_route TEXT,
  p_title TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_analytics (page_route, page_title, total_views, updated_at)
  VALUES (
    p_route,
    COALESCE(NULLIF(trim(p_title), ''), p_route),
    1,
    NOW()
  )
  ON CONFLICT (page_route) DO UPDATE
  SET
    total_views = public.page_analytics.total_views + 1,
    page_title = COALESCE(
      NULLIF(trim(p_title), ''),
      public.page_analytics.page_title
    ),
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_page_view(TEXT, TEXT) TO anon, authenticated;

-- Optional: sync active_users_now snapshot from admin/client (presence is source of truth live)
CREATE OR REPLACE FUNCTION public.set_page_active_users(
  p_route TEXT,
  p_count INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_analytics (page_route, page_title, active_users_now, updated_at)
  VALUES (p_route, p_route, GREATEST(0, p_count), NOW())
  ON CONFLICT (page_route) DO UPDATE
  SET
    active_users_now = GREATEST(0, p_count),
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_page_active_users(TEXT, INTEGER) TO anon, authenticated;

-- Ensure brand_ads monetization columns exist (safe if 017 already applied)
ALTER TABLE public.brand_ads
  ADD COLUMN IF NOT EXISTS target_page_route TEXT,
  ADD COLUMN IF NOT EXISTS banner_position TEXT DEFAULT 'INLINE',
  ADD COLUMN IF NOT EXISTS monthly_rent_pkr NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS total_impressions INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_clicks INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_token TEXT;

UPDATE public.brand_ads
SET proof_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
WHERE proof_token IS NULL OR proof_token = '';

CREATE UNIQUE INDEX IF NOT EXISTS brand_ads_proof_token_uidx
  ON public.brand_ads (proof_token);

INSERT INTO public.page_analytics (page_route, page_title, total_views)
VALUES
  ('/', 'Home Dashboard', 0),
  ('/games', 'Games Hub', 0),
  ('/games/stories', 'Stories Hub', 0),
  ('/worksheets', 'Worksheets Hub', 0),
  ('/shop', 'Parent Shop', 0),
  ('/flashcards', 'Flashcards', 0),
  ('/sentences', 'Sentences', 0),
  ('/analytics', 'Progress Tracking', 0),
  ('/asd', 'ASD Sensory Hub', 0),
  ('/upgrade', 'Upgrade', 0),
  ('/pecs', 'PECS', 0)
ON CONFLICT (page_route) DO NOTHING;
