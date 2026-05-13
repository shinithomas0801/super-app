"use client";

import { getSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { EDUCATION_COURSE_IMAGES_BUCKET } from "@/infrastructure/supabase/education/education.constants";

export function resolveCourseImageSrc(file_path: string): string {
  const t = file_path.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const { data } = getSupabaseBrowserClient()
    .storage.from(EDUCATION_COURSE_IMAGES_BUCKET)
    .getPublicUrl(t.replace(/^\/+/, ""));
  return data.publicUrl;
}
