import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardData } from "@/features/admin/dashboard";
import { formatEventDateTime } from "@/lib/format/datetime";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Обзор",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireStaff();
  const data = await getAdminDashboardData();
  const params = await searchParams;
  const notice =
    first(params.error) === "admin-only"
      ? "Раздел настроек доступен только администратору."
      : null;

  return (
    <main>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Обзор
      </h1>
      <p className="mt-2 text-sm text-muted">
        Здравствуйте
        {session.profile.full_name ? `, ${session.profile.full_name}` : ""}.
        Ниже — быстрый срез заявок и контента.
      </p>

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-[var(--radius-button)] bg-brand-powder/70 px-3 py-2 text-sm"
        >
          {notice}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Новые заявки"
          value={String(data.newApplications)}
          href="/admin/applications"
        />
        <StatCard
          label="Черновики программ"
          value={String(data.draftCounts.programs)}
          href="/admin/programs"
        />
        <StatCard
          label="Черновики событий"
          value={String(data.draftCounts.events)}
          href="/admin/events"
        />
        <StatCard
          label="Черновики новостей"
          value={String(data.draftCounts.news)}
          href="/admin/news"
        />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Ближайшие события
          </h2>
          <Link href="/admin/events" className="text-sm font-medium text-accent">
            Все события
          </Link>
        </div>
        {data.upcomingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Нет ближайших опубликованных событий.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.upcomingEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="block rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 text-sm hover:bg-surface-soft"
                >
                  <span className="font-medium text-foreground">{event.title}</span>
                  <span className="mt-1 block text-muted">
                    {formatEventDateTime(event.starts_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Последние публикации
          </h2>
          <Link href="/admin/news" className="text-sm font-medium text-accent">
            Новости
          </Link>
        </div>
        {data.latestNews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Пока нет новостей.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.latestNews.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-border px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">{post.title}</span>
                <span className="text-xs uppercase tracking-wide text-muted">
                  {post.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Быстрые действия</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/events" className="btn-primary">
            События
          </Link>
          <Link href="/admin/applications" className="btn-secondary">
            Заявки
          </Link>
          <Link href="/admin/gallery" className="btn-secondary">
            Альбомы
          </Link>
          <Link href="/admin/team" className="btn-secondary">
            Команда
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">
          После публикации контент сразу появляется на сайте. Инструкции:{" "}
          <code className="rounded bg-surface-soft px-1">docs/ADMIN.md</code> в
          репозитории.
        </p>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 transition-colors hover:bg-surface-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </Link>
  );
}
