import { deleteVisaChecklistItem } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function deleteEducationVisaChecklistItemUseCase(
  id: string
): Promise<void> {
  return withEducationAdmin((supabase) =>
    deleteVisaChecklistItem(supabase, id)
  );
}
