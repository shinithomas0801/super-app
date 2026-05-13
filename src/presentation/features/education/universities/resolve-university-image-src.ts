"use client";

import { getSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { EDUCATION_UNIVERSITY_IMAGES_BUCKET } from "@/infrastructure/supabase/education/education.constants";

/** Public URL for `<img src>` — full URLs unchanged; bucket paths use Supabase public URL. */
export function resolveUniversityImageSrc(file_path: string): string {
  const t = file_path.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  const { data } = getSupabaseBrowserClient()
    .storage.from(EDUCATION_UNIVERSITY_IMAGES_BUCKET)
    .getPublicUrl(t.replace(/^\/+/, ""));
  return data.publicUrl;
}
