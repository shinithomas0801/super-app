import type { UniversityRow } from "@/domain/education";
import { listUniversities } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationUniversitiesUseCase(): Promise<
  UniversityRow[]
> {
  return withEducationAdmin((supabase) => listUniversities(supabase));
}
