-- Storage bucket + policies for university image uploads.
-- education_module.is_education_module_admin and university_images table come from earlier migrations.

INSERT INTO storage.buckets (id, name, public)
VALUES ('university_images', 'university_images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "university_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "university_images_update" ON storage.objects;
DROP POLICY IF EXISTS "university_images_delete" ON storage.objects;

CREATE POLICY "university_images_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'university_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "university_images_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'university_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
)
WITH CHECK (
  bucket_id = 'university_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "university_images_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'university_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
