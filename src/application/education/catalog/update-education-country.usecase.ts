import type { CountryRow, CreateCountryInput } from "@/domain/education";
import { updateCountry } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "../with-education-admin";

export async function updateEducationCountryUseCase(
  id: string,
  payload: Partial<CreateCountryInput> & { sort_order?: number }
): Promise<CountryRow> {
  return withEducationAdmin((supabase) => updateCountry(supabase, id, payload));
}
