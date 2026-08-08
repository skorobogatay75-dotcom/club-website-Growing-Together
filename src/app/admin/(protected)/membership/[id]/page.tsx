import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getAdminMembershipPlan } from "@/features/admin/membership/queries";
import {
  saveMembershipPlanAction,
  deleteMembershipPlanAction,
} from "@/features/admin/membership/actions";
import { benefitsToText } from "@/lib/admin/benefits";
import { AdminPageHeader, Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Тариф" };

export default async function EditMembershipPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const plan = await getAdminMembershipPlan(id);
  if (!plan) notFound();

  return (
    <div>
      <AdminPageHeader title="Редактирование тарифа" />
      <form action={saveMembershipPlanAction} className="mt-6 max-w-2xl space-y-4">
        <input type="hidden" name="id" value={plan.id} />
        <Field label="Название">
          <input className="field-input" name="name" required defaultValue={plan.name} />
        </Field>
        <Field label="Slug">
          <input className="field-input" name="slug" defaultValue={plan.slug} />
        </Field>
        <Field label="Описание">
          <textarea
            className="field-input min-h-24"
            name="description"
            defaultValue={plan.description ?? ""}
          />
        </Field>
        <Field label="Преимущества" hint="По одному пункту на строку">
          <textarea
            className="field-input min-h-28 font-mono text-sm"
            name="benefits"
            defaultValue={benefitsToText(plan.benefits_json)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Стоимость (текст)">
            <input className="field-input" name="price_text" defaultValue={plan.price_text ?? ""} />
          </Field>
          <Field label="Период">
            <input
              className="field-input"
              name="period_text"
              defaultValue={plan.period_text ?? ""}
            />
          </Field>
          <Field label="Порядок">
            <input
              className="field-input"
              type="number"
              name="sort_order"
              defaultValue={plan.sort_order}
            />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={plan.status}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
          <Link href="/admin/membership" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>
      <div className="mt-6">
        <ConfirmDeleteButton
          action={deleteMembershipPlanAction}
          id={plan.id}
          confirmMessage="Удалить тариф?"
        />
      </div>
    </div>
  );
}
