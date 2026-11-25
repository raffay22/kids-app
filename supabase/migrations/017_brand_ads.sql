-- Brand partner banner ads (image or video) — multi-placement, admin-managed
-- No Google AdSense. Public read of active ads; admin CRUD + storage upload.

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

-- Brand proof page (no auth): limited fields by token
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

-- Public bucket: no broad SELECT (avoids directory-listing advisory).
DROP POLICY IF EXISTS "brand_ads_storage_public_read" ON storage.objects;

DROP POLICY IF EXISTS "brand_ads_storage_admin_write" ON storage.objects;
CREATE POLICY "brand_ads_storage_admin_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'brand-ads' AND public.is_admin())
  WITH CHECK (bucket_id = 'brand-ads' AND public.is_admin());
