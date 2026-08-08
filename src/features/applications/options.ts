import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AgeCategory, Event, MembershipPlan, Program } from "@/types/database";

export type ApplicationFormOptions = {
  programs: Pick<Program, "id" | "title" | "slug">[];
  events: Pick<Event, "id" | "title" | "slug" | "starts_at">[];
  plans: Pick<MembershipPlan, "id" | "name" | "slug">[];
  ageCategories: Pick<AgeCategory, "id" | "name" | "slug">[];
};

export async function getApplicationFormOptions(): Promise<ApplicationFormOptions> {
  const empty: ApplicationFormOptions = {
    programs: [],
    events: [],
    plans: [],
    ageCategories: [],
  };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;

  const [programs, events, plans, ageCategories] = await Promise.all([
    supabase
      .from("programs")
      .select("id, title, slug")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase
      .from("events")
      .select("id, title, slug, starts_at")
      .eq("status", "published")
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(40),
    supabase
      .from("membership_plans")
      .select("id, name, slug")
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase
      .from("age_categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    programs: (programs.data ?? []) as ApplicationFormOptions["programs"],
    events: (events.data ?? []) as ApplicationFormOptions["events"],
    plans: (plans.data ?? []) as ApplicationFormOptions["plans"],
    ageCategories: (ageCategories.data ??
      []) as ApplicationFormOptions["ageCategories"],
  };
}
