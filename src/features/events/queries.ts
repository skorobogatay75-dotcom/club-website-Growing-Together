import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getClubTimezone } from "@/lib/supabase/env";
import {
  buildMonthGrid,
  dateKeyInTimeZone,
  monthRangeUtcIso,
} from "@/features/events/calendar-math";
import { isPublicText } from "@/lib/content/public-text";
import type {
  AgeCategory,
  AudienceType,
  Event,
  EventFormat,
} from "@/types/database";

export type AgeCategoryRef = Pick<AgeCategory, "id" | "name" | "slug" | "color_token">;

export type CalendarEvent = Pick<
  Event,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "starts_at"
  | "ends_at"
  | "timezone"
  | "venue"
  | "price_text"
  | "capacity"
  | "registration_status"
  | "audience_type"
  | "format"
  | "age_category_id"
  | "age_text"
  | "status"
> & {
  age_categories: Pick<AgeCategory, "name" | "slug" | "color_token"> | null;
};

export type EventFilters = {
  age?: string;
  audience?: AudienceType | "";
  format?: EventFormat | "";
};

function normalizeAgeCategory(
  value:
    | Pick<AgeCategory, "name" | "slug" | "color_token">
    | Pick<AgeCategory, "name" | "slug" | "color_token">[]
    | null
    | undefined,
) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/** Возраст события: свой текст или старая категория. */
export function eventAgeLabel(event: {
  age_text?: string | null;
  age_categories?: { name?: string | null } | null;
}): string | null {
  if (isPublicText(event.age_text)) return event.age_text.trim();
  const name = event.age_categories?.name;
  return isPublicText(name) ? name.trim() : null;
}

export async function getActiveAgeCategories(): Promise<AgeCategoryRef[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("age_categories")
    .select("id, name, slug, color_token")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getActiveAgeCategories failed");
    return [];
  }

  return (data ?? []) as AgeCategoryRef[];
}

export async function listEventAgeFilterOptions(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("age_text, age_categories ( name )")
    .eq("status", "published");

  if (error) {
    console.error("listEventAgeFilterOptions failed");
    return [];
  }

  const labels = new Set<string>();
  for (const row of data ?? []) {
    const label = eventAgeLabel({
      age_text: (row as { age_text?: string | null }).age_text,
      age_categories: normalizeAgeCategory(
        (row as { age_categories?: unknown }).age_categories as
          | Pick<AgeCategory, "name" | "slug" | "color_token">
          | Pick<AgeCategory, "name" | "slug" | "color_token">[]
          | null,
      ),
    });
    if (label) labels.add(label);
  }
  return Array.from(labels).sort((a, b) => a.localeCompare(b, "ru"));
}

export async function getPublishedEventsInRange(options: {
  year: number;
  month: number;
  filters?: EventFilters;
}): Promise<{
  events: CalendarEvent[];
  grid: ReturnType<typeof buildMonthGrid>;
  error: string | null;
}> {
  const timeZone = getClubTimezone();
  const grid = buildMonthGrid(options.year, options.month);
  const { startIso, endIso } = monthRangeUtcIso(
    grid.rangeStart,
    grid.rangeEnd,
    timeZone,
  );

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { events: [], grid, error: null };
  }

  let query = supabase
    .from("events")
    .select(
      "id, title, slug, excerpt, starts_at, ends_at, timezone, venue, price_text, capacity, registration_status, audience_type, format, age_category_id, age_text, status, age_categories ( name, slug, color_token )",
    )
    .eq("status", "published")
    .lte("starts_at", endIso)
    .gte("ends_at", startIso)
    .order("starts_at", { ascending: true });

  if (options.filters?.audience) {
    query = query.eq("audience_type", options.filters.audience);
  }

  if (options.filters?.format) {
    query = query.eq("format", options.filters.format);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedEventsInRange failed");
    return {
      events: [],
      grid,
      error: "Не удалось загрузить события. Попробуйте обновить страницу.",
    };
  }

  let events = (
    (data ?? []) as unknown as Array<CalendarEvent & { age_categories?: unknown }>
  ).map((row) => ({
    ...row,
    age_categories: normalizeAgeCategory(
      row.age_categories as
        | Pick<AgeCategory, "name" | "slug" | "color_token">
        | Pick<AgeCategory, "name" | "slug" | "color_token">[]
        | null,
    ),
  }));

  if (options.filters?.age) {
    const ageFilter = options.filters.age.trim().toLowerCase();
    events = events.filter((event) => {
      const label = eventAgeLabel(event);
      return label?.toLowerCase().includes(ageFilter) ?? false;
    });
  }

  return { events, grid, error: null };
}

export function groupEventsByDateKey(
  events: CalendarEvent[],
  timeZone = getClubTimezone(),
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = dateKeyInTimeZone(event.starts_at, timeZone);
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }
  return map;
}

export async function getNearestUpcomingEventSlug(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("slug")
    .eq("status", "published")
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getNearestUpcomingEventSlug failed");
    return null;
  }

  return data?.slug ?? null;
}

export async function getEventRemainingSeats(
  eventId: string,
): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("event_remaining_seats", {
    p_event_id: eventId,
  });

  if (error) {
    // Функция может ещё не быть применена в удалённой БД
    console.error("getEventRemainingSeats failed");
    return null;
  }

  return typeof data === "number" ? data : null;
}

export function computeRemainingSeats(
  capacity: number | null,
  confirmedCount: number,
): number | null {
  if (capacity === null) return null;
  return Math.max(capacity - confirmedCount, 0);
}
