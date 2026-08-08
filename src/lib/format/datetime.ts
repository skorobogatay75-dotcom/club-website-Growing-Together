import { getClubTimezone } from "@/lib/supabase/env";

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(options: Intl.DateTimeFormatOptions) {
  const timeZone = getClubTimezone();
  const key = `${timeZone}:${JSON.stringify(options)}`;
  let formatter = dateFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("ru-RU", { timeZone, ...options });
    dateFormatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatEventDate(iso: string): string {
  return getFormatter({
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string): string {
  return getFormatter({
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatEventDateTime(iso: string): string {
  return getFormatter({
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatNewsDate(iso: string | null): string | null {
  if (!iso) return null;
  return getFormatter({
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
