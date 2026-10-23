-- Storage lock for Flower Room:
-- Public can VIEW product photos. Only service_role (admin server) can upload/delete/replace.
-- Run with: psql "$DIRECT_URL" -f scripts/lock-storage-policies.sql

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public read uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Intentionally no INSERT / UPDATE / DELETE policies for anon or authenticated.
-- service_role bypasses RLS so /api/admin/upload still works.
