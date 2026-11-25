-- Shop products + printable worksheets taxonomy (Prompt K / worksheets age folders)

-- 1. Physical shop products (admin CRUD; ParentShop can later prefer DB)
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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

INSERT INTO public.shop_products (slug, title, category, price_pkr, blurb, sort_order)
VALUES
  ('wood-abc', 'Soft Wooden ABC Blocks', 'wooden', 1800, 'Chunky pastel letters for tiny hands.', 10),
  ('wood-shapes', 'Rainbow Shape Sorter', 'wooden', 2200, 'Calm colors, quiet clicks, big smiles.', 20),
  ('wb-math', '50-Page Early Math Book', 'workbooks', 150, 'Counting & tracing pages for home practice.', 30),
  ('wb-noun', '50-Page Noun Matching Book', 'workbooks', 150, 'Picture matching for speech practice.', 40),
  ('kit-calm', 'Calm Sensory Kit', 'sensory', 3500, 'Soft textures, fidget tools, quiet play.', 50)
ON CONFLICT (slug) DO NOTHING;

-- 2. Printable worksheets metadata (age_group + category taxonomy)
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
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

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
