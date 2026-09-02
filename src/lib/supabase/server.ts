import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseBackendUrl, getSupabasePublicEnv } from "./env";

/**
 * Серверный клиент с anon key + cookies (уважает RLS).
 * Возвращает null, если env не заданы — удобно для локальной вёрстки без БД.
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  const backendUrl = getSupabaseBackendUrl();
  if (!env || !backendUrl) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(backendUrl, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Вызов из Server Component без мутации cookies — безопасно игнорировать.
        }
      },
    },
  });
}
