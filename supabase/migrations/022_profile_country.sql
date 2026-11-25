-- Safe additive migration: store user country code (ISO 3166-1 alpha-2, e.g. 'PK', 'US')
-- Used for PKR vs USD checkout pricing in UpgradeCheckout.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT;
