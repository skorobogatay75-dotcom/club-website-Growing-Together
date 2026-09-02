import { createClient } from "@supabase/supabase-js";
import { getSupabaseBackendUrl, getSupabasePublicEnv } from "./env";

/**
 * Service role — ТОЛЬКО сервер (API routes / server actions).
 * Никогда не импортировать в Client Components.
 */
export function createSupabaseServiceClient() {
  const env = getSupabasePublicEnv();
  const backendUrl = getSupabaseBackendUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!env || !backendUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase service role env is missing. Set URL, anon key, and SUPABASE_SERVICE_ROLE_KEY on the server.",
    );
  }

  if (serviceRoleKey.startsWith("eyJ") === false && serviceRoleKey.length < 20) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY looks invalid.");
  }

  return createClient(backendUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
