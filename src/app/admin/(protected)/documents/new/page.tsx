import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listDocumentCategoriesAdmin } from "@/features/admin/documents/queries";
import { saveDocumentAction } from "@/features/admin/documents/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Новый документ" };

export default async function NewDocumentPage() {
  await requireStaff();
  const categories = await listDocumentCategoriesAdmin();

  return (
    <div>
      <AdminPageHeader title="Загрузить документ" />
      <form
        action={saveDocumentAction}
        className="mt-6 max-w-2xl space-y-4"
        encType="multipart/form-data"
      >
        <Field label="Название">
          <input className="field-input" name="title" required />
        </Field>
        <Field label="Категория">
          <select className="field-input" name="category_id" defaultValue="">
            <option value="">Без категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Файл (PDF/DOCX)">
          <input
            className="field-input"
            type="file"
            name="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата документа">
            <input className="field-input" type="date" name="document_date" />
          </Field>
          <Field label="Версия">
            <input className="field-input" name="version" />
          </Field>
          <Field label="Порядок">
            <input className="field-input" type="number" name="sort_order" defaultValue={0} />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue="draft">
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
          <Link href="/admin/documents" className="btn-secondary">
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}
