import type {
  CreateVisaChecklistInput,
  VisaChecklistRow,
} from "@/domain/education";
import { createVisaChecklistItem } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationVisaChecklistItemUseCase(
  payload: CreateVisaChecklistInput
): Promise<VisaChecklistRow> {
  return withEducationAdmin((supabase) =>
    createVisaChecklistItem(supabase, payload)
  );
}
