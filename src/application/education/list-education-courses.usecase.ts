import type { CourseRow } from "@/domain/education";
import { listCourses } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationCoursesUseCase(): Promise<CourseRow[]> {
  return withEducationAdmin((supabase) => listCourses(supabase));
}
