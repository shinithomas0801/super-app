import type { CountryRow, CreateCountryInput } from "@/domain/education";
import { createCountry } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "../with-education-admin";

export async function createEducationCountryUseCase(
  payload: CreateCountryInput
): Promise<CountryRow> {
  return withEducationAdmin((supabase) => createCountry(supabase, payload));
}
