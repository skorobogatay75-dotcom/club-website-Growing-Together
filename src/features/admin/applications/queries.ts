import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus, ApplicationType } from "@/types/database";

export type ApplicationListItem = Application & {
  programs: { title: string } | null;
  events: { title: string; slug: string } | null;
  membership_plans: { name: string } | null;
};

export async function listAdminApplications(options?: {
  status?: string;
  type?: string;
  q?: string;
}): Promise<ApplicationListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("applications")
    .select(
      "*, programs(title), events(title, slug), membership_plans(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (options?.status) query = query.eq("status", options.status as ApplicationStatus);
  if (options?.type) query = query.eq("type", options.type as ApplicationType);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) {
      query = query.or(
        `parent_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.applications.list_failed");
    return [];
  }
  return (data ?? []) as ApplicationListItem[];
}

export async function getAdminApplication(
  id: string,
): Promise<ApplicationListItem | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("applications")
    .select("*, programs(title), events(title, slug), membership_plans(name)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.applications.get_failed");
    return null;
  }
  return (data as ApplicationListItem | null) ?? null;
}
