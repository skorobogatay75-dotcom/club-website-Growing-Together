import Link from "next/link";
import {
  formatEventTime,
} from "@/lib/format/datetime";
import { registrationLabel } from "@/lib/format/labels";
import { eventAgeLabel, type CalendarEvent } from "@/features/events/queries";

const MAX_VISIBLE = 3;

type Props = {
  events: CalendarEvent[];
  onShowAll: () => void;
};

export function DayEventList({ events, onShowAll }: Props) {
  const visible = events.slice(0, MAX_VISIBLE);
  const rest = events.length - visible.length;

  return (
    <ul className="mt-1 space-y-1">
      {visible.map((event) => {
        const cancelled = event.registration_status === "cancelled";
        return (
          <li key={event.id}>
            <Link
              href={`/events/${event.slug}`}
              className={`block rounded-md px-1.5 py-1 text-left text-[0.7rem] leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring ${
                cancelled
                  ? "bg-brand-powder/80 text-foreground line-through decoration-brand-ink/40"
                  : "bg-accent-secondary/20 text-foreground hover:bg-accent-secondary/35"
              }`}
            >
              <span className="font-semibold">
                {formatEventTime(event.starts_at)}
              </span>{" "}
              <span className="break-words">{event.title}</span>
              {eventAgeLabel(event) ? (
                <span className="mt-0.5 block text-[0.65rem] text-muted no-underline">
                  {eventAgeLabel(event)}
                </span>
              ) : null}
              <span className="sr-only">
                {registrationLabel(event.registration_status)}
              </span>
            </Link>
          </li>
        );
      })}
      {rest > 0 ? (
        <li>
          <button
            type="button"
            onClick={onShowAll}
            className="min-h-8 w-full rounded-md px-1.5 text-left text-[0.7rem] font-semibold text-accent hover:underline"
          >
            Ещё {rest}
          </button>
        </li>
      ) : null}
    </ul>
  );
}
