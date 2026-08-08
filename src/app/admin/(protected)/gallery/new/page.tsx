import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listEventsForSelect } from "@/features/admin/gallery/queries";
import { saveAlbumAction } from "@/features/admin/gallery/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новый альбом" };

export default async function NewAlbumPage() {
  await requireStaff();
  const events = await listEventsForSelect();

  return (
    <div>
      <AdminPageHeader title="Новый альбом" />
      <form action={saveAlbumAction} className="mt-6 max-w-2xl space-y-4">
        <Field label="Название">
          <input className="field-input" name="title" required />
        </Field>
        <Field label="Slug">
          <input className="field-input" name="slug" />
        </Field>
        <Field label="Описание">
          <textarea className="field-input min-h-24" name="description" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Событие">
            <select className="field-input" name="event_id" defaultValue="">
              <option value="">Не привязано</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дата события">
            <input className="field-input" type="date" name="event_date" />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Создать
          </button>
          <Link href="/admin/gallery" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
