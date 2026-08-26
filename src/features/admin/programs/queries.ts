import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgeCategory, Document, Program } from "@/types/database";

export async function listAdminPrograms(options?: {
  q?: string;
  status?: string;
}): Promise<Program[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("programs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.programs.list_failed");
    return [];
  }
  return (data ?? []) as Program[];
}

export async function getAdminProgram(id: string): Promise<Program | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.programs.get_failed");
    return null;
  }
  return (data as Program | null) ?? null;
}

export async function listAgeCategoriesAdmin(): Promise<AgeCategory[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("age_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as AgeCategory[];
}

export async function listProgramDocumentIds(programId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("program_documents")
    .select("document_id")
    .eq("program_id", programId)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("admin.programs.documents_list_failed");
    return [];
  }
  return (data ?? []).map((row) => row.document_id as string);
}

export async function listDocumentsForProgramPicker(): Promise<
  Pick<Document, "id" | "title" | "status" | "mime_type">[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, status, mime_type")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) {
    console.error("admin.programs.documents_picker_failed");
    return [];
  }
  return (data ?? []) as Pick<Document, "id" | "title" | "status" | "mime_type">[];
}
