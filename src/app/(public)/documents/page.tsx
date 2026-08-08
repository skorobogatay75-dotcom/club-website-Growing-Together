import type { Metadata } from "next";
import {
  formatFileSize,
  listPublishedDocuments,
} from "@/features/documents/queries";
import { publicStorageUrl } from "@/lib/media/public-url";

export const metadata: Metadata = {
  title: "Документы",
  description: "Публичные документы семейного клуба «Вместе растём».",
};

export const revalidate = 60;

export default async function DocumentsPage() {
  const { categories, documents } = await listPublishedDocuments();

  return (
    <section className="section-space">
      <div className="container-page max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Документы
        </h1>
        <p className="mt-3 text-muted">
          Материалы для семей: правила, согласия и другие утверждённые файлы.
        </p>

        {documents.length === 0 ? (
          <p className="mt-10 text-muted">
            Пока нет опубликованных документов.
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            {categories.map((category) => {
              const items = documents.filter(
                (doc) => doc.category_id === category.id,
              );
              if (items.length === 0) return null;
              return (
                <section key={category.id}>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.name}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {items.map((doc) => {
                      const url = publicStorageUrl(
                        "public-documents",
                        doc.storage_path,
                      );
                      const ext =
                        doc.mime_type === "application/pdf" ? "PDF" : "DOCX";
                      return (
                        <li
                          key={doc.id}
                          className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {doc.title}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {[
                                ext,
                                formatFileSize(doc.size_bytes),
                                doc.version ? `версия ${doc.version}` : null,
                                doc.document_date,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {url ? (
                            <div className="flex flex-wrap gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                              >
                                Открыть
                              </a>
                              <a
                                href={url}
                                download={doc.public_filename}
                                className="btn-primary"
                              >
                                Скачать
                              </a>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            {documents.some((doc) => !doc.category_id) ? (
              <section>
                <h2 className="text-xl font-semibold text-foreground">Прочее</h2>
                <ul className="mt-4 space-y-3">
                  {documents
                    .filter((doc) => !doc.category_id)
                    .map((doc) => {
                      const url = publicStorageUrl(
                        "public-documents",
                        doc.storage_path,
                      );
                      return (
                        <li
                          key={doc.id}
                          className="rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4"
                        >
                          <p className="font-semibold">{doc.title}</p>
                          {url ? (
                            <a href={url} className="btn-secondary mt-3 inline-flex">
                              Открыть
                            </a>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
