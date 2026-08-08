import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import {
  getAdminAlbum,
  listAlbumPhotos,
  listEventsForSelect,
} from "@/features/admin/gallery/queries";
import {
  saveAlbumAction,
  deleteAlbumAction,
  setAlbumStatusAction,
  uploadPhotosAction,
  updatePhotoAction,
  deletePhotoAction,
  setAlbumCoverAction,
} from "@/features/admin/gallery/actions";
import { AdminFlash, AdminPageHeader, Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { publicStorageUrl } from "@/lib/media/public-url";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Альбом" };

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function EditAlbumPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const sp = await searchParams;
  const [album, photos, events] = await Promise.all([
    getAdminAlbum(id),
    listAlbumPhotos(id),
    listEventsForSelect(),
  ]);
  if (!album) notFound();

  return (
    <div>
      <AdminPageHeader title={album.title} />
      <AdminFlash
        message={
          first(sp.ok) === "1"
            ? "Сохранено."
            : first(sp.error)
              ? `Ошибка: ${decodeURIComponent(first(sp.error)!)}`
              : null
        }
        tone={first(sp.error) ? "error" : "ok"}
      />

      <form action={saveAlbumAction} className="mt-6 max-w-2xl space-y-4">
        <input type="hidden" name="id" value={album.id} />
        <Field label="Название">
          <input className="field-input" name="title" required defaultValue={album.title} />
        </Field>
        <Field label="Slug">
          <input className="field-input" name="slug" defaultValue={album.slug} />
        </Field>
        <Field label="Описание">
          <textarea
            className="field-input min-h-24"
            name="description"
            defaultValue={album.description ?? ""}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Событие">
            <select className="field-input" name="event_id" defaultValue={album.event_id ?? ""}>
              <option value="">Не привязано</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дата события">
            <input
              className="field-input"
              type="date"
              name="event_date"
              defaultValue={album.event_date ?? ""}
            />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={album.status}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Сохранить альбом
          </button>
          <Link href={`/gallery/${album.slug}`} className="btn-secondary">
            На сайте
          </Link>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-3">
        <form action={setAlbumStatusAction}>
          <input type="hidden" name="id" value={album.id} />
          <input type="hidden" name="status" value="published" />
          <button type="submit" className="btn-secondary">
            Опубликовать
          </button>
        </form>
        <ConfirmDeleteButton
          action={deleteAlbumAction}
          id={album.id}
          confirmMessage="Удалить альбом и все фото?"
        />
      </div>

      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold">Фотографии</h2>
        <form
          action={uploadPhotosAction}
          className="flex flex-wrap items-end gap-3"
          encType="multipart/form-data"
        >
          <input type="hidden" name="album_id" value={album.id} />
          <Field label="Загрузить (несколько файлов)">
            <input
              className="field-input"
              type="file"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              multiple
            />
          </Field>
          <button type="submit" className="btn-primary">
            Загрузить
          </button>
        </form>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const url = publicStorageUrl("public-media", photo.storage_path);
            const isCover = album.cover_photo_id === photo.id;
            return (
              <li
                key={photo.id}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-3"
              >
                {url ? (
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-surface-soft">
                    <Image
                      src={url}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="mb-3 text-xs text-muted">{photo.storage_path}</p>
                )}
                <form action={updatePhotoAction} className="space-y-2">
                  <input type="hidden" name="id" value={photo.id} />
                  <input type="hidden" name="album_id" value={album.id} />
                  <input
                    className="field-input"
                    name="alt"
                    defaultValue={photo.alt}
                    placeholder="Alt"
                    required
                  />
                  <input
                    className="field-input"
                    name="caption"
                    defaultValue={photo.caption ?? ""}
                    placeholder="Подпись"
                  />
                  <input
                    className="field-input"
                    type="number"
                    name="sort_order"
                    defaultValue={photo.sort_order}
                    placeholder="Порядок"
                  />
                  <button type="submit" className="btn-secondary !min-h-9 !px-3 text-sm">
                    Сохранить
                  </button>
                </form>
                <div className="mt-2 flex flex-wrap gap-2">
                  {isCover ? (
                    <span className="self-center text-xs font-medium text-accent">Обложка</span>
                  ) : (
                    <form action={setAlbumCoverAction}>
                      <input type="hidden" name="album_id" value={album.id} />
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <button type="submit" className="btn-secondary !min-h-9 !px-3 text-sm">
                        В обложку
                      </button>
                    </form>
                  )}
                  <ConfirmDeleteButton
                    action={deletePhotoAction}
                    id={photo.id}
                    label="Удалить фото"
                    confirmMessage="Удалить фото?"
                    hiddenFields={{ album_id: album.id }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {photos.length === 0 ? (
          <p className="text-sm text-muted">Пока нет фотографий.</p>
        ) : null}
      </section>
    </div>
  );
}
