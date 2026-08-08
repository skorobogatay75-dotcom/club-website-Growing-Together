import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Программы");

export default function AdminProgramsPage() {
  return (
    <AdminSectionStub
      title="Программы"
      description="CRUD программ, статусы публикации и обложки появятся на этапе админ-панели."
    />
  );
}
