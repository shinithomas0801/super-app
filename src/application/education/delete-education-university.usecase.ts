import { deleteUniversity } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationUniversityUseCase(id: string): Promise<void> {
  return withEducationAdmin((supabase) => deleteUniversity(supabase, id));
}
