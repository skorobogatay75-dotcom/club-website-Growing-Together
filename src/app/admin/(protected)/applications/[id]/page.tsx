import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getAdminApplication } from "@/features/admin/applications/queries";
import { updateApplicationAction } from "@/features/admin/applications/actions";
import { AdminFlash, AdminPageHeader, Field, StatusBadge } from "@/components/admin/ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Заявка" };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ApplicationDetailPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const sp = await searchParams;
  const app = await getAdminApplication(id);
  if (!app) notFound();

  const related =
    app.programs?.title ||
    app.events?.title ||
    app.membership_plans?.name ||
    null;

  return (
    <div>
      <AdminPageHeader title={`Заявка · ${app.parent_name}`} />
      <AdminFlash
        message={
          first(sp.ok) === "1"
            ? "Сохранено."
            : first(sp.error)
              ? "Не удалось сохранить."
              : null
        }
        tone={first(sp.error) ? "error" : "ok"}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <StatusBadge status={app.status} />
            <span className="text-muted">{app.type}</span>
          </p>
          <p>
            <span className="text-muted">Родитель:</span> {app.parent_name}
          </p>
          <p>
            <span className="text-muted">Телефон:</span>{" "}
            <a className="underline" href={`tel:${app.phone}`}>
              {app.phone}
            </a>
          </p>
          {app.email ? (
            <p>
              <span className="text-muted">Email:</span>{" "}
              <a className="underline" href={`mailto:${app.email}`}>
                {app.email}
              </a>
            </p>
          ) : null}
          <p>
            <span className="text-muted">Связь:</span> {app.preferred_contact}
          </p>
          {app.child_age_text ? (
            <p>
              <span className="text-muted">Возраст ребёнка:</span> {app.child_age_text}
            </p>
          ) : null}
          {related ? (
            <p>
              <span className="text-muted">Связано с:</span> {related}
              {app.events?.slug ? (
                <>
                  {" "}
                  (
                  <Link href={`/events/${app.events.slug}`} className="underline">
                    на сайте
                  </Link>
                  )
                </>
              ) : null}
            </p>
          ) : null}
          {app.comment ? (
            <p>
              <span className="text-muted">Комментарий:</span> {app.comment}
            </p>
          ) : null}
          <p className="text-xs text-muted">
            Создано: {new Date(app.created_at).toLocaleString("ru-RU")}
            {app.source ? ` · source: ${app.source}` : ""}
          </p>
        </div>

        <form action={updateApplicationAction} className="space-y-4">
          <input type="hidden" name="id" value={app.id} />
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={app.status}>
              <option value="new">new</option>
              <option value="contacted">contacted</option>
              <option value="confirmed">confirmed</option>
              <option value="waitlist">waitlist</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
              <option value="spam">spam</option>
            </select>
          </Field>
          <Field label="Заметка менеджера">
            <textarea
              className="field-input min-h-28"
              name="manager_note"
              defaultValue={app.manager_note ?? ""}
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Сохранить
            </button>
            <Link href="/admin/applications" className="btn-secondary">
              К списку
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
