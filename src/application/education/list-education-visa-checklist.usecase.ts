import type { VisaChecklistRow } from "@/domain/education";
import { listVisaChecklistItems } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationVisaChecklistUseCase(): Promise<
  VisaChecklistRow[]
> {
  return withEducationAdmin((supabase) => listVisaChecklistItems(supabase));
}
