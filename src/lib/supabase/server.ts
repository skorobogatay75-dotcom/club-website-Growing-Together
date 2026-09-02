import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv, supabaseInternalFetch } from "./env";

/**
 * Серверный клиент с anon key + cookies (уважает RLS).
 * Возвращает null, если env не заданы — удобно для локальной вёрстки без БД.
 */
export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    global: { fetch: supabaseInternalFetch },
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
