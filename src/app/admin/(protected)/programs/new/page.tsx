import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import {
  listAgeCategoriesAdmin,
  listDocumentsForProgramPicker,
} from "@/features/admin/programs/queries";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новая программа" };

export default async function NewProgramPage() {
  await requireStaff();
  const [categories, documents] = await Promise.all([
    listAgeCategoriesAdmin(),
    listDocumentsForProgramPicker(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Новая программа" />
      <div className="mt-6">
        <ProgramForm categories={categories} documents={documents} />
      </div>
    </div>
  );
}
