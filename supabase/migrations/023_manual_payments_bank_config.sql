-- =============================================================================
-- GROWVA JUNIOR — MANUAL PAYMENT SYSTEM (Admin Bank Config + Proof Submissions)
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

-- Add explicit is_pro flag to profiles (synced alongside subscription_status = 'pro')
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE;

-- =============================================================================
-- 1. PAYMENT SETTINGS (Admin Bank & Mobile Wallet Config)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  bank_name TEXT NOT NULL DEFAULT 'Meezan Bank',
  account_title TEXT NOT NULL DEFAULT 'Growva Business',
  account_number TEXT NOT NULL DEFAULT '',
  jazzcash_number TEXT NOT NULL DEFAULT '',
  easypaisa_number TEXT NOT NULL DEFAULT '',
  pro_price_display TEXT NOT NULL DEFAULT 'Rs. 1,500 / Month',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_settings_public_read" ON public.payment_settings;
CREATE POLICY "payment_settings_public_read"
  ON public.payment_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "payment_settings_admin_all" ON public.payment_settings;
CREATE POLICY "payment_settings_admin_all"
  ON public.payment_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.payment_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. PAYMENT SUBMISSIONS (Parent Proof Uploads + Admin Verification)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_name TEXT,
  parent_phone TEXT,
  amount TEXT NOT NULL DEFAULT 'Rs. 1,500 / Month',
  receipt_url TEXT NOT NULL,
  receipt_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_submissions_status_created_idx
  ON public.payment_submissions (status, created_at DESC);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_submissions_user_insert" ON public.payment_submissions;
CREATE POLICY "payment_submissions_user_insert"
  ON public.payment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payment_submissions_user_read_own" ON public.payment_submissions;
CREATE POLICY "payment_submissions_user_read_own"
  ON public.payment_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payment_submissions_admin_all" ON public.payment_submissions;
CREATE POLICY "payment_submissions_admin_all"
  ON public.payment_submissions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================================
-- 3. PAYMENT RECEIPTS STORAGE BUCKET (strictly PNG/JPG/JPEG under 5MB)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_receipts',
  'payment_receipts',
  TRUE,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "payment_receipts_public_read" ON storage.objects;
CREATE POLICY "payment_receipts_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment_receipts');

DROP POLICY IF EXISTS "payment_receipts_auth_upload" ON storage.objects;
CREATE POLICY "payment_receipts_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment_receipts' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "payment_receipts_admin_all" ON storage.objects;
CREATE POLICY "payment_receipts_admin_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'payment_receipts' AND public.is_admin())
  WITH CHECK (bucket_id = 'payment_receipts' AND public.is_admin());
