import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminMembershipPlans } from "@/features/admin/membership/queries";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Членство" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminMembershipPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const plans = await listAdminMembershipPlans();

  return (
    <div>
      <AdminPageHeader
        title="Тарифы членства"
        description="Планы для публичной страницы /membership."
        actionHref="/admin/membership/new"
        actionLabel="Новый тариф"
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

      <ul className="mt-6 space-y-3">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/membership/${plan.id}`}
                  className="font-semibold hover:text-accent"
                >
                  {plan.name}
                </Link>
                <StatusBadge status={plan.status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {plan.slug}
                {plan.price_text ? ` · ${plan.price_text}` : ""}
              </p>
            </div>
            <Link
              href={`/admin/membership/${plan.id}`}
              className="btn-secondary !min-h-9 !px-3 text-sm"
            >
              Изменить
            </Link>
          </li>
        ))}
      </ul>
      {plans.length === 0 ? <p className="mt-6 text-sm text-muted">Тарифов нет.</p> : null}
    </div>
  );
}
