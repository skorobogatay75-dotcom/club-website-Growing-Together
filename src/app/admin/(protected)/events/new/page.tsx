import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { listProgramsForSelect } from "@/features/admin/events/queries";
import { EventForm } from "@/components/admin/EventForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новое событие" };

export default async function NewEventPage() {
  await requireStaff();
  const programs = await listProgramsForSelect();
  return (
    <div>
      <AdminPageHeader title="Новое событие" />
      <div className="mt-6">
        <EventForm programs={programs} />
      </div>
    </div>
  );
}
