import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Event, Program } from "@/types/database";

export async function listAdminEvents(options?: {
  q?: string;
  status?: string;
  month?: string;
}): Promise<Event[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  if (options?.month && /^\d{4}-\d{2}$/.test(options.month)) {
    const start = `${options.month}-01T00:00:00.000Z`;
    const [y, m] = options.month.split("-").map(Number);
    const endDate = new Date(Date.UTC(y, m, 1));
    query = query.gte("starts_at", start).lt("starts_at", endDate.toISOString());
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.events.list_failed");
    return [];
  }
  return (data ?? []) as Event[];
}

export async function getAdminEvent(id: string): Promise<Event | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.events.get_failed");
    return null;
  }
  return (data as Event | null) ?? null;
}

export async function listProgramsForSelect(): Promise<
  Pick<Program, "id" | "title">[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("programs")
    .select("id, title")
    .order("title", { ascending: true });
  return (data ?? []) as Pick<Program, "id" | "title">[];
}
