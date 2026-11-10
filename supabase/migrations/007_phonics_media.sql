-- Phonics 3D media: public bucket + URL columns
-- Run after 004_phonics_table.sql
-- Upload objects only after a card is approved (A1 first).

ALTER TABLE public.phonics_blends
  ADD COLUMN IF NOT EXISTS variant_id TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

CREATE INDEX IF NOT EXISTS idx_phonics_blends_variant
  ON public.phonics_blends(variant_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('phonics', 'phonics', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS phonics_media_public_read ON storage.objects;
CREATE POLICY phonics_media_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'phonics');

DROP POLICY IF EXISTS phonics_media_admin_write ON storage.objects;
CREATE POLICY phonics_media_admin_write ON storage.objects
  FOR ALL USING (bucket_id = 'phonics' AND public.is_admin())
  WITH CHECK (bucket_id = 'phonics' AND public.is_admin());

COMMENT ON COLUMN public.phonics_blends.variant_id IS 'Catalog code such as A1 (schema id a1_apple).';
COMMENT ON COLUMN public.phonics_blends.video_url IS 'Public URL in the phonics storage bucket.';
COMMENT ON COLUMN public.phonics_blends.audio_url IS 'Public ElevenLabs MP3 URL in the phonics storage bucket.';
