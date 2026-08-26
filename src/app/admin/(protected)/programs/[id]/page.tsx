import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import {
  getAdminProgram,
  listDocumentsForProgramPicker,
  listProgramDocumentIds,
} from "@/features/admin/programs/queries";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { AdminFlash, AdminPageHeader } from "@/components/admin/ui";
import { decodeAdminError, firstSearchParam } from "@/lib/admin/search-params";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Редактирование программы" };

export default async function EditProgramPage({ params, searchParams }: Props) {
  await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const [program, documents, selectedDocumentIds] = await Promise.all([
    getAdminProgram(id),
    listDocumentsForProgramPicker(),
    listProgramDocumentIds(id),
  ]);
  if (!program) notFound();
  const error = decodeAdminError(query.error);

  return (
    <div>
      <AdminPageHeader title="Редактирование программы" />
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
        <ProgramForm
          program={program}
          documents={documents}
          selectedDocumentIds={selectedDocumentIds}
        />
      </div>
    </div>
  );
}
