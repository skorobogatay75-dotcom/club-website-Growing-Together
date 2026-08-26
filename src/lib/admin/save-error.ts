/** Человекочитаемая ошибка сохранения для админки. */
export function adminSaveErrorMessage(error: { message?: string } | null): string {
  const raw = error?.message?.trim() ?? "";
  if (!raw) return "Не удалось сохранить. Попробуйте ещё раз.";

  if (/column .*age_text.* does not exist/i.test(raw)) {
    return "В базе нет колонки age_text. Выполните SQL из supabase/ensure-age-text-columns.sql в Supabase → SQL Editor, затем Project Settings → API → Reload schema cache.";
  }

  if (/schema cache/i.test(raw)) {
    return `${raw} Обновите кэш схемы: Supabase → Project Settings → API → Reload schema cache.`;
  }

  return raw.length > 180 ? `${raw.slice(0, 177)}…` : raw;
}

export function adminSaveErrorParam(error: { message?: string } | null): string {
  return encodeURIComponent(adminSaveErrorMessage(error));
}
