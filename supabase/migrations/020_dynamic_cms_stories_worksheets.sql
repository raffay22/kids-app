-- =============================================================================
-- GROWVA JUNIOR — DYNAMIC CMS MIGRATION (Worksheets Storage + Bedtime & Toddler Stories)
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

-- =============================================================================
-- 1. WORKSHEETS STORAGE BUCKET & OPTIONAL PUBLIC URL COLUMN
-- =============================================================================
ALTER TABLE IF EXISTS public.printable_worksheets
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worksheets',
  'worksheets',
  TRUE,
  15728640, -- 15 MB strict safeguard
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "worksheets_storage_public_read" ON storage.objects;
CREATE POLICY "worksheets_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'worksheets');

DROP POLICY IF EXISTS "worksheets_storage_admin_write" ON storage.objects;
CREATE POLICY "worksheets_storage_admin_write"
  ON storage.objects FOR ALL
  USING (bucket_id = 'worksheets' AND public.is_admin())
  WITH CHECK (bucket_id = 'worksheets' AND public.is_admin());

-- =============================================================================
-- 2. BEDTIME STORIES TABLE (Dynamic YouTube CMS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bedtime_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_number INTEGER NOT NULL UNIQUE,
  story_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  moral_lesson TEXT,
  theme TEXT NOT NULL DEFAULT 'kindness',
  blurb TEXT,
  cover_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bedtime_stories_active_num_idx
  ON public.bedtime_stories (is_active, story_number ASC);

ALTER TABLE public.bedtime_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bedtime_stories_public_read" ON public.bedtime_stories;
CREATE POLICY "bedtime_stories_public_read"
  ON public.bedtime_stories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "bedtime_stories_admin_all" ON public.bedtime_stories;
CREATE POLICY "bedtime_stories_admin_all"
  ON public.bedtime_stories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed existing 18 Bedtime Stories
INSERT INTO public.bedtime_stories
  (story_number, story_id, title, youtube_id, moral_lesson, theme, blurb, cover_image, is_active)
VALUES
  (1, 'story_moral_01', 'Prince Leo''s Kind Crown', 'y1Vx3jwFUOo', 'A kind heart is the brightest crown you can ever wear!', 'kindness', 'A sweet bedtime tale about sharing kindness.', 'https://img.youtube.com/vi/y1Vx3jwFUOo/hqdefault.jpg', TRUE),
  (2, 'story_moral_02', 'Barnaby Bear and the Big Shared Umbrella', 'r2K9GkEjH78', 'Sharing with friends makes even the rainiest day bright and sunny!', 'sharing', 'A rainy-day bedtime tale about sharing with friends.', 'https://img.youtube.com/vi/r2K9GkEjH78/hqdefault.jpg', TRUE),
  (3, 'story_moral_03', 'Milo the Monkey and the Truth Tree', 'k_mqBrGPJiA', 'Always tell the truth! Honesty builds trust and makes your heart shine!', 'honesty', 'A jungle bedtime tale about telling the truth.', 'https://img.youtube.com/vi/k_mqBrGPJiA/hqdefault.jpg', TRUE),
  (4, 'story_moral_04', 'Dottie Dolphin and the Clean Reef', 'b0eglcTgVHM', 'When we work together to keep our environment clean, everybody wins!', 'teamwork', 'An ocean bedtime tale about cleaning up together.', 'https://img.youtube.com/vi/b0eglcTgVHM/hqdefault.jpg', TRUE),
  (5, 'story_moral_05', 'Pip the Little Penguin''s Patience Tower', 'fOqZT6Q9dKw', 'Patience and trying again turn mistakes into magic!', 'patience', 'An Arctic bedtime tale about patience and trying again.', 'https://img.youtube.com/vi/fOqZT6Q9dKw/hqdefault.jpg', TRUE),
  (6, 'story_moral_06', 'Bella Butterfly and the Magic Words', '7B-1XdDymGo', 'Magic words like Please and Thank You open every heart!', 'manners', 'A meadow bedtime tale about please and thank you.', 'https://img.youtube.com/vi/7B-1XdDymGo/hqdefault.jpg', TRUE),
  (7, 'story_moral_07', 'Leo the Little Lion''s Brave Night', '865120l3pzE', 'Being brave means looking closer—fear fades when light shines!', 'bravery', 'A starry bedtime tale about being brave in the dark.', 'https://img.youtube.com/vi/865120l3pzE/hqdefault.jpg', TRUE),
  (8, 'story_moral_08', 'Little Joey Cares for Mom', 'mgPDYgpoQ6A', 'Caring for your mother brings the sweetest love to your heart!', 'caring', 'A bush-meadow bedtime tale about caring for Mom.', 'https://img.youtube.com/vi/mgPDYgpoQ6A/hqdefault.jpg', TRUE),
  (9, 'story_moral_09', 'Sammy Squirrel''s Tidy Toy Box', 'J1KWK9hlUF0', 'Cleaning up your toys after play keeps your room happy, safe, and tidy!', 'cleanliness', 'A treehouse bedtime tale about cleaning up after play.', 'https://img.youtube.com/vi/J1KWK9hlUF0/hqdefault.jpg', TRUE),
  (10, 'story_moral_10', 'Oliver Owl and the Glowing Starlight', 'WwTN506JXZE', 'Gentle curiosity turns nighttime shadows into wonderful discoveries!', 'curiosity', 'A forest bedtime tale about starry curiosity.', 'https://img.youtube.com/vi/WwTN506JXZE/hqdefault.jpg', TRUE),
  (11, 'story_moral_11', 'Toby Turtle''s Fresh Morning Routine', 'qlA46OinXPA', 'Healthy daily habits help you start every morning feeling strong and bright!', 'habits', 'A sunny tale about fresh morning routines.', 'https://img.youtube.com/vi/qlA46OinXPA/hqdefault.jpg', TRUE),
  (12, 'story_moral_12', 'Kiki Koala and the Magic Paintbrush', 'Ll-NUHmgt_k', 'Imagination and creativity bring joyful colors to every friend around you!', 'creativity', 'A eucalyptus bedtime tale about creativity.', 'https://img.youtube.com/vi/Ll-NUHmgt_k/hqdefault.jpg', TRUE),
  (13, 'story_moral_13', 'Benny Beaver and the River Bridge', 'K8dvAabz21w', 'Helping each other build bridges makes every challenge easier together!', 'helping', 'A river bedtime tale about helping friends.', 'https://img.youtube.com/vi/K8dvAabz21w/hqdefault.jpg', TRUE),
  (14, 'story_moral_14', 'Penny Panda''s Clean Hands Song', '3eNA7PqwnQw', 'Washing your hands keeps germs away and keeps playtime happy and healthy!', 'hygiene', 'A bamboo forest tale about clean hands.', 'https://img.youtube.com/vi/3eNA7PqwnQw/hqdefault.jpg', TRUE),
  (15, 'story_moral_15', 'Fiona Fox and the Dancing Cloud Shapes', 'hLUrwxKd22U', 'Pausing to wonder at the sky fills your mind with calm imagination!', 'wonder', 'A dreamy bedtime tale about cloud shapes.', 'https://img.youtube.com/vi/hLUrwxKd22U/hqdefault.jpg', TRUE),
  (16, 'story_moral_16', 'Milo the Elephant''s Surprise for Grandma', 'AjV24AfVn_0', 'Thoughtful surprises show our elders how deeply we love them!', 'family', 'A heartwarming tale about loving Grandma.', 'https://img.youtube.com/vi/AjV24AfVn_0/hqdefault.jpg', TRUE),
  (17, 'story_moral_17', 'Zack Zebra''s Fair Share Snack', 'EZmrw3qtr8M', 'Sharing your treats fairly with friends turns a simple snack into sweet joy!', 'sharing', 'A savannah bedtime tale about fair sharing with friends.', 'https://img.youtube.com/vi/EZmrw3qtr8M/hqdefault.jpg', TRUE),
  (18, 'story_moral_18', 'Luna Dragon''s Moon Lullaby', 'VliWbYW_wDM', 'Sweet dreams filled with peaceful starlight and cozy night wonder.', 'bedtime', 'A starry bedtime lullaby with Luna Dragon and the moon.', 'https://img.youtube.com/vi/VliWbYW_wDM/hqdefault.jpg', TRUE)
ON CONFLICT (story_id) DO NOTHING;

-- =============================================================================
-- 3. TODDLER STORIES TABLE (Dynamic Supabase Storage Video CMS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.toddler_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'adventure',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  narrative_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS toddler_stories_active_sort_idx
  ON public.toddler_stories (is_active, sort_order ASC, created_at ASC);

ALTER TABLE public.toddler_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "toddler_stories_public_read" ON public.toddler_stories;
CREATE POLICY "toddler_stories_public_read"
  ON public.toddler_stories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "toddler_stories_admin_all" ON public.toddler_stories;
CREATE POLICY "toddler_stories_admin_all"
  ON public.toddler_stories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
