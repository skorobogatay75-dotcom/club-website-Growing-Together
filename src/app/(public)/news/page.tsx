import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedNews } from "@/features/news/queries";
import { formatNewsDate } from "@/lib/format/datetime";
import { isPublicText } from "@/lib/content/public-text";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и анонсы семейного клуба «Вместе растём».",
};

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(Number(first(params.page) ?? "1") || 1, 1);
  const { posts, hasMore } = await listPublishedNews(page);

  return (
    <section className="section-space">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Новости
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Публикации о встречах и жизни клуба.
        </p>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted">Пока нет опубликованных новостей.</p>
        ) : (
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {posts.map((post) => {
              const dateLabel = formatNewsDate(post.published_at);
              const excerpt = isPublicText(post.excerpt) ? post.excerpt : null;
              return (
                <li key={post.id}>
                  <article className="h-full">
                    <Link
                      href={`/news/${post.slug}`}
                      className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-5 hover:bg-surface-soft"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted">
                        {post.is_pinned ? (
                          <span className="rounded-md bg-background px-2 py-1 text-foreground">
                            Закреплено
                          </span>
                        ) : null}
                        {dateLabel ? (
                          <time dateTime={post.published_at ?? undefined}>
                            {dateLabel}
                          </time>
                        ) : null}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-foreground">
                        {post.title}
                      </h2>
                      {excerpt ? (
                        <p className="mt-3 flex-1 text-sm text-muted">{excerpt}</p>
                      ) : null}
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore ? (
          <div className="mt-10">
            <Link href={`/news?page=${page + 1}`} className="btn-secondary">
              Показать ещё
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
