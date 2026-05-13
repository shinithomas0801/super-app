/**
 * Typed accessors for Supabase-related environment variables.
 * Keeps env parsing in one place (single responsibility); callers receive validated values.
 */

export interface PublicSupabaseEnv {
  url: string;
  publishableKey: string;
}

export interface SupabaseStorageEnv {
  url: string;
  accessKey: string;
  secretKey: string;
  region: string;
}

let cachedPublic: PublicSupabaseEnv | null = null;

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (cachedPublic) return cachedPublic;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  cachedPublic = { url, publishableKey };
  return cachedPublic;
}

/** Server-only secret key for admin/service operations. Never import from client components. */
export function getSupabaseSecretKey(): string {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("Missing SUPABASE_SECRET_KEY");
  }
  return secret;
}

/** Optional: S3-compatible storage endpoint for server-side tooling (e.g. AWS SDK). */
export function getSupabaseStorageEnv(): SupabaseStorageEnv | null {
  const url = process.env.SUPABASE_STORAGE_URL?.trim();
  const accessKey = process.env.SUPABASE_STORAGE_ACCESS_KEY?.trim();
  const secretKey = process.env.SUPABASE_STORAGE_SECRET_KEY?.trim();
  const region = process.env.SUPABASE_STORAGE_REGION?.trim();

  if (!url || !accessKey || !secretKey || !region) return null;

  return { url, accessKey, secretKey, region };
}

/** Optional: direct Postgres URL for migrations or scripts outside Supabase client. */
export function getDatabaseUrl(): string | null {
  const db = process.env.DATABASE_URL?.trim();
  return db ?? null;
}
