import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getAdminNews } from "@/features/admin/news/queries";
import { NewsForm } from "@/components/admin/NewsForm";
import { AdminPageHeader } from "@/components/admin/ui";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Редактирование новости" };

export default async function EditNewsPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const news = await getAdminNews(id);
  if (!news) notFound();
  return (
    <div>
      <AdminPageHeader title="Редактирование новости" />
      <div className="mt-6">
        <NewsForm news={news} />
      </div>
    </div>
  );
}
