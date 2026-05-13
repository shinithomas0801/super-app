import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "./supabase-env";

/**
 * Server Components, Route Handlers, Server Actions — uses cookie-backed session.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only; middleware refreshes session.
        }
      },
    },
  });
}
