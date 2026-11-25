-- =============================================================================
-- GROWVA JUNIOR — COMPLETE ADMIN SETUP MIGRATION
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new
--
-- This script creates:
--   1. Admin verification helper (public.is_admin)
--   2. Brand Ads table + storage bucket (brand_ads)
--   3. Page Analytics table + route counters (page_analytics)
--   4. Shop Products table (shop_products)
--   5. Printable Worksheets table (printable_worksheets)
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
-- 1. BRAND ADS
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
-- 2. PAGE ANALYTICS
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

-- =============================================================================
-- 3. SHOP PRODUCTS (Physical Merch)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('wooden', 'workbooks', 'sensory')),
  price_pkr INTEGER NOT NULL DEFAULT 0,
  blurb TEXT,
  image_url TEXT,
  whatsapp_order_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active shop products" ON public.shop_products;
CREATE POLICY "Public read active shop products"
  ON public.shop_products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage shop products" ON public.shop_products;
CREATE POLICY "Admins manage shop products"
  ON public.shop_products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.shop_products (slug, title, category, price_pkr, blurb, sort_order)
VALUES
  ('wood-abc', 'Soft Wooden ABC Blocks', 'wooden', 1800, 'Chunky pastel letters for tiny hands.', 10),
  ('wood-shapes', 'Rainbow Shape Sorter', 'wooden', 2200, 'Calm colors, quiet clicks, big smiles.', 20),
  ('wb-math', '50-Page Early Math Book', 'workbooks', 150, 'Counting & tracing pages for home practice.', 30),
  ('wb-noun', '50-Page Noun Matching Book', 'workbooks', 150, 'Picture matching for speech practice.', 40),
  ('kit-calm', 'Calm Sensory Kit', 'sensory', 3500, 'Soft textures, fidget tools, quiet play.', 50)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 4. PRINTABLE WORKSHEETS METADATA
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.printable_worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('2-4', '4-6', '6-9')),
  category TEXT NOT NULL CHECK (category IN ('math', 'english', 'colouring')),
  description TEXT,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  total_pages INT DEFAULT 50,
  file_size TEXT DEFAULT '12 MB',
  price_pkr INTEGER NOT NULL DEFAULT 150,
  drip_unlock_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS printable_worksheets_storage_path_uidx
  ON public.printable_worksheets (storage_path);

ALTER TABLE public.printable_worksheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on printable_worksheets" ON public.printable_worksheets;
CREATE POLICY "Allow public read on printable_worksheets"
  ON public.printable_worksheets FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage printable_worksheets" ON public.printable_worksheets;
CREATE POLICY "Admins manage printable_worksheets"
  ON public.printable_worksheets FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.printable_worksheets
  (title, age_group, category, description, file_name, storage_path, total_pages)
VALUES
  ('Toddler Shape & Number Tracing', '2-4', 'math',
   '50-Page ink-saver counting and shape outlines',
   'nursery-math-pack.pdf', 'age-2-4/math/nursery-math-pack.pdf', 50),
  ('ABC Letter & Phonics Tracing', '2-4', 'english',
   'Big tracing letters with beginner sound illustrations',
   'nursery-phonics-pack.pdf', 'age-2-4/english/nursery-phonics-pack.pdf', 50),
  ('Big Animals & Shapes Colouring', '2-4', 'colouring',
   'Thick-line coloring sheets for early motor skills',
   'nursery-colouring-pack.pdf', 'age-2-4/colouring/nursery-colouring-pack.pdf', 50),
  ('Visual Addition & Number Bonds', '4-6', 'math',
   'Simple picture-based math and counting exercises',
   'kg-math-pack.pdf', 'age-4-6/math/kg-math-pack.pdf', 50),
  ('Sight Words & CVC Sentence Tracing', '4-6', 'english',
   'Word building, vowels, and handwriting practice',
   'kg-english-pack.pdf', 'age-4-6/english/kg-english-pack.pdf', 50),
  ('Nature & Farm Animals Art Pages', '4-6', 'colouring',
   'Creative line art and color-by-number pages',
   'kg-colouring-pack.pdf', 'age-4-6/colouring/kg-colouring-pack.pdf', 50),
  ('Math Logic, Multiplication & Time', '6-9', 'math',
   'Equation puzzles, word problems, and logic grids',
   'primary-math-pack.pdf', 'age-6-9/math/primary-math-pack.pdf', 50),
  ('Grammar, Nouns & Story Writing', '6-9', 'english',
   'Sentence construction and reading comprehension sheets',
   'primary-english-pack.pdf', 'age-6-9/english/primary-english-pack.pdf', 50),
  ('Doodle Art & Creative Patterns', '6-9', 'colouring',
   'Detailed mandala and pattern coloring for focus',
   'primary-colouring-pack.pdf', 'age-6-9/colouring/primary-colouring-pack.pdf', 50)
ON CONFLICT (storage_path) DO NOTHING;
