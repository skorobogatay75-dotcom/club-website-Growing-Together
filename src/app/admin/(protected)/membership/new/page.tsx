import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { saveMembershipPlanAction } from "@/features/admin/membership/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новый тариф" };

export default async function NewMembershipPage() {
  await requireStaff();
  return (
    <div>
      <AdminPageHeader title="Новый тариф" />
      <form action={saveMembershipPlanAction} className="mt-6 max-w-2xl space-y-4">
        <Field label="Название">
          <input className="field-input" name="name" required />
        </Field>
        <Field label="Slug">
          <input className="field-input" name="slug" />
        </Field>
        <Field label="Описание">
          <textarea className="field-input min-h-24" name="description" />
        </Field>
        <Field label="Преимущества" hint="По одному пункту на строку, можно с «- »">
          <textarea className="field-input min-h-28 font-mono text-sm" name="benefits" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Стоимость (текст)">
            <input className="field-input" name="price_text" />
          </Field>
          <Field label="Период">
            <input className="field-input" name="period_text" placeholder="в месяц" />
          </Field>
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
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Создать
          </button>
          <Link href="/admin/membership" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
