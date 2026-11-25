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
