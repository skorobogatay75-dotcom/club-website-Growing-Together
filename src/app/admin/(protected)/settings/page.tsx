import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { AdminSectionStub } from "@/components/admin/AdminSectionStub";

export const metadata: Metadata = {
  title: "Настройки",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <AdminSectionStub
      title="Настройки"
      description="Управление site_settings и пользователями доступно только роли admin. CRUD настроек — на следующих этапах."
    />
  );
}
