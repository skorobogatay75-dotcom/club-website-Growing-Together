import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgeCategory, Program } from "@/types/database";

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
