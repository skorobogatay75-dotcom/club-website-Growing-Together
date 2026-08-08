import {
  getActiveAgeCategories,
  getNearestUpcomingEventSlug,
  getPublishedEventsInRange,
  groupEventsByDateKey,
} from "@/features/events/queries";
import {
  EventsCalendar,
  type EventsViewMode,
} from "@/features/events/EventsCalendar";
import { getTodayParts, parseYearMonth } from "@/features/events/calendar-math";
import { getClubTimezone } from "@/lib/supabase/env";

type Props = {
  yearParam?: string;
  monthParam?: string;
  viewParam?: string;
};

export async function HomeCalendar({
  yearParam,
  monthParam,
  viewParam,
}: Props) {
  const today = getTodayParts(getClubTimezone());
  const { year, month } = parseYearMonth(yearParam, monthParam, {
    year: today.year,
    month: today.month,
  });

  const view: EventsViewMode | "auto" =
    viewParam === "calendar" || viewParam === "agenda" || viewParam === "list"
      ? viewParam
      : "auto";

  const [{ events, grid, error }, categories, nearestSlug] = await Promise.all([
    getPublishedEventsInRange({ year, month }),
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
    <section
      id="calendar"
      className="section-space border-b border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-turquoise)_12%,transparent),transparent_70%)]"
    >
      <div className="container-page">
        <EventsCalendar
          year={year}
          month={month}
          view={view === "auto" ? "agenda" : view}
          autoDetectView={view === "auto"}
          variant="embed"
          filters={{ age: "", audience: "", format: "" }}
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
