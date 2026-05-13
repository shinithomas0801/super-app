import type { ExamScoreRow } from "@/domain/education";
import { listExamScores } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationExamScoresUseCase(): Promise<
  ExamScoreRow[]
> {
  return withEducationAdmin((supabase) => listExamScores(supabase));
}
