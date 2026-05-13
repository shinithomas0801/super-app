import { deleteScholarship } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationScholarshipUseCase(
  id: string
): Promise<void> {
  return withEducationAdmin((supabase) => deleteScholarship(supabase, id));
}
