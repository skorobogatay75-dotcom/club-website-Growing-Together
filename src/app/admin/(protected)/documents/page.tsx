import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import {
  listAdminDocuments,
  listDocumentCategoriesAdmin,
} from "@/features/admin/documents/queries";
import { saveDocumentCategoryAction } from "@/features/admin/documents/actions";
import { AdminFlash, AdminPageHeader, Field, StatusBadge } from "@/components/admin/ui";
import { publicStorageUrl } from "@/lib/media/public-url";

export const metadata: Metadata = { title: "Документы" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireStaff();
  const params = await searchParams;
  const q = first(params.q) ?? "";
  const status = first(params.status) ?? "";
  const categoryId = first(params.category) ?? "";
  const [docs, categories] = await Promise.all([
    listAdminDocuments({
      q: q || undefined,
      status: status || undefined,
      categoryId: categoryId || undefined,
    }),
    listDocumentCategoriesAdmin(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Документы"
        description="PDF и DOCX для публичного раздела."
        actionHref="/admin/documents/new"
        actionLabel="Загрузить документ"
      />
      <AdminFlash
        message={
          first(params.ok) === "1"
            ? "Сохранено."
            : first(params.ok) === "deleted"
              ? "Удалено."
              : first(params.error)
                ? `Ошибка: ${decodeURIComponent(first(params.error)!)}`
                : null
        }
        tone={first(params.error) ? "error" : "ok"}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input className="field-input max-w-xs" name="q" defaultValue={q} placeholder="Поиск" />
        <select className="field-input max-w-[12rem]" name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <select className="field-input max-w-[14rem]" name="category" defaultValue={categoryId}>
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Фильтр
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {docs.map((doc) => {
          const url = publicStorageUrl("public-documents", doc.storage_path);
          return (
            <li
              key={doc.id}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/documents/${doc.id}`}
                    className="font-semibold hover:text-accent"
                  >
                    {doc.title}
                  </Link>
                  <StatusBadge status={doc.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {doc.document_categories?.name ?? "Без категории"} · {doc.mime_type}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {url ? (
                  <a href={url} className="btn-secondary !min-h-9 !px-3 text-sm" target="_blank" rel="noreferrer">
                    Файл
                  </a>
                ) : null}
                <Link
                  href={`/admin/documents/${doc.id}`}
                  className="btn-secondary !min-h-9 !px-3 text-sm"
                >
                  Изменить
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      {docs.length === 0 ? <p className="mt-6 text-sm text-muted">Документов нет.</p> : null}

      <section className="mt-12 max-w-lg space-y-3 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Новая категория</h2>
        <form action={saveDocumentCategoryAction} className="space-y-3">
          <Field label="Название">
            <input className="field-input" name="name" required />
          </Field>
          <Field label="Slug">
            <input className="field-input" name="slug" />
          </Field>
          <button type="submit" className="btn-secondary">
            Добавить категорию
          </button>
        </form>
      </section>
    </div>
  );
}
