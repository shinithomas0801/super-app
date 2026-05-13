import type { ScholarshipRow } from "@/domain/education";
import { listScholarships } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationScholarshipsUseCase(): Promise<
  ScholarshipRow[]
> {
  return withEducationAdmin((supabase) => listScholarships(supabase));
}
