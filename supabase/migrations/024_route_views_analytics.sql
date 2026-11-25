-- =============================================================================
-- GROWVA JUNIOR — ANONYMOUS ROUTE-BY-ROUTE & DAY-BY-DAY ANALYTICS
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Project: https://supabase.com/dashboard/project/rgacgfnsxkiolebdnqfj/sql/new
-- =============================================================================

-- Ensure admin helper exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Strictly anonymous route views table (NO user_id, NO IP, NO PII)
CREATE TABLE IF NOT EXISTS public.route_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast range and group queries for sponsor reports
CREATE INDEX IF NOT EXISTS route_views_path_viewed_idx
  ON public.route_views (route_path, viewed_at DESC);

CREATE INDEX IF NOT EXISTS route_views_viewed_at_idx
  ON public.route_views (viewed_at DESC);

ALTER TABLE public.route_views ENABLE ROW LEVEL SECURITY;

-- Anyone can record an anonymous page view
DROP POLICY IF EXISTS "route_views_anon_insert" ON public.route_views;
CREATE POLICY "route_views_anon_insert"
  ON public.route_views FOR INSERT
  WITH CHECK (TRUE);

-- Only admins can read granular traffic reports
DROP POLICY IF EXISTS "route_views_admin_read" ON public.route_views;
CREATE POLICY "route_views_admin_read"
  ON public.route_views FOR SELECT
  USING (public.is_admin());
