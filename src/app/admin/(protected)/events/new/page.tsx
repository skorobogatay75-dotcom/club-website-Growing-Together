import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { listProgramsForSelect } from "@/features/admin/events/queries";
import { EventForm } from "@/components/admin/EventForm";
import { AdminFlash, AdminPageHeader } from "@/components/admin/ui";
import { decodeAdminError } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Новое событие" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewEventPage({ searchParams }: Props) {
  await requireStaff();
  const query = await searchParams;
  const programs = await listProgramsForSelect();
  const error = decodeAdminError(query.error);
  return (
    <div>
      <AdminPageHeader title="Новое событие" />
      <AdminFlash message={error ? `Ошибка: ${error}` : null} tone={error ? "error" : "ok"} />
      <div className="mt-6">
        <EventForm programs={programs} />
      </div>
    </div>
  );
}
