import { deleteCourse } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationCourseUseCase(id: string): Promise<void> {
  return withEducationAdmin((supabase) => deleteCourse(supabase, id));
}
