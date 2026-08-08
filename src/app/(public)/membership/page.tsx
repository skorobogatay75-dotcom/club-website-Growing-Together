import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedMembershipPlans } from "@/features/home/queries";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";

export const metadata: Metadata = {
  title: "Членство",
  description: "Варианты членства в семейном клубе «Вместе растём».",
};

export const revalidate = 60;

export default async function MembershipPage() {
  const plans = (await getPublishedMembershipPlans()).filter((plan) =>
    isPublicText(plan.name),
  );

  return (
    <section className="section-space">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Членство
        </h1>
        <p className="mt-4 text-lg text-muted">
          Членство подходит семьям, которые хотят регулярно участвовать во
          встречах клуба и быть в курсе ближайших событий.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-foreground">
          Кому подходит
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          <li>Родителям младших школьников и подростков</li>
          <li>Семьям, которым важен содержательный совместный досуг</li>
          <li>Тем, кто ценит спокойную и безопасную атмосферу</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-foreground">
          Как вступить
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
          <li>Оставьте заявку на членство</li>
          <li>Мы свяжемся, чтобы уточнить детали</li>
          <li>Подберём удобный формат участия</li>
        </ol>

        {plans.length > 0 ? (
          <ul className="mt-10 space-y-4">
            {plans.map((plan) => {
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
        ) : (
          <p className="mt-10 text-muted">
            Тарифы появятся после публикации в админ-панели. Сейчас можно
            оставить общую заявку — мы расскажем о доступных вариантах.
          </p>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground">FAQ</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-foreground">
                Нужно ли приходить всей семьёй?
              </dt>
              <dd className="mt-1 text-muted">
                Формат зависит от программы. Часто родители и дети занимаются
                параллельно в двух аудиториях.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Как узнать стоимость?
              </dt>
              <dd className="mt-1 text-muted">
                Актуальные условия публикуются здесь после утверждения. Если
                тарифов ещё нет, уточним их при ответе на заявку.
              </dd>
            </div>
          </dl>
        </section>

        <Link href="/apply?type=membership" className="btn-primary mt-10 inline-flex">
          Оставить заявку на членство
        </Link>
      </div>
    </section>
  );
}
