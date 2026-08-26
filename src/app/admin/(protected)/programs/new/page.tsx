import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { listDocumentsForProgramPicker } from "@/features/admin/programs/queries";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { AdminFlash, AdminPageHeader } from "@/components/admin/ui";
import { decodeAdminError } from "@/lib/admin/search-params";

export const metadata: Metadata = { title: "Новая программа" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProgramPage({ searchParams }: Props) {
  await requireStaff();
  const query = await searchParams;
  const documents = await listDocumentsForProgramPicker();
  const error = decodeAdminError(query.error);

  return (
    <div>
      <AdminPageHeader title="Новая программа" />
      <AdminFlash message={error ? `Ошибка: ${error}` : null} tone={error ? "error" : "ok"} />
      <div className="mt-6">
        <ProgramForm documents={documents} />
      </div>
    </div>
  );
}
