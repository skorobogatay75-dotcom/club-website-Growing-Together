import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Документы");

export default function AdminDocumentsPage() {
  return (
    <AdminSectionStub
      title="Документы"
      description="Категории и загрузка PDF/DOCX с лимитом размера — на этапе документов."
    />
  );
}
