import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import {
  getAdminDocument,
  listDocumentCategoriesAdmin,
} from "@/features/admin/documents/queries";
import {
  saveDocumentAction,
  deleteDocumentAction,
} from "@/features/admin/documents/actions";
import { AdminPageHeader, Field } from "@/components/admin/ui";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { publicStorageUrl } from "@/lib/media/public-url";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Документ" };

export default async function EditDocumentPage({ params }: Props) {
  await requireStaff();
  const { id } = await params;
  const [doc, categories] = await Promise.all([
    getAdminDocument(id),
    listDocumentCategoriesAdmin(),
  ]);
  if (!doc) notFound();
  const url = publicStorageUrl("public-documents", doc.storage_path);

  return (
    <div>
      <AdminPageHeader title="Редактирование документа" />
      <form
        action={saveDocumentAction}
        className="mt-6 max-w-2xl space-y-4"
        encType="multipart/form-data"
      >
        <input type="hidden" name="id" value={doc.id} />
        <input type="hidden" name="storage_path" value={doc.storage_path} />
        <input type="hidden" name="mime_type" value={doc.mime_type} />
        <input type="hidden" name="size_bytes" value={String(doc.size_bytes)} />
        <input type="hidden" name="public_filename" value={doc.public_filename} />

        <Field label="Название">
          <input className="field-input" name="title" required defaultValue={doc.title} />
        </Field>
        <Field label="Категория">
          <select className="field-input" name="category_id" defaultValue={doc.category_id ?? ""}>
            <option value="">Без категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Заменить файл (PDF/DOCX)">
          <input
            className="field-input"
            type="file"
            name="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          {url ? (
            <a href={url} className="mt-1 block text-xs text-accent underline" target="_blank" rel="noreferrer">
              Текущий файл
            </a>
          ) : null}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата документа">
            <input
              className="field-input"
              type="date"
              name="document_date"
              defaultValue={doc.document_date ?? ""}
            />
          </Field>
          <Field label="Версия">
            <input className="field-input" name="version" defaultValue={doc.version ?? ""} />
          </Field>
          <Field label="Порядок">
            <input
              className="field-input"
              type="number"
              name="sort_order"
              defaultValue={doc.sort_order}
            />
          </Field>
          <Field label="Статус">
            <select className="field-input" name="status" defaultValue={doc.status}>
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
      <div className="mt-6">
        <ConfirmDeleteButton
          action={deleteDocumentAction}
          id={doc.id}
          confirmMessage="Удалить документ?"
        />
      </div>
    </div>
  );
}
