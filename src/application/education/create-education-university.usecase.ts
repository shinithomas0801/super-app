import type { CreateUniversityInput, UniversityRow } from "@/domain/education";
import { createUniversity } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationUniversityUseCase(
  payload: CreateUniversityInput
): Promise<UniversityRow> {
  return withEducationAdmin((supabase) => createUniversity(supabase, payload));
}
