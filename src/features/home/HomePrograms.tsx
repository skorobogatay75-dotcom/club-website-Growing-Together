import Link from "next/link";
import {
  audienceLabel,
  enrollmentLabel,
  formatLabel,
} from "@/lib/format/labels";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import { programAgeLabel } from "@/features/programs/queries";
import type { ProgramWithCategory } from "./queries";

type Props = {
  programs: ProgramWithCategory[];
};

export function HomePrograms({ programs }: Props) {
  if (programs.length === 0) return null;

  return (
    <section className="section-space border-b border-border">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Программы
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Выберите направление по возрасту и формату встречи.
            </p>
          </div>
          <Link
            href="/programs"
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Все программы
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => {
            const ageName = programAgeLabel(program);
            const duration = publicTextOrNull(program.duration_text);
            const excerpt = isPublicText(program.excerpt) ? program.excerpt : null;

            return (
              <li key={program.id}>
                <Link
                  href={`/programs/${program.slug}`}
                  className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 transition-colors hover:border-accent-secondary/40 hover:bg-surface-soft"
                >
                  <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
                    {ageName ? (
                      <span className="rounded-md bg-background px-2 py-1">
                        {ageName}
                      </span>
                    ) : null}
                    <span className="rounded-md bg-background px-2 py-1">
                      {formatLabel(program.format)}
                    </span>
                    <span className="rounded-md bg-background px-2 py-1">
                      {audienceLabel(program.audience_type)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {program.title}
                  </h3>
                  {excerpt ? (
                    <p className="mt-3 flex-1 text-sm text-muted">{excerpt}</p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    {duration ? (
                      <span className="text-muted">{duration}</span>
                    ) : null}
                    <span className="font-medium text-foreground">
                      {enrollmentLabel(program.enrollment_status)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
