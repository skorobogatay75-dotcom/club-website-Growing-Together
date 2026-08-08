import type { Metadata } from "next";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getApplicationFormOptions } from "@/features/applications/options";
import type { ApplicationType } from "@/lib/validation/application";

export const metadata: Metadata = {
  title: "Записаться",
  description:
    "Заявка на программу, событие или членство в семейном клубе «Вместе растём».",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asType(value: string | undefined): ApplicationType | undefined {
  if (
    value === "general" ||
    value === "program" ||
    value === "event" ||
    value === "membership"
  ) {
    return value;
  }
  return undefined;
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const options = await getApplicationFormOptions();

  return (
    <section className="section-space">
      <div className="container-page max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Записаться
        </h1>
        <p className="mt-4 text-muted">
          Оставьте заявку — мы свяжемся с вами, чтобы уточнить детали и подобрать
          подходящий формат.
        </p>
        <div className="mt-8 rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-6">
          <ApplicationForm
            options={options}
            source="apply-page"
            prefill={{
              type: asType(first(params.type)),
              programSlug: first(params.program),
              eventSlug: first(params.event),
              planSlug: first(params.plan),
            }}
          />
        </div>
      </div>
    </section>
  );
}
