-- Storage bucket + policies for course image uploads (education_module.course_images).

INSERT INTO storage.buckets (id, name, public)
VALUES ('course_images', 'course_images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "course_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "course_images_update" ON storage.objects;
DROP POLICY IF EXISTS "course_images_delete" ON storage.objects;

CREATE POLICY "course_images_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "course_images_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
)
WITH CHECK (
  bucket_id = 'course_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);

CREATE POLICY "course_images_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course_images'
  AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
