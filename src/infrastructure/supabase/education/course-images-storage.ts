import type { SupabaseClient } from "@supabase/supabase-js";
import { EDUCATION_COURSE_IMAGES_BUCKET } from "./education.constants";

export function storageObjectPathFromStoredCourseFilePath(
  file_path: string
): string | null {
  const trimmed = file_path.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return trimmed.replace(/^\/+/, "");
  }
  const marker = `/object/public/${EDUCATION_COURSE_IMAGES_BUCKET}/`;
  const idx = trimmed.indexOf(marker);
  if (idx === -1) return null;
  const path = trimmed.slice(idx + marker.length).split("?")[0];
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export async function removeCourseImageFromBucket(
  client: SupabaseClient,
  file_path: string
): Promise<void> {
  const path = storageObjectPathFromStoredCourseFilePath(file_path);
  if (!path) return;
  const { error } = await client.storage
    .from(EDUCATION_COURSE_IMAGES_BUCKET)
    .remove([path]);
  if (error) {
    console.warn("[course_images] storage remove failed:", error.message);
  }
}
