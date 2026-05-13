import type { SupabaseClient } from "@supabase/supabase-js";
import { EducationAccessError } from "@/domain/education";

export async function requireEducationAdmin(
  supabase: SupabaseClient
): Promise<{ userId: string }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new EducationAccessError(
      "Authentication required for education admin."
    );
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    throw new EducationAccessError(
      "Your account is not registered as an education admin. Ask a super-admin to add your user ID to admin_users."
    );
  }

  return { userId: user.id };
}
