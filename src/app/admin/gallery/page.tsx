import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Фотоальбомы");

export default function AdminGalleryPage() {
  return (
    <AdminSectionStub
      title="Фотоальбомы"
      description="Пакетная загрузка, сортировка и проверка MIME появятся вместе со Storage."
    />
  );
}
