import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminTeamMembers } from "@/features/admin/settings/queries";
import { deleteTeamMemberAction } from "@/features/admin/settings/actions";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export const metadata: Metadata = { title: "Команда" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const team = await listAdminTeamMembers();

  return (
    <div>
      <AdminPageHeader
        title="Команда"
        description="Участники для страницы «О клубе». Публикуются только published + активные."
        actionHref="/admin/team/new"
        actionLabel="Добавить"
      />
      <AdminFlash
        message={
          first(params.ok) === "1" || first(params.ok) === "team"
            ? "Сохранено."
            : first(params.ok) === "deleted"
              ? "Удалено."
              : first(params.error)
                ? `Ошибка: ${decodeURIComponent(first(params.error)!)}`
                : null
        }
        tone={first(params.error) ? "error" : "ok"}
      />

      <ul className="mt-6 space-y-3">
        {team.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/team/${member.id}`}
                  className="font-semibold hover:text-accent"
                >
                  {member.full_name}
                </Link>
                <StatusBadge status={member.status} />
                {!member.is_active ? (
                  <span className="text-xs text-muted">неактивен</span>
                ) : null}
              </div>
              {member.role_title ? (
                <p className="mt-1 text-xs text-muted">{member.role_title}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/team/${member.id}`}
                className="btn-secondary !min-h-9 !px-3 text-sm"
              >
                Изменить
              </Link>
              <ConfirmDeleteButton
                action={deleteTeamMemberAction}
                id={member.id}
                confirmMessage="Удалить участника команды?"
              />
            </div>
          </li>
        ))}
      </ul>
      {team.length === 0 ? <p className="mt-6 text-sm text-muted">Участников пока нет.</p> : null}
    </div>
  );
}
