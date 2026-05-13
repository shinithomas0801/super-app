import type { ApplicationRow } from "@/domain/education";
import { listApplications } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationApplicationsUseCase(): Promise<
  ApplicationRow[]
> {
  return withEducationAdmin((supabase) => listApplications(supabase));
}
