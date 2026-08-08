import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminNews } from "@/features/admin/news/queries";
import { setNewsStatusAction } from "@/features/admin/news/actions";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новости" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const posts = await listAdminNews({
    q: q || undefined,
    status: status || undefined,
  });

  return (
    <div>
      <AdminPageHeader
        title="Новости"
        description="Публикации клуба: черновики, закреплённые и архив."
        actionHref="/admin/news/new"
        actionLabel="Новая публикация"
      />
      <AdminFlash
        message={
          first(params.ok) === "1"
            ? "Сохранено."
            : first(params.ok) === "deleted"
              ? "Удалено."
              : first(params.error)
                ? `Ошибка: ${decodeURIComponent(first(params.error)!)}`
                : null
        }
        tone={first(params.error) ? "error" : "ok"}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input className="field-input max-w-xs" name="q" defaultValue={q} placeholder="Поиск" />
        <select className="field-input max-w-[12rem]" name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <button type="submit" className="btn-secondary">
          Фильтр
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/news/${post.id}`} className="font-semibold hover:text-accent">
                  {post.title}
                </Link>
                <StatusBadge status={post.status} />
                {post.is_pinned ? (
                  <span className="text-xs font-medium text-accent">pinned</span>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">{post.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/news/${post.slug}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                На сайте
              </Link>
              <Link href={`/admin/news/${post.id}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                Изменить
              </Link>
              {post.status !== "published" ? (
                <form action={setNewsStatusAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="status" value="published" />
                  <button type="submit" className="btn-primary !min-h-9 !px-3 text-sm">
                    Опубликовать
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {posts.length === 0 ? <p className="mt-6 text-sm text-muted">Новостей нет.</p> : null}
    </div>
  );
}
