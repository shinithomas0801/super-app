import type { AiRunSummary } from "@/domain/education";
import { fetchAiRunSummary } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function getEducationAiSummaryUseCase(): Promise<AiRunSummary> {
  return withEducationAdmin((supabase) => fetchAiRunSummary(supabase));
}
