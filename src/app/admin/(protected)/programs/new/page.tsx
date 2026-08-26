import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { listDocumentsForProgramPicker } from "@/features/admin/programs/queries";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новая программа" };

export default async function NewProgramPage() {
  await requireStaff();
  const documents = await listDocumentsForProgramPicker();

  return (
    <div>
      <AdminPageHeader title="Новая программа" />
      <div className="mt-6">
        <ProgramForm documents={documents} />
      </div>
    </div>
  );
}
