import type { StudentProfileRow } from "@/domain/education";
import { listStudentProfiles } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationStudentsUseCase(): Promise<
  StudentProfileRow[]
> {
  return withEducationAdmin((supabase) => listStudentProfiles(supabase));
}
