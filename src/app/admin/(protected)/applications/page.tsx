import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Заявки");

export default function AdminApplicationsPage() {
  return (
    <AdminSectionStub
      title="Заявки"
      description="Фильтры, заметки менеджера и экспорт CSV появятся после модуля заявок."
    />
  );
}
