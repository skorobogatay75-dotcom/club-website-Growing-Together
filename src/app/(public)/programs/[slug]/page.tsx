import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProgramBySlug } from "@/features/content/queries";
import {
  audienceLabel,
  enrollmentLabel,
  formatLabel,
} from "@/lib/format/labels";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublishedProgramBySlug(slug);
  if (!program) return { title: "Программа не найдена" };
  return {
    title: program.seo_title || program.title,
    description: program.seo_description || program.excerpt || undefined,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getPublishedProgramBySlug(slug);
  if (!program) notFound();

  const excerpt = isPublicText(program.excerpt) ? program.excerpt : null;
  const duration = publicTextOrNull(program.duration_text);
  const price = publicTextOrNull(program.price_text);

  return (
    <article className="section-space">
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
        {duration ? (
          <p className="mt-4 text-sm text-muted">Длительность: {duration}</p>
        ) : null}
        {price ? <p className="mt-2 text-sm text-muted">{price}</p> : null}
        <Link href="/apply" className="btn-primary mt-8 inline-flex">
          Записаться на программу
        </Link>
      </div>
    </article>
  );
}
