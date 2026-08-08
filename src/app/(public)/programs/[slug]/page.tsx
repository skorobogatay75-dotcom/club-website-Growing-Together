import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProgramBySlug } from "@/features/content/queries";
import {
  getProgramRelatedEvents,
  getRelatedPrograms,
} from "@/features/programs/queries";
import { ContentBlocks } from "@/components/public/ContentBlocks";
import {
  audienceLabel,
  enrollmentLabel,
  formatLabel,
} from "@/lib/format/labels";
import { formatEventDateTime } from "@/lib/format/datetime";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublishedProgramBySlug(slug);
  if (!program) return { title: "Программа не найдена", robots: { index: false } };
  return buildPageMetadata({
    title: program.seo_title || program.title,
    description: program.seo_description || program.excerpt,
    path: `/programs/${program.slug}`,
    imagePath: program.cover_path,
  });
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getPublishedProgramBySlug(slug);
  if (!program) notFound();

  const [relatedEvents, relatedPrograms] = await Promise.all([
    getProgramRelatedEvents(program.id),
    getRelatedPrograms(program),
  ]);

  const excerpt = isPublicText(program.excerpt) ? program.excerpt : null;
  const duration = publicTextOrNull(program.duration_text);
  const price = publicTextOrNull(program.price_text);

  return (
    <article className="section-space">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Программы", path: "/programs" },
          { name: program.title, path: `/programs/${program.slug}` },
        ])}
      />
      <div className="container-page max-w-3xl">
        <p className="text-sm text-muted">
          <Link href="/programs" className="hover:text-foreground">
            ← Программы
          </Link>
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {program.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          <span>{formatLabel(program.format)}</span>
          <span aria-hidden="true">·</span>
          <span>{audienceLabel(program.audience_type)}</span>
          <span aria-hidden="true">·</span>
          <span>{enrollmentLabel(program.enrollment_status)}</span>
        </div>
        {excerpt ? <p className="mt-5 text-lg text-muted">{excerpt}</p> : null}
        <div className="mt-6">
          <ContentBlocks value={program.content_json} />
        </div>
        {duration ? (
          <p className="mt-6 text-sm text-muted">Длительность: {duration}</p>
        ) : null}
        {price ? <p className="mt-2 text-sm text-muted">Стоимость: {price}</p> : null}

        {relatedEvents.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground">
              Ближайшие события программы
            </h2>
            <ul className="mt-4 space-y-3">
              {relatedEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="block rounded-[var(--radius-card)] border border-border px-4 py-3 hover:bg-surface"
                  >
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted">
                      {formatEventDateTime(event.starts_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedPrograms.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-foreground">
              Похожие программы
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedPrograms.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/programs/${item.slug}`}
                    className="text-accent hover:text-accent-hover"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Link
          href={`/apply?type=program&program=${program.slug}`}
          className="btn-primary mt-10 inline-flex"
        >
          Записаться на программу
        </Link>
      </div>
    </article>
  );
}
