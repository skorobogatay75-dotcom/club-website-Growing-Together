import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardData = {
  newApplications: number;
  upcomingEvents: { id: string; title: string; slug: string; starts_at: string }[];
  draftCounts: {
    programs: number;
    events: number;
    news: number;
  };
  latestNews: { id: string; title: string; slug: string; status: string }[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const empty: AdminDashboardData = {
    newApplications: 0,
    upcomingEvents: [],
    draftCounts: { programs: 0, events: 0, news: 0 },
    latestNews: [],
  };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;

  const now = new Date().toISOString();

  const [apps, events, programsDraft, eventsDraft, newsDraft, latestNews] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("events")
        .select("id, title, slug, starts_at")
        .eq("status", "published")
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(5),
      supabase
        .from("programs")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("news_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase
        .from("news_posts")
        .select("id, title, slug, status")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  return {
    newApplications: apps.count ?? 0,
    upcomingEvents: (events.data ?? []) as AdminDashboardData["upcomingEvents"],
    draftCounts: {
      programs: programsDraft.count ?? 0,
      events: eventsDraft.count ?? 0,
      news: newsDraft.count ?? 0,
    },
    latestNews: (latestNews.data ?? []) as AdminDashboardData["latestNews"],
  };
}
