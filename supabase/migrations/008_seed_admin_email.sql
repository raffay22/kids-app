-- Seed / promote central admin account by email
-- Safe to re-run (idempotent)

UPDATE public.profiles
SET is_admin = TRUE,
    updated_at = NOW()
WHERE lower(coalesce(parent_email, '')) = lower('maria.umeed1987@gmail.com');

-- Also match auth.users email when profile.parent_email differs
UPDATE public.profiles p
SET is_admin = TRUE,
    updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND lower(coalesce(u.email, '')) = lower('maria.umeed1987@gmail.com');

-- Auto-promote allowlisted email on new signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, parent_email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    lower(coalesce(NEW.email, '')) = lower('maria.umeed1987@gmail.com')
  )
  ON CONFLICT (id) DO UPDATE
    SET parent_email = COALESCE(EXCLUDED.parent_email, public.profiles.parent_email),
        is_admin = public.profiles.is_admin
          OR (lower(coalesce(EXCLUDED.parent_email, '')) = lower('maria.umeed1987@gmail.com'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
