import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getAdminEvent, listProgramsForSelect } from "@/features/admin/events/queries";
import { EventForm } from "@/components/admin/EventForm";
import { AdminFlash, AdminPageHeader } from "@/components/admin/ui";
import { decodeAdminError, firstSearchParam } from "@/lib/admin/search-params";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export const metadata: Metadata = { title: "Редактирование события" };

export default async function EditEventPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const [event, programs] = await Promise.all([
    getAdminEvent(id),
    listProgramsForSelect(),
  ]);
  if (!event) notFound();
  const error = decodeAdminError(query.error);
  return (
    <div>
      <AdminPageHeader title="Редактирование события" />
      <AdminFlash
        message={
          error
            ? `Ошибка: ${error}`
            : firstSearchParam(query.ok) === "1"
              ? "Сохранено."
              : null
        }
        tone={error ? "error" : "ok"}
      />
      <div className="mt-6">
        <EventForm event={event} programs={programs} />
      </div>
    </div>
  );
}
