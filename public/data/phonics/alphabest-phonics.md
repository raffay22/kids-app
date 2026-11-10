-- Task 4: Phonics blends table + seed data + RLS
-- Run after 002_children_multi_profile.sql

CREATE TABLE IF NOT EXISTS public.phonics_blends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blend TEXT NOT NULL,
  letter TEXT NOT NULL,
  example_word TEXT NOT NULL,
  speak_text TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phonics_blends_active ON public.phonics_blends(is_active, sort_order);

ALTER TABLE public.phonics_blends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS phonics_blends_public_read ON public.phonics_blends;
CREATE POLICY phonics_blends_public_read ON public.phonics_blends
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS phonics_blends_admin_write ON public.phonics_blends;
CREATE POLICY phonics_blends_admin_write ON public.phonics_blends
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed only when table is empty (preschool Aa/Bb + phonetic speak_text)
INSERT INTO public.phonics_blends (blend, letter, example_word, speak_text, icon_name, sort_order)
SELECT * FROM (VALUES
  ('Aa', 'A', 'Apple', 'Ah... as in Apple', 'Apple', 1),
  ('Bb', 'B', 'Ball', 'Buh... as in Ball', 'CircleDot', 2),
  ('Cc', 'C', 'Cat', 'Cuh... as in Cat', 'Cat', 3),
  ('Dd', 'D', 'Dog', 'Duh... as in Dog', 'Dog', 4),
  ('Ee', 'E', 'Elephant', 'Eh... as in Elephant', 'Footprints', 5),
  ('Ff', 'F', 'Fish', 'Fff... as in Fish', 'Fish', 6),
  ('Gg', 'G', 'Garden', 'Guh... as in Garden', 'Sprout', 7),
  ('Hh', 'H', 'Hat', 'Huh... as in Hat', 'HardHat', 8),
  ('Ii', 'I', 'Igloo', 'Ih... as in Igloo', 'Home', 9),
  ('Jj', 'J', 'Jump', 'Juh... as in Jump', 'ArrowUp', 10),
  ('Kk', 'K', 'Kite', 'Kuh... as in Kite', 'Wind', 11),
  ('Ll', 'L', 'Lion', 'Lll... as in Lion', 'Crown', 12),
  ('Mm', 'M', 'Moon', 'Mmm... as in Moon', 'Moon', 13),
  ('Nn', 'N', 'Nest', 'Nnn... as in Nest', 'Home', 14),
  ('Oo', 'O', 'Orange', 'Off... as in Orange', 'Circle', 15),
  ('Pp', 'P', 'Pizza', 'Puh... as in Pizza', 'Pizza', 16),
  ('Qq', 'Q', 'Queen', 'Kwuh... as in Queen', 'Crown', 17),
  ('Rr', 'R', 'Rain', 'Rrr... as in Rain', 'CloudRain', 18),
  ('Ss', 'S', 'Sun', 'Sss... as in Sun', 'Sun', 19),
  ('Tt', 'T', 'Tree', 'Tuh... as in Tree', 'Trees', 20),
  ('Uu', 'U', 'Umbrella', 'Uh... as in Umbrella', 'CloudRain', 21),
  ('Vv', 'V', 'Van', 'Vvv... as in Van', 'Truck', 22),
  ('Ww', 'W', 'Water', 'Wuh... as in Water', 'Droplet', 23),
  ('Xx', 'X', 'X-ray', 'Ks... as in X-ray', 'Scan', 24),
  ('Yy', 'Y', 'Yawn', 'Yuh... as in Yawn', 'Smile', 25),
  ('Zz', 'Z', 'Zebra', 'Zzz... as in Zebra', 'Footprints', 26),
  ('Sh', 'S', 'Ship', 'Shhh... as in Ship', 'Ship', 27),
  ('Ch', 'C', 'Chair', 'Chuh... as in Chair', 'Armchair', 28),
  ('Th', 'T', 'Thumb', 'Thhh... as in Thumb', 'ThumbsUp', 29),
  ('Ph', 'P', 'Phone', 'Fff... as in Phone', 'Phone', 30),
  ('Wh', 'W', 'Whale', 'Www... as in Whale', 'Fish', 31),
  ('Str', 'S', 'Street', 'Struh... as in Street', 'LayoutGrid', 32),
  ('Spr', 'S', 'Spring', 'Spruh... as in Spring', 'Sprout', 33),
  ('Scr', 'S', 'Scratch', 'Scruh... as in Scratch', 'Hand', 34),
  ('Thr', 'T', 'Three', 'Thruuh... as in Three', 'Binary', 35),
  ('Spl', 'S', 'Splash', 'Spluh... as in Splash', 'Droplets', 36)
) AS v(blend, letter, example_word, speak_text, icon_name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.phonics_blends LIMIT 1);

