"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthLabel,
  getWeekdayLongLabels,
  getWeekdayShortLabels,
  shiftMonth,
} from "@/features/events/calendar-math";
import type { CalendarEvent } from "@/features/events/queries";
import type { MonthGrid } from "@/features/events/calendar-math";
import { DayEventList } from "@/features/events/DayEventList";
import { DayEventsDialog } from "@/features/events/DayEventsDialog";
import { formatEventDate, formatEventTime } from "@/lib/format/datetime";
import { registrationLabel } from "@/lib/format/labels";
import { eventAgeLabel } from "@/features/events/queries";

export type EventsViewMode = "calendar" | "agenda" | "list";

type Props = {
  year: number;
  month: number;
  view: EventsViewMode;
  autoDetectView?: boolean;
  /** Полная страница /events или встраивание на главную */
  variant?: "page" | "embed";
  showFilters?: boolean;
  filters: {
    age: string;
    audience: string;
    format: string;
  };
  grid: MonthGrid;
  eventsByDay: Record<string, CalendarEvent[]>;
  events: CalendarEvent[];
  ageOptions: string[];
  error: string | null;
  todayKey: string;
  nearestHref: string;
};

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function EventsCalendar({
  year,
  month,
  view,
  autoDetectView = false,
  variant = "page",
  showFilters,
  filters,
  grid,
  eventsByDay,
  events,
  ageOptions,
  error,
  todayKey,
  nearestHref,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const weekdayShort = getWeekdayShortLabels();
  const weekdayLong = getWeekdayLongLabels();
  const isEmbed = variant === "embed";
  const filtersVisible = showFilters ?? !isEmbed;
  const HeadingTag = isEmbed ? "h2" : "h1";

  const navigate = useCallback(
    (next: {
      year?: number;
      month?: number;
      view?: EventsViewMode;
      age?: string;
      audience?: string;
      format?: string;
    }) => {
      const y = next.year ?? year;
      const m = next.month ?? month;
      const query = buildQuery({
        year: String(y),
        month: String(m),
        view: next.view ?? view,
        age: (next.age ?? filters.age) || undefined,
        audience: (next.audience ?? filters.audience) || undefined,
        format: (next.format ?? filters.format) || undefined,
      });
      startTransition(() => {
        router.push(`${pathname}${query}`, { scroll: false });
      });
    },
    [filters, month, pathname, router, view, year],
  );

  useEffect(() => {
    if (!autoDetectView) return;
    const preferAgenda = window.matchMedia("(max-width: 1023px)").matches;
    const preferred: EventsViewMode = preferAgenda ? "agenda" : "calendar";
    if (preferred === view) return;
    navigate({ view: preferred });
    // Только при первом заходе без view в URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetectView]);

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] ?? [] : [];
  const selectedLabel = selectedDay
    ? formatEventDate(`${selectedDay}T12:00:00.000Z`)
    : "";

  const agendaGroups = useMemo(() => {
    return Object.entries(eventsByDay)
      .filter(([key]) => key.startsWith(`${year}-${String(month).padStart(2, "0")}`))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [eventsByDay, month, year]);

  const listEvents = useMemo(() => {
    return [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <HeadingTag
            className={
              isEmbed
                ? "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                : "text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            }
          >
            Календарь событий
          </HeadingTag>
          <p className="mt-2 text-muted">
            {isEmbed
              ? "Месячная сетка встреч клуба — переключайте месяц прямо здесь."
              : "Месячная сетка встреч клуба. Можно скопировать ссылку на выбранный месяц и фильтры."}
          </p>
          {isEmbed ? (
            <Link
              href="/events"
              className="mt-3 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              Открыть полный календарь
            </Link>
          ) : null}
        </div>

        <div
          className="inline-flex rounded-[var(--radius-button)] border border-border bg-surface p-1"
          role="group"
          aria-label="Режим отображения"
        >
          {(
            [
              ["calendar", "Календарь"],
              ["agenda", "Повестка"],
              ["list", "Список"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`min-h-10 rounded-[calc(var(--radius-button)-2px)] px-3 text-sm font-medium ${
                view === value
                  ? "bg-background text-foreground shadow-soft"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={view === value}
              onClick={() => navigate({ view: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtersVisible ? (
      <form
        className="grid gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          navigate({
            age: String(data.get("age") || ""),
            audience: String(data.get("audience") || ""),
            format: String(data.get("format") || ""),
          });
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Возраст</span>
          <select
            name="age"
            defaultValue={filters.age}
            className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
          >
            <option value="">Все</option>
            {ageOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Аудитория</span>
          <select
            name="audience"
            defaultValue={filters.audience}
            className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
          >
            <option value="">Все</option>
            <option value="family">Для семьи</option>
            <option value="children">Для детей</option>
            <option value="parents">Для родителей</option>
            <option value="mixed">Смешанный</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-foreground">Формат</span>
          <select
            name="format"
            defaultValue={filters.format}
            className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
          >
            <option value="">Все</option>
            <option value="workshop">Мастер-класс</option>
            <option value="quiz">Квиз</option>
            <option value="game">Игра</option>
            <option value="meeting">Встреча</option>
            <option value="other">Другое</option>
          </select>
        </label>
        <div className="sm:col-span-3">
          <button type="submit" className="btn-secondary">
            Применить фильтры
          </button>
        </div>
      </form>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface"
            aria-label="Предыдущий месяц"
            onClick={() => {
              const prev = shiftMonth(year, month, -1);
              navigate({ year: prev.year, month: prev.month });
            }}
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>
          <h2
            className="min-w-[12rem] text-center text-xl font-semibold text-foreground"
            aria-live="polite"
          >
            {formatMonthLabel(year, month)}
          </h2>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface"
            aria-label="Следующий месяц"
            onClick={() => {
              const next = shiftMonth(year, month, 1);
              navigate({ year: next.year, month: next.month });
            }}
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            const [y, m] = todayKey.split("-").map(Number);
            navigate({ year: y, month: m });
          }}
        >
          Сегодня
        </button>
      </div>

      {pending ? (
        <p className="text-sm text-muted" role="status">
          Загрузка месяца…
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-card)] border border-border bg-brand-powder/50 px-4 py-3 text-sm text-foreground"
        >
          {error}
        </div>
      ) : null}

      {!error && events.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface px-5 py-8 text-center">
          <p className="text-foreground">В этом месяце событий пока нет</p>
          <Link href={nearestHref} className="btn-primary mt-5 inline-flex">
            К ближайшим событиям
          </Link>
        </div>
      ) : null}

      {view === "calendar" ? (
        <div className="overflow-x-auto">
          <table
            className="w-full min-w-[44rem] border-collapse"
            role="grid"
            aria-label={`Календарь: ${formatMonthLabel(year, month)}`}
          >
            <thead>
              <tr>
                {weekdayShort.map((label, index) => (
                  <th
                    key={label}
                    scope="col"
                    className="border-b border-border px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    <span aria-hidden="true">{label}</span>
                    <span className="sr-only">{weekdayLong[index]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.weeks.map((week) => (
                <tr key={week[0].dateKey}>
                  {week.map((cell) => {
                    const dayEvents = eventsByDay[cell.dateKey] ?? [];
                    const isSelected = selectedDay === cell.dateKey;
                    return (
                      <td
                        key={cell.dateKey}
                        role="gridcell"
                        aria-selected={isSelected}
                        className={`align-top border border-border p-2 ${
                          cell.inCurrentMonth ? "bg-background" : "bg-surface-soft/40"
                        } ${cell.isToday ? "ring-2 ring-inset ring-accent-secondary" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full text-sm font-semibold ${
                              cell.isToday
                                ? "bg-accent text-white"
                                : cell.inCurrentMonth
                                  ? "text-foreground"
                                  : "text-muted"
                            }`}
                            aria-label={`${cell.day}${cell.isToday ? ", сегодня" : ""}${isSelected ? ", выбран" : ""}`}
                            aria-current={cell.isToday ? "date" : undefined}
                            onClick={() =>
                              setSelectedDay(
                                dayEvents.length ? cell.dateKey : cell.dateKey,
                              )
                            }
                          >
                            {cell.day}
                          </button>
                          {cell.isToday ? (
                            <span className="text-[0.65rem] font-medium text-accent-secondary">
                              сегодня
                            </span>
                          ) : null}
                        </div>
                        {dayEvents.length > 0 ? (
                          <DayEventList
                            events={dayEvents}
                            onShowAll={() => setSelectedDay(cell.dateKey)}
                          />
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === "agenda" ? (
        <div className="space-y-6">
          {agendaGroups.length === 0 && !error ? (
            <p className="text-sm text-muted">Нет событий для отображения в повестке.</p>
          ) : (
            agendaGroups.map(([dateKey, dayEvents]) => (
              <section key={dateKey}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
                  {formatEventDate(`${dateKey}T12:00:00.000Z`)}
                </h3>
                <ul className="mt-3 space-y-3">
                  {dayEvents.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="block rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 hover:bg-surface-soft"
                      >
                        <p className="font-semibold text-foreground">
                          {formatEventTime(event.starts_at)} · {event.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {[
                            eventAgeLabel(event),
                            registrationLabel(event.registration_status),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : null}

      {view === "list" ? (
        <ul className="space-y-3">
          {listEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.slug}`}
                className="block rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 hover:bg-surface-soft"
              >
                <p className="text-sm text-muted">
                  {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
                </p>
                <p className="mt-1 font-semibold text-foreground">{event.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {registrationLabel(event.registration_status)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {selectedDay && selectedEvents.length > 0 ? (
        <DayEventsDialog
          dateLabel={selectedLabel}
          events={selectedEvents}
          onClose={() => setSelectedDay(null)}
        />
      ) : null}
    </div>
  );
}

export function defaultViewForWidthHint(): EventsViewMode {
  // Server default; client may override via URL. Mobile-first: agenda.
  return "agenda";
}

export function resolveInitialView(
  viewParam: string | undefined,
  preferAgenda: boolean,
): EventsViewMode {
  if (viewParam === "calendar" || viewParam === "agenda" || viewParam === "list") {
    return viewParam;
  }
  return preferAgenda ? "agenda" : "calendar";
}
