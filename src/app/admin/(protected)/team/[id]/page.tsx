import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getAdminTeamMember } from "@/features/admin/settings/queries";
import {
  saveTeamMemberAction,
  deleteTeamMemberAction,
} from "@/features/admin/settings/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Участник команды" };

export default async function EditTeamMemberPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const member = await getAdminTeamMember(id);
  if (!member) notFound();

  return (
    <div>
      <AdminPageHeader title="Редактирование участника" />
      <form
        action={saveTeamMemberAction}
        className="mt-6 max-w-2xl space-y-4"
        encType="multipart/form-data"
      >
        <input type="hidden" name="id" value={member.id} />
        <input type="hidden" name="photo_path" value={member.photo_path ?? ""} />
        <Field label="ФИО">
          <input
            className="field-input"
            name="full_name"
            required
            defaultValue={member.full_name}
          />
        </Field>
        <Field label="Роль">
          <input
            className="field-input"
            name="role_title"
            defaultValue={member.role_title ?? ""}
          />
        </Field>
        <Field label="Биография">
          <textarea
            className="field-input min-h-28"
            name="bio"
            defaultValue={member.bio ?? ""}
          />
        </Field>
        <Field label="Фото">
          <input
            className="field-input"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
          />
          {member.photo_path ? (
            <span className="mt-1 block text-xs text-muted">{member.photo_path}</span>
          ) : null}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Порядок">
            <input
              className="field-input"
              type="number"
              name="sort_order"
              defaultValue={member.sort_order}
            />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={member.status}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={member.is_active} />
          Активен
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
          <Link href="/admin/team" className="btn-secondary">
            К списку
          </Link>
        </div>
      </form>
      <div className="mt-6">
        <ConfirmDeleteButton
          action={deleteTeamMemberAction}
          id={member.id}
          confirmMessage="Удалить участника команды?"
        />
      </div>
    </div>
  );
}
