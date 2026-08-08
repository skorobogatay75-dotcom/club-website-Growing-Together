import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { listAgeCategoriesAdmin } from "@/features/admin/programs/queries";
import { getAdminEvent, listProgramsForSelect } from "@/features/admin/events/queries";
import { EventForm } from "@/components/admin/EventForm";
import { AdminPageHeader } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Редактирование события" };

export default async function EditEventPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const [event, categories, programs] = await Promise.all([
    getAdminEvent(id),
    listAgeCategoriesAdmin(),
    listProgramsForSelect(),
  ]);
  if (!event) notFound();
  return (
    <div>
      <AdminPageHeader title="Редактирование события" />
      <div className="mt-6">
        <EventForm event={event} categories={categories} programs={programs} />
      </div>
    </div>
  );
}
