import type { EligibilityRulesetRow } from "@/domain/education";
import { listEligibilityRulesets } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "./with-education-admin";

export async function listEducationEligibilityRulesetsUseCase(): Promise<
  EligibilityRulesetRow[]
> {
  return withEducationAdmin((supabase) => listEligibilityRulesets(supabase));
}
