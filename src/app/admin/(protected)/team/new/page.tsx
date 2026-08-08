import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { saveTeamMemberAction } from "@/features/admin/settings/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новый участник команды" };

export default async function NewTeamMemberPage() {
  await requireStaff();
  return (
    <div>
      <AdminPageHeader title="Новый участник команды" />
      <form
        action={saveTeamMemberAction}
        className="mt-6 max-w-2xl space-y-4"
        encType="multipart/form-data"
      >
        <Field label="ФИО">
          <input className="field-input" name="full_name" required />
        </Field>
        <Field label="Роль">
          <input className="field-input" name="role_title" />
        </Field>
        <Field label="Биография">
          <textarea className="field-input min-h-28" name="bio" />
        </Field>
        <Field label="Фото">
          <input
            className="field-input"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Порядок">
            <input className="field-input" type="number" name="sort_order" defaultValue={0} />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked />
          Активен
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Создать
          </button>
          <Link href="/admin/team" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
