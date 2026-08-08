import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NewsPost } from "@/types/database";

const PAGE_SIZE = 9;

export async function listPublishedNews(page = 1): Promise<{
  posts: NewsPost[];
  hasMore: boolean;
  page: number;
}> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { posts: [], hasMore: false, page };

  const from = Math.max(page - 1, 0) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, is_pinned, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listPublishedNews failed");
    return { posts: [], hasMore: false, page };
  }

  const rows = (data ?? []) as NewsPost[];
  const hasMore = rows.length > PAGE_SIZE;
  return {
    posts: hasMore ? rows.slice(0, PAGE_SIZE) : rows,
    hasMore,
    page,
  };
}

export async function getRelatedNews(
  post: NewsPost,
  limit = 3,
): Promise<NewsPost[]> {
  const { posts } = await listPublishedNews(1);
  return posts.filter((item) => item.id !== post.id).slice(0, limit);
}
