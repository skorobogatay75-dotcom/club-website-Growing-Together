import Link from "next/link";
import { formatNewsDate } from "@/lib/format/datetime";
import { isPublicText } from "@/lib/content/public-text";
import type { NewsPost } from "@/types/database";

type Props = {
  posts: NewsPost[];
};

export function HomeNews({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="section-space border-b border-border bg-surface/70">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Новости
            </h2>
            <p className="mt-2 max-w-2xl text-muted">
              Короткие обновления о встречах и жизни клуба.
            </p>
          </div>
          <Link
            href="/news"
            className="text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Все новости
          </Link>
        </div>

        <ul className="mt-8 grid gap-6 lg:grid-cols-3">
          {posts.map((post, index) => {
            const dateLabel = formatNewsDate(post.published_at);
            const excerpt = isPublicText(post.excerpt) ? post.excerpt : null;

            return (
              <li key={post.id}>
                <article className="h-full animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-background p-5 transition-colors hover:border-accent-secondary/40 hover:bg-surface"
                  >
                    <div className="flex items-center gap-3 text-xs font-medium text-muted">
                      {post.is_pinned ? (
                        <span className="rounded-md bg-surface-soft px-2 py-1 text-foreground">
                          Закреплено
                        </span>
                      ) : null}
                      {dateLabel ? <time dateTime={post.published_at ?? undefined}>{dateLabel}</time> : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground group-hover:text-accent">
                      {post.title}
                    </h3>
                    {excerpt ? (
                      <p className="mt-3 flex-1 text-sm text-muted">{excerpt}</p>
                    ) : null}
                    <span className="mt-4 text-sm font-semibold text-accent">
                      Читать
                    </span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