-- Repair existing AA/BB rows → Aa/Bb + phonetic speak_text
UPDATE public.phonics_blends AS p
SET
  blend = v.blend,
  speak_text = v.speak_text,
  example_word = v.example_word
FROM (VALUES
  (1, 'Aa', 'Ah... as in Apple', 'Apple'),
  (2, 'Bb', 'Buh... as in Ball', 'Ball'),
  (3, 'Cc', 'Cuh... as in Cat', 'Cat'),
  (4, 'Dd', 'Duh... as in Dog', 'Dog'),
  (5, 'Ee', 'Eh... as in Elephant', 'Elephant'),
  (6, 'Ff', 'Fff... as in Fish', 'Fish'),
  (7, 'Gg', 'Guh... as in Garden', 'Garden'),
  (8, 'Hh', 'Huh... as in Hat', 'Hat'),
  (9, 'Ii', 'Ih... as in Igloo', 'Igloo'),
  (10, 'Jj', 'Juh... as in Jump', 'Jump'),
  (11, 'Kk', 'Kuh... as in Kite', 'Kite'),
  (12, 'Ll', 'Lll... as in Lion', 'Lion'),
  (13, 'Mm', 'Mmm... as in Moon', 'Moon'),
  (14, 'Nn', 'Nnn... as in Nest', 'Nest'),
  (15, 'Oo', 'Off... as in Orange', 'Orange'),
  (16, 'Pp', 'Puh... as in Pizza', 'Pizza'),
  (17, 'Qq', 'Kwuh... as in Queen', 'Queen'),
  (18, 'Rr', 'Rrr... as in Rain', 'Rain'),
  (19, 'Ss', 'Sss... as in Sun', 'Sun'),
  (20, 'Tt', 'Tuh... as in Tree', 'Tree'),
  (21, 'Uu', 'Uh... as in Umbrella', 'Umbrella'),
  (22, 'Vv', 'Vvv... as in Van', 'Van'),
  (23, 'Ww', 'Wuh... as in Water', 'Water'),
  (24, 'Xx', 'Ks... as in X-ray', 'X-ray'),
  (25, 'Yy', 'Yuh... as in Yawn', 'Yawn'),
  (26, 'Zz', 'Zzz... as in Zebra', 'Zebra'),
  (27, 'Sh', 'Shhh... as in Ship', 'Ship'),
  (28, 'Ch', 'Chuh... as in Chair', 'Chair'),
  (29, 'Th', 'Thhh... as in Thumb', 'Thumb'),
  (30, 'Ph', 'Fff... as in Phone', 'Phone'),
  (31, 'Wh', 'Www... as in Whale', 'Whale'),
  (32, 'Str', 'Struh... as in Street', 'Street'),
  (33, 'Spr', 'Spruh... as in Spring', 'Spring'),
  (34, 'Scr', 'Scruh... as in Scratch', 'Scratch'),
  (35, 'Thr', 'Thruuh... as in Three', 'Three'),
  (36, 'Spl', 'Spluh... as in Splash', 'Splash')
) AS v(sort_order, blend, speak_text, example_word)
WHERE p.sort_order = v.sort_order;

COMMENT ON TABLE public.phonics_blends IS 'Toddler phonic sound blends for /phonics route. blend uses Aa/Bb display; speak_text is phonetic for Web Speech API.';
