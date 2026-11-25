-- Task L: Partner schools + tokenized discount activation
-- Safe to re-run (idempotent)

-- ---------------------------------------------------------------------------
-- partner_schools
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.school_discount_type AS ENUM ('FREE_100', 'PERCENTAGE', 'CUSTOM_PRICE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.partner_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  city TEXT,
  school_code TEXT UNIQUE,
  school_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  discount_type public.school_discount_type NOT NULL DEFAULT 'FREE_100',
  discount_percentage INTEGER NOT NULL DEFAULT 100
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  custom_price_pkr NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (custom_price_pkr >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_students_count INTEGER NOT NULL DEFAULT 0
    CHECK (joined_students_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_schools_token
  ON public.partner_schools(school_token) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_partner_schools_code
  ON public.partner_schools(school_code);

-- Ensure columns exist if table was created earlier without them
ALTER TABLE public.partner_schools
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS school_token TEXT,
  ADD COLUMN IF NOT EXISTS discount_type public.school_discount_type DEFAULT 'FREE_100',
  ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS custom_price_pkr NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS joined_students_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill tokens for any rows missing them
UPDATE public.partner_schools
SET school_token = encode(gen_random_bytes(24), 'hex')
WHERE school_token IS NULL OR school_token = '';

CREATE UNIQUE INDEX IF NOT EXISTS partner_schools_school_token_key
  ON public.partner_schools(school_token);
CREATE UNIQUE INDEX IF NOT EXISTS partner_schools_school_code_key
  ON public.partner_schools(school_code)
  WHERE school_code IS NOT NULL;

-- ---------------------------------------------------------------------------
-- profiles: school link columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.partner_schools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS school_monthly_price_pkr NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);

-- ---------------------------------------------------------------------------
-- children: optional school_code mirror
-- ---------------------------------------------------------------------------
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS school_code TEXT,
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.partner_schools(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.partner_schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS partner_schools_admin_all ON public.partner_schools;
CREATE POLICY partner_schools_admin_all ON public.partner_schools
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Public can read active school by token (via anon) for signup preview
DROP POLICY IF EXISTS partner_schools_public_active_select ON public.partner_schools;
CREATE POLICY partner_schools_public_active_select ON public.partner_schools
  FOR SELECT USING (is_active = TRUE);

-- ---------------------------------------------------------------------------
-- Activate school partner for a parent (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.activate_school_partner(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  sch public.partner_schools%ROWTYPE;
  monthly_price NUMERIC(10,2);
  grant_free BOOLEAN := FALSE;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) = 0 THEN
    RAISE EXCEPTION 'Missing school token';
  END IF;

  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    -- Allow service role (auth.uid null) or matching user
    IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  END IF;

  SELECT * INTO sch
  FROM public.partner_schools
  WHERE school_token = trim(p_token) AND is_active = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive school invitation';
  END IF;

  -- Price resolution (Basic Pro list = 300 PKR)
  IF sch.discount_type = 'FREE_100' OR sch.discount_percentage >= 100 THEN
    monthly_price := 0;
    grant_free := TRUE;
  ELSIF sch.discount_type = 'CUSTOM_PRICE' THEN
    monthly_price := sch.custom_price_pkr;
    grant_free := (monthly_price <= 0);
  ELSE
    -- PERCENTAGE
    monthly_price := ROUND(300 * (100 - sch.discount_percentage) / 100.0, 2);
    IF sch.custom_price_pkr > 0 THEN
      monthly_price := sch.custom_price_pkr;
    END IF;
    grant_free := (monthly_price <= 0);
  END IF;

  UPDATE public.profiles
  SET
    school_id = sch.id,
    school_code = COALESCE(sch.school_code, sch.school_token),
    school_monthly_price_pkr = monthly_price,
    subscription_status = CASE
      WHEN grant_free THEN 'pro'
      ELSE subscription_status
    END,
    subscription_expires_at = CASE
      WHEN grant_free THEN NOW() + INTERVAL '365 days'
      ELSE subscription_expires_at
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  UPDATE public.children
  SET
    school_id = sch.id,
    school_code = COALESCE(sch.school_code, sch.school_token)
  WHERE parent_user_id = p_user_id;

  UPDATE public.partner_schools
  SET
    joined_students_count = joined_students_count + 1,
    updated_at = NOW()
  WHERE id = sch.id;

  RETURN jsonb_build_object(
    'ok', TRUE,
    'school_id', sch.id,
    'school_name', sch.school_name,
    'school_code', COALESCE(sch.school_code, sch.school_token),
    'discount_type', sch.discount_type,
    'monthly_price_pkr', monthly_price,
    'granted_basic_pro', grant_free
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.activate_school_partner(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_school_partner(TEXT, UUID) TO service_role;

-- Rotate / revoke token helper
CREATE OR REPLACE FUNCTION public.revoke_school_token(p_school_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;
  new_token := encode(gen_random_bytes(24), 'hex');
  UPDATE public.partner_schools
  SET school_token = new_token, is_active = FALSE, updated_at = NOW()
  WHERE id = p_school_id;
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.revoke_school_token(UUID) TO authenticated;
