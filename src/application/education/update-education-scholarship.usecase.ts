import type {
  ScholarshipRow,
  UpdateScholarshipInput,
} from "@/domain/education";
import { updateScholarship } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function updateEducationScholarshipUseCase(
  id: string,
  patch: UpdateScholarshipInput
): Promise<ScholarshipRow> {
  return withEducationAdmin((supabase) =>
    updateScholarship(supabase, id, patch)
  );
}
