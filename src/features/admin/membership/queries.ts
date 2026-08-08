import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MembershipPlan } from "@/types/database";

export async function listAdminMembershipPlans(): Promise<MembershipPlan[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("admin.membership.list_failed");
    return [];
  }
  return (data ?? []) as MembershipPlan[];
}

export async function getAdminMembershipPlan(
  id: string,
): Promise<MembershipPlan | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.membership.get_failed");
    return null;
  }
  return (data as MembershipPlan | null) ?? null;
}
