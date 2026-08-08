import type { Metadata } from "next";
import {
  getActiveAgeCategories,
  getNearestUpcomingEventSlug,
  getPublishedEventsInRange,
  groupEventsByDateKey,
} from "@/features/events/queries";
import {
  EventsCalendar,
  parseYearMonth,
  type EventsViewMode,
} from "@/features/events/EventsCalendar";
import { getTodayParts } from "@/features/events/calendar-math";
import { getClubTimezone } from "@/lib/supabase/env";
import type { AudienceType, EventFormat } from "@/types/database";

export const metadata: Metadata = {
  title: "Календарь событий",
  description:
    "Месячный календарь встреч семейного клуба «Вместе растём»: мастер-классы, квизы и игры.",
};

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const today = getTodayParts(getClubTimezone());
  const { year, month } = parseYearMonth(
    first(params.year),
    first(params.month),
    { year: today.year, month: today.month },
  );

  const viewParam = first(params.view);
  const view: EventsViewMode | "auto" =
    viewParam === "calendar" || viewParam === "agenda" || viewParam === "list"
      ? viewParam
      : "auto";

  const filters = {
    age: first(params.age) ?? "",
    audience: (first(params.audience) ?? "") as AudienceType | "",
    format: (first(params.format) ?? "") as EventFormat | "",
  };

  const [{ events, grid, error }, categories, nearestSlug] = await Promise.all([
    getPublishedEventsInRange({
      year,
      month,
      filters: {
        age: filters.age || undefined,
        audience: filters.audience || undefined,
        format: filters.format || undefined,
      },
    }),
    getActiveAgeCategories(),
    getNearestUpcomingEventSlug(),
  ]);

  const grouped = groupEventsByDateKey(events);
  const eventsByDay: Record<string, typeof events> = {};
  grouped.forEach((value, key) => {
    eventsByDay[key] = value;
  });

  const nearestHref = nearestSlug
    ? `/events/${nearestSlug}`
    : `/events?year=${today.year}&month=${today.month}&view=list`;

  return (
    <section className="section-space">
      <div className="container-page">
        <EventsCalendar
          year={year}
          month={month}
          view={view === "auto" ? "agenda" : view}
          autoDetectView={view === "auto"}
          filters={{
            age: filters.age,
            audience: filters.audience,
            format: filters.format,
          }}
          grid={grid}
          eventsByDay={eventsByDay}
          events={events}
          categories={categories}
          error={error}
          todayKey={today.dateKey}
          nearestHref={nearestHref}
        />
      </div>
    </section>
  );
}
