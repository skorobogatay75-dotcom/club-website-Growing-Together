import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

/**
 * Браузерный клиент (формы/админка на следующих этапах).
 */
export function createSupabaseBrowserClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      "Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(env.url, env.anonKey);
}
