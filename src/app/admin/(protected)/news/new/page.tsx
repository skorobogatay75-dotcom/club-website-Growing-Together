import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { NewsForm } from "@/components/admin/NewsForm";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новая новость" };

export default async function NewNewsPage() {
  await requireStaff();
  return (
    <div>
      <AdminPageHeader title="Новая публикация" />
      <div className="mt-6">
        <NewsForm />
      </div>
    </div>
  );
}
