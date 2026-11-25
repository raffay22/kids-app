-- =============================================================================
-- KIDS LEARNING APP: 017_brand_ads.sql + 018_page_analytics.sql
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new
-- =============================================================================

-- Ensure admin check function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 1. BRAND ADS TABLE & POLICIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.brand_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL,
  headline TEXT,
  media_type TEXT NOT NULL DEFAULT 'image'
    CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  media_path TEXT,
  click_url TEXT,
  whatsapp_phone TEXT,
  whatsapp_message TEXT,
  placement TEXT NOT NULL,
  target_page_route TEXT,
  banner_position TEXT NOT NULL DEFAULT 'INLINE'
    CHECK (banner_position IN ('TOP_HEADER', 'INLINE', 'FOOTER_INLINE')),
  monthly_rent_pkr NUMERIC(12, 2) DEFAULT 0,
  brand_contact_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  total_impressions INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  proof_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS brand_ads_placement_active_idx
  ON public.brand_ads (placement, is_active, sort_order);

CREATE INDEX IF NOT EXISTS brand_ads_proof_token_idx
  ON public.brand_ads (proof_token);

ALTER TABLE public.brand_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brand_ads_public_read_active" ON public.brand_ads;
CREATE POLICY "brand_ads_public_read_active"
  ON public.brand_ads FOR SELECT
  USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

DROP POLICY IF EXISTS "brand_ads_admin_all" ON public.brand_ads;
CREATE POLICY "brand_ads_admin_all"
  ON public.brand_ads FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.get_brand_ad_proof(p_token TEXT)
RETURNS TABLE (
  brand_name TEXT,
  total_impressions INTEGER,
  total_clicks INTEGER,
  is_active BOOLEAN,
  placement TEXT,
  monthly_rent_pkr NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    b.brand_name,
    b.total_impressions,
    b.total_clicks,
    b.is_active,
    b.placement,
    b.monthly_rent_pkr
  FROM public.brand_ads b
  WHERE b.proof_token = p_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_brand_ad_proof(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_ad_impression(p_ad_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.brand_ads
  SET total_impressions = total_impressions + 1,
      updated_at = NOW()
  WHERE id = p_ad_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_ad_click(p_ad_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.brand_ads
  SET total_clicks = total_clicks + 1,
      updated_at = NOW()
  WHERE id = p_ad_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ad_impression(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ad_click(UUID) TO anon, authenticated;

-- Public storage bucket for banner creatives
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-ads',
  'brand-ads',
  TRUE,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "brand_ads_storage_admin_write" ON storage.objects;
CREATE POLICY "brand_ads_storage_admin_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'brand-ads' AND public.is_admin())
  WITH CHECK (bucket_id = 'brand-ads' AND public.is_admin());

-- =============================================================================
-- 2. PAGE ANALYTICS TABLE & POLICIES
-- =============================================================================
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

-- Seed canonical routes
INSERT INTO public.page_analytics (page_route, page_title, total_views)
VALUES
  ('/', 'Home Dashboard', 0),
  ('/games', 'Games Hub', 0),
  ('/coloring', 'Colouring Board', 0),
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
