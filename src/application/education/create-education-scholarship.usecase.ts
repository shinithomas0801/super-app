import type {
  CreateScholarshipInput,
  ScholarshipRow,
} from "@/domain/education";
import { createScholarship } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function createEducationScholarshipUseCase(
  payload: CreateScholarshipInput
): Promise<ScholarshipRow> {
  return withEducationAdmin((supabase) => createScholarship(supabase, payload));
}
