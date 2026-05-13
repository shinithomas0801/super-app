import type { CourseRow, CreateCourseInput } from "@/domain/education";
import { createCourse } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationCourseUseCase(
  payload: CreateCourseInput
): Promise<CourseRow> {
  return withEducationAdmin((supabase) => createCourse(supabase, payload));
}
