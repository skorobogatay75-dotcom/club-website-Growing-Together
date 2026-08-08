import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listAdminAlbums } from "@/features/admin/gallery/queries";
import { setAlbumStatusAction } from "@/features/admin/gallery/actions";
import { AdminFlash, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Фотоальбомы" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const albums = await listAdminAlbums({
    q: q || undefined,
    status: status || undefined,
  });

  return (
    <div>
      <AdminPageHeader
        title="Фотоальбомы"
        description="Альбомы и загрузка фото (JPEG/PNG/WebP)."
        actionHref="/admin/gallery/new"
        actionLabel="Новый альбом"
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
        {albums.map((album) => (
          <li
            key={album.id}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/gallery/${album.id}`} className="font-semibold hover:text-accent">
                  {album.title}
                </Link>
                <StatusBadge status={album.status} />
              </div>
              <p className="mt-1 text-xs text-muted">{album.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/gallery/${album.slug}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                На сайте
              </Link>
              <Link href={`/admin/gallery/${album.id}`} className="btn-secondary !min-h-9 !px-3 text-sm">
                Изменить
              </Link>
              {album.status !== "published" ? (
                <form action={setAlbumStatusAction}>
                  <input type="hidden" name="id" value={album.id} />
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
      {albums.length === 0 ? <p className="mt-6 text-sm text-muted">Альбомов нет.</p> : null}
    </div>
  );
}
