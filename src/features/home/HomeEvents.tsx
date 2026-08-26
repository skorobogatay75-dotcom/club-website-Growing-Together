import Link from "next/link";
import { formatEventDate, formatEventTime } from "@/lib/format/datetime";
import {
  formatLabel,
  registrationLabel,
} from "@/lib/format/labels";
import { isPublicText } from "@/lib/content/public-text";
import { eventAgeLabel } from "@/features/events/event-labels";
import type { EventWithCategory } from "./queries";

type Props = {
  events: EventWithCategory[];
};

export function HomeEvents({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="section-space border-b border-border">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ближайшие события
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Актуальные встречи из календаря клуба.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Открыть календарь
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const ageName = eventAgeLabel(event);
            const cancelled = event.registration_status === "cancelled";

            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 transition-colors hover:border-accent-secondary/50 hover:bg-surface-soft"
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <time dateTime={event.starts_at}>
                      {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{formatLabel(event.format)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {event.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                    {ageName ? (
                      <span className="rounded-md bg-background px-2 py-1 text-muted">
                        {ageName}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-md px-2 py-1 ${
                        cancelled
                          ? "bg-brand-powder text-foreground"
                          : "bg-accent-secondary/20 text-foreground"
                      }`}
                    >
                      {registrationLabel(event.registration_status)}
                    </span>
                  </div>
                  {isPublicText(event.excerpt) ? (
                    <p className="mt-3 text-sm text-muted">{event.excerpt}</p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
