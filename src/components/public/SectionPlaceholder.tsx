import type { Metadata } from "next";

type SectionPageProps = {
  title: string;
  description: string;
  note?: string;
};

export function createSectionMetadata(
  title: string,
  description: string,
): Metadata {
  return { title, description };
}

export function SectionPlaceholder({
  title,
  description,
  note = "Контент этого раздела будет загружаться из базы данных после этапа настройки Supabase. Пустые блоки и выдуманные данные на сайте не показываются.",
}: SectionPageProps) {
  return (
    <section className="section-space">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted">{description}</p>
        <p className="mt-8 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 text-sm text-muted">
          {note}
        </p>
      </div>
    </section>
  );
}
