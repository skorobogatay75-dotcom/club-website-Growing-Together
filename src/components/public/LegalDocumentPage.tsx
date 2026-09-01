import Link from "next/link";
import {
  findPublishedLegalDocument,
  formatFileSize,
} from "@/features/documents/queries";
import type { LegalDocumentKind } from "@/features/documents/legal";
import { publicStorageUrl } from "@/lib/media/public-url";

type Props = {
  kind: LegalDocumentKind;
  title: string;
  description: string;
};

export async function LegalDocumentPage({ kind, title, description }: Props) {
  const doc = await findPublishedLegalDocument(kind);
  const url = doc
    ? publicStorageUrl("public-documents", doc.storage_path)
    : null;
  const isPdf = doc?.mime_type === "application/pdf";

  return (
    <section className="section-space">
      <div className="container-page max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted">{description}</p>

        {doc && url ? (
          <div className="mt-8 space-y-4">
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">{doc.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {[
                    isPdf ? "PDF" : "DOCX",
                    formatFileSize(doc.size_bytes),
                    doc.version ? `версия ${doc.version}` : null,
                    doc.document_date,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
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
            </div>

            {isPdf ? (
              <iframe
                title={doc.title}
                src={url}
                className="h-[min(80vh,56rem)] w-full rounded-[var(--radius-card)] border border-border bg-surface"
              />
            ) : null}
          </div>
        ) : (
          <p className="mt-8 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4 text-sm text-muted">
            Файл появится здесь после публикации в разделе документов.
          </p>
        )}

        <p className="mt-8">
          <Link
            href="/documents"
            className="text-sm text-accent underline-offset-2 hover:underline"
          >
            Все документы клуба
          </Link>
        </p>
      </div>
    </section>
  );
}
