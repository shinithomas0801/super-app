/**
 * Browser-safe exports only. For server helpers import explicitly:
 * - `@/infrastructure/supabase/server-client`
 */
export {
  getPublicSupabaseEnv,
  getSupabaseStorageEnv,
  getDatabaseUrl,
  type PublicSupabaseEnv,
  type SupabaseStorageEnv,
} from "./supabase-env";
export { getSupabaseBrowserClient } from "./browser-client";
