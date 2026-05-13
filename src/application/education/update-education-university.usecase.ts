import type { UniversityRow, UpdateUniversityInput } from "@/domain/education";
import { updateUniversity } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function updateEducationUniversityUseCase(
  id: string,
  patch: UpdateUniversityInput
): Promise<UniversityRow> {
  return withEducationAdmin((supabase) => updateUniversity(supabase, id, patch));
}
