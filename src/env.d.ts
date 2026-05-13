declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_SECRET_KEY?: string;
    DATABASE_URL?: string;
    SUPABASE_STORAGE_URL?: string;
    SUPABASE_STORAGE_ACCESS_KEY?: string;
    SUPABASE_STORAGE_SECRET_KEY?: string;
    SUPABASE_STORAGE_REGION?: string;
  }
}
