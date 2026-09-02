function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Проверка публичных env Supabase.
 * Без них сайт собирается и отдаёт пустые списки контента.
 */
export function getSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url: stripSlash(url), anonKey };
}

/**
 * URL, на который ходит сервер Timeweb Apps.
 * Если задан SUPABASE_INTERNAL_URL (IP сервера в РФ), браузер идёт на clubrv.ru,
 * а Node — напрямую на базу, минуя ТСПУ.
 */
export function getSupabaseBackendUrl(): string | null {
  const internal = process.env.SUPABASE_INTERNAL_URL?.trim();
  if (internal) {
    return stripSlash(internal);
  }
  return getSupabasePublicEnv()?.url ?? null;
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function getClubTimezone(): string {
  return process.env.CLUB_TIMEZONE?.trim() || "Europe/Moscow";
}

/**
 * Браузер и cookies используют clubrv.ru, а Node ходит на IP VPS.
 * Иначе имена cookie не совпадают и вход «принимается», но сессия не находится.
 */
export function supabaseInternalFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const publicUrl = getSupabasePublicEnv()?.url;
  const internal = process.env.SUPABASE_INTERNAL_URL?.trim().replace(/\/$/, "");
  if (!publicUrl || !internal) {
    return fetch(input, init);
  }

  const href =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;

  if (!href.startsWith(publicUrl)) {
    return fetch(input, init);
  }

  const rewritten = internal + href.slice(publicUrl.length);
  if (typeof input === "string" || input instanceof URL) {
    return fetch(rewritten, init);
  }
  return fetch(new Request(rewritten, input), init);
}
