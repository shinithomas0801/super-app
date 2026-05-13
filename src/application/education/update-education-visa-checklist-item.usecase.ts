import type {
  UpdateVisaChecklistInput,
  VisaChecklistRow,
} from "@/domain/education";
import { updateVisaChecklistItem } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function updateEducationVisaChecklistItemUseCase(
  id: string,
  patch: UpdateVisaChecklistInput
): Promise<VisaChecklistRow> {
  return withEducationAdmin((supabase) =>
    updateVisaChecklistItem(supabase, id, patch)
  );
}
