import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Document, DocumentCategory } from "@/types/database";

export type DocumentListItem = Document & {
  document_categories: { name: string } | null;
};

export async function listAdminDocuments(options?: {
  q?: string;
  status?: string;
  categoryId?: string;
}): Promise<DocumentListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("documents")
    .select("*, document_categories(name)")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.categoryId) query = query.eq("category_id", options.categoryId);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) query = query.ilike("title", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.documents.list_failed");
    return [];
  }
  return (data ?? []) as DocumentListItem[];
}

export async function getAdminDocument(id: string): Promise<Document | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.documents.get_failed");
    return null;
  }
  return (data as Document | null) ?? null;
}

export async function listDocumentCategoriesAdmin(): Promise<DocumentCategory[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("document_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as DocumentCategory[];
}
