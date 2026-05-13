import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server-client";
import { requireEducationAdmin } from "@/infrastructure/supabase/education/education-admin";

export async function withEducationAdmin<T>(
  run: (supabase: SupabaseClient) => Promise<T>
): Promise<T> {
  const supabase = await createSupabaseServerClient();
  await requireEducationAdmin(supabase);
  return run(supabase);
}
