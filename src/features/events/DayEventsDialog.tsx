"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { formatEventTime } from "@/lib/format/datetime";
import { registrationLabel } from "@/lib/format/labels";
import { eventAgeLabel, type CalendarEvent } from "@/features/events/queries";

type Props = {
  dateLabel: string;
  events: CalendarEvent[];
  onClose: () => void;
};

export function DayEventsDialog({ dateLabel, events, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-brand-ink/40"
        aria-label="Закрыть список событий"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-soft"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            События · {dateLabel}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border"
            aria-label="Закрыть"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.slug}`}
                className="block rounded-[var(--radius-button)] border border-border px-3 py-3 hover:bg-surface"
                onClick={onClose}
              >
                <p className="text-sm font-semibold text-foreground">
                  {formatEventTime(event.starts_at)} · {event.title}
                </p>
                <p className="mt-1 text-xs text-muted">
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
      </div>
    </div>
  );
}
