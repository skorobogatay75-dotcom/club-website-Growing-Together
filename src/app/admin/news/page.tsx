import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Новости");

export default function AdminNewsPage() {
  return (
    <AdminSectionStub
      title="Новости"
      description="Редактор публикаций с безопасным rich text будет добавлен позже."
    />
  );
}
