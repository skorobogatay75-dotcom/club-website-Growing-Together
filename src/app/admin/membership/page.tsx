import {
  AdminSectionStub,
  createAdminMetadata,
} from "@/components/admin/AdminSectionStub";

export const metadata = createAdminMetadata("Членство");

export default function AdminMembershipPage() {
  return (
    <AdminSectionStub
      title="Членство"
      description="Управление тарифами членства без публикации выдуманных цен на сайте."
    />
  );
}
