import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedEventBySlug } from "@/features/content/queries";
import { formatEventDateTime } from "@/lib/format/datetime";
import {
  formatLabel,
  registrationLabel,
} from "@/lib/format/labels";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return { title: "Событие не найдено" };
  return {
    title: event.seo_title || event.title,
    description: event.seo_description || event.excerpt || undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const excerpt = isPublicText(event.excerpt) ? event.excerpt : null;
  const venue = publicTextOrNull(event.venue);
  const price = publicTextOrNull(event.price_text);

  return (
    <article className="section-space">
      <div className="container-page max-w-3xl">
        <p className="text-sm text-muted">
          <Link href="/events" className="hover:text-foreground">
            ← Календарь
          </Link>
        </p>
        <p className="mt-6 text-sm text-muted">
          <time dateTime={event.starts_at}>
            {formatEventDateTime(event.starts_at)}
          </time>
          {" · "}
          {formatLabel(event.format)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {event.title}
        </h1>
        <p className="mt-4 text-sm font-medium text-foreground">
          {registrationLabel(event.registration_status)}
        </p>
        {excerpt ? <p className="mt-5 text-lg text-muted">{excerpt}</p> : null}
        {venue ? <p className="mt-4 text-sm text-muted">Место: {venue}</p> : null}
        {price ? <p className="mt-2 text-sm text-muted">{price}</p> : null}
        <Link href="/apply" className="btn-primary mt-8 inline-flex">
          Записаться
        </Link>
      </div>
    </article>
  );
}
