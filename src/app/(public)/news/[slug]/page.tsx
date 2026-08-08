import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNewsBySlug } from "@/features/content/queries";
import { formatNewsDate } from "@/lib/format/datetime";
import { isPublicText } from "@/lib/content/public-text";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  if (!post) return { title: "Новость не найдена" };
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  if (!post) notFound();

  const dateLabel = formatNewsDate(post.published_at);
  const excerpt = isPublicText(post.excerpt) ? post.excerpt : null;

  return (
    <article className="section-space">
      <div className="container-page max-w-3xl">
        <p className="text-sm text-muted">
          <Link href="/news" className="hover:text-foreground">
            ← Новости
          </Link>
        </p>
        {dateLabel ? (
          <time
            className="mt-6 block text-sm text-muted"
            dateTime={post.published_at ?? undefined}
          >
            {dateLabel}
          </time>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        {excerpt ? <p className="mt-5 text-lg text-muted">{excerpt}</p> : null}
        <p className="mt-10 text-sm text-muted">
          Полный текст с безопасной отрисовкой rich text появится на следующем
          этапе каталогов.
        </p>
      </div>
    </article>
  );
}
