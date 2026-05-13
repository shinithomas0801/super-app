import type { EducationDashboardCounts } from "@/domain/education";
import { fetchEducationDashboardCounts } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function getEducationDashboardUseCase(): Promise<EducationDashboardCounts> {
  return withEducationAdmin((supabase) => fetchEducationDashboardCounts(supabase));
}
