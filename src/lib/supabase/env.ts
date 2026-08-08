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

  return { url, anonKey };
}

export function hasSupabasePublicEnv(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function getClubTimezone(): string {
  return process.env.CLUB_TIMEZONE?.trim() || "Europe/Moscow";
}
