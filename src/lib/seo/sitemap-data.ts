import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SitemapEntry = {
  path: string;
  lastModified?: string | Date;
};

const STATIC_PATHS = [
  "/",
  "/about",
  "/programs",
  "/events",
  "/news",
  "/gallery",
  "/documents",
  "/membership",
  "/apply",
  "/contacts",
  "/privacy",
  "/consent",
  "/offer",
] as const;

export async function collectSitemapEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return entries;

  const [programs, events, news, albums] = await Promise.all([
    supabase
      .from("programs")
      .select("slug, updated_at, published_at")
      .eq("status", "published"),
    supabase
      .from("events")
      .select("slug, updated_at, published_at")
      .eq("status", "published"),
    supabase
      .from("news_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published"),
    supabase
      .from("albums")
      .select("slug, updated_at, published_at")
      .eq("status", "published"),
  ]);

  for (const row of programs.data ?? []) {
    entries.push({
      path: `/programs/${row.slug}`,
      lastModified: (row.updated_at || row.published_at) as string,
    });
  }
  for (const row of events.data ?? []) {
    entries.push({
      path: `/events/${row.slug}`,
      lastModified: (row.updated_at || row.published_at) as string,
    });
  }
  for (const row of news.data ?? []) {
    entries.push({
      path: `/news/${row.slug}`,
      lastModified: (row.updated_at || row.published_at) as string,
    });
  }
  for (const row of albums.data ?? []) {
    entries.push({
      path: `/gallery/${row.slug}`,
      lastModified: (row.updated_at || row.published_at) as string,
    });
  }

  return entries;
}
