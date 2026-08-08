import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminApplications } from "@/features/admin/applications/queries";
import { setApplicationStatusAction } from "@/features/admin/applications/actions";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Заявки" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function formatCreated(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const type = first(params.type) ?? "";
  const apps = await listAdminApplications({
    q: q || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  const csvHref = `/admin/applications/export?${new URLSearchParams({
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(q ? { q } : {}),
  }).toString()}`;

  return (
    <div>
      <AdminPageHeader
        title="Заявки"
        description="Обработка входящих заявок. Контакты видны только сотрудникам."
      />
      <AdminFlash
        message={
          first(params.ok) === "1"
            ? "Сохранено."
            : first(params.error)
              ? `Ошибка: ${decodeURIComponent(first(params.error)!)}`
              : null
        }
        tone={first(params.error) ? "error" : "ok"}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input className="field-input max-w-xs" name="q" defaultValue={q} placeholder="Имя / телефон / email" />
        <select className="field-input max-w-[12rem]" name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="confirmed">confirmed</option>
          <option value="waitlist">waitlist</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
          <option value="spam">spam</option>
        </select>
        <select className="field-input max-w-[12rem]" name="type" defaultValue={type}>
          <option value="">Все типы</option>
          <option value="program">program</option>
          <option value="event">event</option>
          <option value="membership">membership</option>
          <option value="general">general</option>
        </select>
        <button type="submit" className="btn-secondary">
          Фильтр
        </button>
        <Link href={csvHref} className="btn-secondary">
          CSV
        </Link>
      </form>

      <ul className="mt-6 space-y-3">
        {apps.map((app) => {
          const related =
            app.programs?.title ||
            app.events?.title ||
            app.membership_plans?.name ||
            "—";
          return (
            <li
              key={app.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="font-semibold hover:text-accent"
                  >
                    {app.parent_name}
                  </Link>
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-muted">{app.type}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatCreated(app.created_at)} · {related} · {app.phone}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="btn-secondary !min-h-9 !px-3 text-sm"
                >
                  Открыть
                </Link>
                {app.status === "new" ? (
                  <form action={setApplicationStatusAction}>
                    <input type="hidden" name="id" value={app.id} />
                    <input type="hidden" name="status" value="contacted" />
                    <button type="submit" className="btn-primary !min-h-9 !px-3 text-sm">
                      Связались
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {apps.length === 0 ? <p className="mt-6 text-sm text-muted">Заявок нет.</p> : null}
    </div>
  );
}
