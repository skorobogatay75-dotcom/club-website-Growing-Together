import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import {
  listAdminPrograms,
} from "@/features/admin/programs/queries";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { setProgramStatusAction } from "@/features/admin/programs/actions";

export const metadata: Metadata = { title: "Программы" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const programs = await listAdminPrograms({
    q: q || undefined,
    status: status || undefined,
  });

  const ok = first(params.ok);
  const error = first(params.error);

  return (
    <div>
      <AdminPageHeader
        title="Программы"
        description="Создание, публикация и архив программ."
        actionHref="/admin/programs/new"
        actionLabel="Новая программа"
      />
      <AdminFlash
        message={
          ok === "1"
            ? "Сохранено."
            : ok === "deleted"
              ? "Удалено."
              : error
                ? decodeURIComponent(error)
                : null
        }
        tone={error ? "error" : "ok"}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          className="field-input max-w-xs"
          name="q"
          defaultValue={q}
          placeholder="Поиск"
        />
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
        {programs.map((program) => (
          <li
            key={program.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/programs/${program.id}`}
                  className="font-semibold text-foreground hover:text-accent"
                >
                  {program.title}
                </Link>
                <StatusBadge status={program.status} />
              </div>
              <p className="mt-1 text-xs text-muted">{program.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/programs/${program.slug}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                На сайте
              </Link>
              <Link
                href={`/admin/programs/${program.id}`}
                className="btn-secondary !min-h-9 !px-3 text-sm"
              >
                Изменить
              </Link>
              {program.status !== "published" ? (
                <form action={setProgramStatusAction}>
                  <input type="hidden" name="id" value={program.id} />
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
      {programs.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Программ пока нет.</p>
      ) : null}
    </div>
  );
}
