import type { CountryRow } from "@/domain/education";
import { listCountriesForAdmin } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "../with-education-admin";

export async function listEducationCountriesUseCase(): Promise<CountryRow[]> {
  return withEducationAdmin((supabase) => listCountriesForAdmin(supabase));
}
