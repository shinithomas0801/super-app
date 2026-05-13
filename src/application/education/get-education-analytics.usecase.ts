import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationStatus } from "@/domain/education";
import { fetchEducationDashboardCounts } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

async function countByApplicationStatus(
  supabase: SupabaseClient,
  status: ApplicationStatus
): Promise<number> {
  const { count, error } = await supabase
    .from("education_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export type EducationAnalytics = {
  dashboard: Awaited<ReturnType<typeof fetchEducationDashboardCounts>>;
  applicationsByStatus: Record<ApplicationStatus, number>;
};

export async function getEducationAnalyticsUseCase(): Promise<EducationAnalytics> {
  return withEducationAdmin(async (supabase) => {
    const statuses: ApplicationStatus[] = [
      "draft",
      "submitted",
      "under_review",
      "accepted",
      "rejected",
      "withdrawn",
    ];
    const [dashboard, ...counts] = await Promise.all([
      fetchEducationDashboardCounts(supabase),
      ...statuses.map((s) => countByApplicationStatus(supabase, s)),
    ]);
    const applicationsByStatus = Object.fromEntries(
      statuses.map((s, i) => [s, counts[i]])
    ) as Record<ApplicationStatus, number>;
    return { dashboard, applicationsByStatus };
  });
}
