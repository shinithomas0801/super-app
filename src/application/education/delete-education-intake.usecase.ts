import { deleteIntake } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationIntakeUseCase(id: string): Promise<void> {
  return withEducationAdmin((supabase) => deleteIntake(supabase, id));
}
