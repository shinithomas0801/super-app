import type { CostBenchmarkRow } from "@/domain/education";
import { listCostBenchmarks } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationCostBenchmarksUseCase(): Promise<
  CostBenchmarkRow[]
> {
  return withEducationAdmin((supabase) => listCostBenchmarks(supabase));
}
