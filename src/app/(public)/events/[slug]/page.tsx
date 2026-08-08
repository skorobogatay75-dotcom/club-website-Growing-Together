import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedEventBySlug } from "@/features/content/queries";
import { getEventRemainingSeats } from "@/features/events/queries";
import { ContentBlocks } from "@/components/public/ContentBlocks";
import {
  formatEventDateTime,
} from "@/lib/format/datetime";
import {
  audienceLabel,
  formatLabel,
  registrationLabel,
} from "@/lib/format/labels";
import { isPublicText, publicTextOrNull } from "@/lib/content/public-text";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgeCategory } from "@/types/database";

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

  const [remainingSeats, ageCategory] = await Promise.all([
    event.capacity != null ? getEventRemainingSeats(event.id) : Promise.resolve(null),
    getAgeCategoryName(event.age_category_id),
  ]);

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
          {" — "}
          <time dateTime={event.ends_at}>{formatEventDateTime(event.ends_at)}</time>
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {event.title}
        </h1>

        <ul className="mt-5 flex flex-wrap gap-2 text-sm">
          <li className="rounded-md bg-surface px-2 py-1">
            {formatLabel(event.format)}
          </li>
          <li className="rounded-md bg-surface px-2 py-1">
            {audienceLabel(event.audience_type)}
          </li>
          {ageCategory ? (
            <li className="rounded-md bg-surface px-2 py-1">{ageCategory}</li>
          ) : null}
          <li className="rounded-md bg-surface px-2 py-1">
            {registrationLabel(event.registration_status)}
          </li>
        </ul>

        {excerpt ? <p className="mt-6 text-lg text-muted">{excerpt}</p> : null}
        <div className="mt-6">
          <ContentBlocks value={event.content_json} />
        </div>

        <dl className="mt-8 space-y-2 text-sm text-muted">
          {venue ? (
            <div>
              <dt className="inline font-medium text-foreground">Место: </dt>
              <dd className="inline">{venue}</dd>
            </div>
          ) : null}
          {price ? (
            <div>
              <dt className="inline font-medium text-foreground">Стоимость: </dt>
              <dd className="inline">{price}</dd>
            </div>
          ) : null}
          {event.capacity != null && remainingSeats != null ? (
            <div>
              <dt className="inline font-medium text-foreground">Осталось мест: </dt>
              <dd className="inline">{remainingSeats}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/apply?type=event&event=${event.slug}`}
            className="btn-primary"
          >
            Записаться
          </Link>
          <a href={`/api/events/${event.slug}/ics`} className="btn-secondary">
            Скачать .ics
          </a>
        </div>
      </div>
    </article>
  );
}

async function getAgeCategoryName(id: string | null): Promise<string | null> {
  if (!id) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("age_categories")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  return (data as Pick<AgeCategory, "name"> | null)?.name ?? null;
}
