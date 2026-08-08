import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("События");

export default function AdminEventsPage() {
  return (
    <AdminSectionStub
      title="События"
      description="Создание, публикация, отмена и архив событий с предпросмотром карточки календаря — на следующих этапах."
    />
  );
}
