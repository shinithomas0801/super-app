import type { CourseImageRow } from "@/domain/education";
import { insertCourseImage } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationCourseImageUseCase(
  courseId: string,
  filePath: string
): Promise<CourseImageRow> {
  return withEducationAdmin((supabase) =>
    insertCourseImage(supabase, courseId, filePath)
  );
}
