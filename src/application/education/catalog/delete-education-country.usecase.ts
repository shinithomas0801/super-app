import { deleteCountry } from "@/infrastructure/supabase/education/education.repository";
import { withEducationAdmin } from "../with-education-admin";

export async function deleteEducationCountryUseCase(id: string): Promise<void> {
  return withEducationAdmin((supabase) => deleteCountry(supabase, id));
}
