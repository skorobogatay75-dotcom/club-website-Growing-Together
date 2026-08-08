import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminEvents } from "@/features/admin/events/queries";
import { setEventStatusAction } from "@/features/admin/events/actions";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { formatEventDateTime } from "@/lib/format/datetime";

export const metadata: Metadata = { title: "События" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const month = first(params.month) ?? "";
  const events = await listAdminEvents({
    q: q || undefined,
    status: status || undefined,
    month: month || undefined,
  });

  return (
    <div>
      <AdminPageHeader
        title="События"
        description="Календарные события: публикация сразу отображается на /events."
        actionHref="/admin/events/new"
        actionLabel="Новое событие"
      />
      <AdminFlash
        message={
          first(params.ok) === "1"
            ? "Сохранено."
            : first(params.ok) === "deleted"
              ? "Удалено."
              : first(params.error)
                ? `Ошибка: ${decodeURIComponent(first(params.error)!)}`
                : null
        }
        tone={first(params.error) ? "error" : "ok"}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input className="field-input max-w-xs" name="q" defaultValue={q} placeholder="Поиск" />
        <input className="field-input max-w-[11rem]" name="month" type="month" defaultValue={month} />
        <select className="field-input max-w-[12rem]" name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <button type="submit" className="btn-secondary">
          Фильтр
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/events/${event.id}`} className="font-semibold hover:text-accent">
                  {event.title}
                </Link>
                <StatusBadge status={event.status} />
                <StatusBadge status={event.registration_status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {formatEventDateTime(event.starts_at)} · {event.slug}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/events/${event.slug}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                На сайте
              </Link>
              <Link href={`/admin/events/${event.id}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                Изменить
              </Link>
              {event.status !== "published" ? (
                <form action={setEventStatusAction}>
                  <input type="hidden" name="id" value={event.id} />
                  <input type="hidden" name="status" value="published" />
                  <button type="submit" className="btn-primary !min-h-9 !px-3 text-sm">
                    Опубликовать
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {events.length === 0 ? <p className="mt-6 text-sm text-muted">Событий нет.</p> : null}
    </div>
  );
}
