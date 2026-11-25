-- Fix Supabase advisory: "Clients can list all files in this bucket"
-- Public buckets serve files via /storage/v1/object/public/<bucket>/<path>
-- and do NOT need a broad SELECT policy on storage.objects (that enables listing).
-- Keep admin write policies so the dashboard / service role can manage uploads.

DROP POLICY IF EXISTS phonics_media_public_read ON storage.objects;
DROP POLICY IF EXISTS "brand_ads_storage_public_read" ON storage.objects;

-- Ensure buckets stay public for CDN URLs
UPDATE storage.buckets
SET public = TRUE
WHERE id IN ('phonics', 'brand-ads', 'story-animations', 'worksheets', 'puzzle-stills', 'flashcards', 'verbs', 'colour-board');
