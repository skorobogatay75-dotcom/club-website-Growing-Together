import Link from "next/link";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import type { MembershipPlan } from "@/types/database";

type Props = {
  plans: MembershipPlan[];
};

export function HomeMembership({ plans }: Props) {
  const visiblePlans = plans.filter((plan) => isPublicText(plan.name));

  return (
    <section className="section-space border-b border-border">
      <div className="container-page max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Членство
        </h2>
        <p className="mt-3 text-muted">
          Если формат клуба вам откликается, можно оставить заявку на членство.
          Подробности и условия — на отдельной странице.
        </p>

        {visiblePlans.length > 0 ? (
          <ul className="mt-8 space-y-4">
            {visiblePlans.map((plan) => {
              const description = publicTextOrNull(plan.description);
              const price = publicTextOrNull(plan.price_text);
              const period = publicTextOrNull(plan.period_text);

              return (
                <li
                  key={plan.id}
                  className="rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  {description ? (
                    <p className="mt-2 text-sm text-muted">{description}</p>
                  ) : null}
                  {price || period ? (
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {[price, period].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/membership" className="btn-secondary">
            Подробнее о членстве
          </Link>
          <Link href="/apply" className="btn-primary">
            Оставить заявку
          </Link>
        </div>
      </div>
    </section>
  );
}
