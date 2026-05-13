import type { CourseRow, UpdateCourseInput } from "@/domain/education";
import { updateCourse } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function updateEducationCourseUseCase(
  id: string,
  patch: UpdateCourseInput
): Promise<CourseRow> {
  return withEducationAdmin((supabase) => updateCourse(supabase, id, patch));
}
