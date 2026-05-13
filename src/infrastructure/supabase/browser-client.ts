"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./supabase-env";

let browserClient: SupabaseClient | undefined;

/**
 * Browser singleton — avoids multiple GoTrue clients during HMR and navigation.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getPublicSupabaseEnv();
  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
