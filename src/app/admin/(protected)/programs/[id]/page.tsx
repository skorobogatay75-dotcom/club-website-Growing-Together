import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import {
  getAdminProgram,
  listAgeCategoriesAdmin,
  listDocumentsForProgramPicker,
  listProgramDocumentIds,
} from "@/features/admin/programs/queries";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { AdminPageHeader } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Редактирование программы" };

export default async function EditProgramPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const [program, categories, documents, selectedDocumentIds] = await Promise.all([
    getAdminProgram(id),
    listAgeCategoriesAdmin(),
    listDocumentsForProgramPicker(),
    listProgramDocumentIds(id),
  ]);
  if (!program) notFound();

  return (
    <div>
      <AdminPageHeader title="Редактирование программы" />
      <div className="mt-6">
        <ProgramForm
          program={program}
          categories={categories}
          documents={documents}
          selectedDocumentIds={selectedDocumentIds}
        />
      </div>
    </div>
  );
}
