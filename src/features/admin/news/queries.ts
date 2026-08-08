import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/types/database";

export async function listAdminNews(options?: {
  q?: string;
  status?: string;
}): Promise<NewsPost[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("news_posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.news.list_failed");
    return [];
  }
  return (data ?? []) as NewsPost[];
}

export async function getAdminNews(id: string): Promise<NewsPost | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.news.get_failed");
    return null;
  }
  return (data as NewsPost | null) ?? null;
}
