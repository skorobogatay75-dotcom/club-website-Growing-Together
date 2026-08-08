import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNewsBySlug } from "@/features/content/queries";
import { getRelatedNews } from "@/features/news/queries";
import { ContentBlocks } from "@/components/public/ContentBlocks";
import { ShareButton } from "@/components/public/ShareButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatNewsDate } from "@/lib/format/datetime";
import { isPublicText } from "@/lib/content/public-text";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { publicStorageUrl } from "@/lib/media/public-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  if (!post) return { title: "Новость не найдена", robots: { index: false } };
  return buildPageMetadata({
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    path: `/news/${post.slug}`,
    imagePath: post.cover_path,
    type: "article",
    publishedTime: post.published_at,
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedNews(post);
  const dateLabel = formatNewsDate(post.published_at);
  const excerpt = isPublicText(post.excerpt) ? post.excerpt : null;
  const image = publicStorageUrl("public-media", post.cover_path);

  return (
    <article className="section-space">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: excerpt,
          path: `/news/${post.slug}`,
          publishedAt: post.published_at,
          image,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Новости", path: "/news" },
          { name: post.title, path: `/news/${post.slug}` },
        ])}
      />
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
        <div className="mt-8">
          <ContentBlocks value={post.content_json} />
        </div>
        <div className="mt-8">
          <ShareButton title={post.title} />
        </div>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground">
              Ещё новости
            </h2>
            <ul className="mt-4 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="text-accent hover:text-accent-hover"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
