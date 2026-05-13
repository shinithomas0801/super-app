import type { IntakeRow, UpdateIntakeInput } from "@/domain/education";
import { updateIntake } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function updateEducationIntakeUseCase(
  id: string,
  patch: UpdateIntakeInput
): Promise<IntakeRow> {
  return withEducationAdmin((supabase) => updateIntake(supabase, id, patch));
}
