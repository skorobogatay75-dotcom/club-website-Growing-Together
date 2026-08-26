import type { Metadata } from "next";
import Link from "next/link";
import {
  listProgramAgeFilterOptions,
  listPublishedPrograms,
  programAgeLabel,
} from "@/features/programs/queries";
import {
  audienceLabel,
  enrollmentLabel,
  formatLabel,
} from "@/lib/format/labels";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import type { AudienceType, EnrollmentStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Программы",
  description:
    "Каталог программ семейного клуба «Вместе растём» с фильтрами по возрасту и формату.",
};

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const age = first(params.age) ?? "";
  const audience = (first(params.audience) ?? "") as AudienceType | "";
  const enrollment = (first(params.enrollment) ?? "") as EnrollmentStatus | "";

  const [programs, ageOptions] = await Promise.all([
    listPublishedPrograms({
      q: q || undefined,
      age: age || undefined,
      audience: audience || undefined,
      enrollment: enrollment || undefined,
    }),
    listProgramAgeFilterOptions(),
  ]);

  return (
    <section className="section-space">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Программы
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Выберите программу по возрасту, аудитории и статусу набора.
        </p>

        <form className="mt-8 grid gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 md:grid-cols-4">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block font-medium">Поиск</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="Название или описание"
              className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Возраст</span>
            <input
              name="age"
              list="program-age-options"
              defaultValue={age}
              placeholder="Например: 7–10 лет"
              className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
            />
            <datalist id="program-age-options">
              {ageOptions.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Аудитория</span>
            <select
              name="audience"
              defaultValue={audience}
              className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
            >
              <option value="">Все</option>
              <option value="family">Для семьи</option>
              <option value="children">Для детей</option>
              <option value="parents">Для родителей</option>
              <option value="mixed">Смешанный</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Набор</span>
            <select
              name="enrollment"
              defaultValue={enrollment}
              className="min-h-11 w-full rounded-[var(--radius-input)] border border-border bg-background px-3"
            >
              <option value="">Любой статус</option>
              <option value="open">Идёт набор</option>
              <option value="waitlist">Лист ожидания</option>
              <option value="full">Мест нет</option>
              <option value="closed">Набор закрыт</option>
            </select>
          </label>
          <div className="md:col-span-4">
            <button type="submit" className="btn-primary">
              Показать
            </button>
          </div>
        </form>

        {programs.length === 0 ? (
          <p className="mt-10 text-muted">
            Пока нет опубликованных программ по выбранным условиям.
          </p>
        ) : (
          <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programs.map((program) => {
              const excerpt = isPublicText(program.excerpt) ? program.excerpt : null;
              const duration = publicTextOrNull(program.duration_text);
              const ageLabel = programAgeLabel(program);
              return (
                <li key={program.id}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:bg-surface-soft"
                  >
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
                      {ageLabel ? (
                        <span className="rounded-md bg-background px-2 py-1">
                          {ageLabel}
                        </span>
                      ) : null}
                      <span className="rounded-md bg-background px-2 py-1">
                        {formatLabel(program.format)}
                      </span>
                      <span className="rounded-md bg-background px-2 py-1">
                        {audienceLabel(program.audience_type)}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">
                      {program.title}
                    </h2>
                    {excerpt ? (
                      <p className="mt-3 flex-1 text-sm text-muted">{excerpt}</p>
                    ) : (
                      <div className="flex-1" />
                    )}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                      {duration ? <span className="text-muted">{duration}</span> : null}
                      <span className="font-medium">
                        {enrollmentLabel(program.enrollment_status)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
