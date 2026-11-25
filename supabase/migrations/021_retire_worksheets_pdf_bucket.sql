-- Retire legacy `worksheets-pdf` bucket. App uses only public `worksheets`
-- with age/category paths (age-2-4/math/…, age-4-6/…, age-6-9/…).

INSERT INTO storage.buckets (id, name, public)
VALUES ('worksheets', 'worksheets', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Remove objects + bucket for the old name (safe if already gone)
-- Skipped (blocked by storage.protect_delete): DELETE FROM storage.objects WHERE bucket_id = 'worksheets-pdf';
-- Skipped (blocked by storage.protect_delete): DELETE FROM storage.buckets WHERE id = 'worksheets-pdf';
