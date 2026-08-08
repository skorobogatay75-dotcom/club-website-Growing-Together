import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Настройки");

export default function AdminSettingsPage() {
  return (
    <AdminSectionStub
      title="Настройки"
      description="Контакты, часовой пояс и прочие site_settings. Секреты здесь не хранятся."
    />
  );
}
