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
