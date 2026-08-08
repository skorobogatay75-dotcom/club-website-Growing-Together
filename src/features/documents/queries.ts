import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Document, DocumentCategory } from "@/types/database";

export type DocumentWithCategory = Document & {
  document_categories: Pick<DocumentCategory, "name" | "slug"> | null;
};

export async function listPublishedDocuments(): Promise<{
  categories: DocumentCategory[];
  documents: DocumentWithCategory[];
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { categories: [], documents: [] };

  const [categoriesResult, documentsResult] = await Promise.all([
    supabase
      .from("document_categories")
      .select(
        "id, name, slug, description, sort_order, is_active, created_at, updated_at",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("documents")
      .select(
        "id, category_id, title, storage_path, public_filename, mime_type, size_bytes, document_date, version, sort_order, status, created_by, updated_by, created_at, updated_at, document_categories ( name, slug )",
      )
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
  ]);

  if (categoriesResult.error) console.error("list document categories failed");
  if (documentsResult.error) console.error("list documents failed");

  const documents = (
    (documentsResult.data ?? []) as Array<Document & { document_categories?: unknown }>
  ).map((row) => {
    const cat = row.document_categories;
    const normalized = Array.isArray(cat) ? cat[0] ?? null : cat ?? null;
    return {
      ...row,
      document_categories: normalized as Pick<DocumentCategory, "name" | "slug"> | null,
    } as DocumentWithCategory;
  });

  return {
    categories: (categoriesResult.data ?? []) as DocumentCategory[],
    documents,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
