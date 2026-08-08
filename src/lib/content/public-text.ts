/**
 * Публичный текст: скрываем пустые и служебные «НУЖНО ЗАПОЛНИТЬ».
 */
export function isPublicText(value: string | null | undefined): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/нужно\s+заполнить/i.test(trimmed)) return false;
  return true;
}

export function publicTextOrNull(
  value: string | null | undefined,
): string | null {
  return isPublicText(value) ? value.trim() : null;
}
