import type { IntakeRow } from "@/domain/education";
import { listIntakes } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationIntakesUseCase(): Promise<IntakeRow[]> {
  return withEducationAdmin((supabase) => listIntakes(supabase));
}
