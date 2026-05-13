import type { CreateIntakeInput, IntakeRow } from "@/domain/education";
import { createIntake } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationIntakeUseCase(
  payload: CreateIntakeInput
): Promise<IntakeRow> {
  return withEducationAdmin((supabase) => createIntake(supabase, payload));
}
