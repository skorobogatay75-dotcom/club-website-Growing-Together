import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Event, NewsPost, Program, Album } from "@/types/database";

export async function getPublishedNewsBySlug(
  slug: string,
): Promise<NewsPost | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, is_pinned, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPublishedNewsBySlug failed");
    return null;
  }

  return (data as NewsPost | null) ?? null;
}

export async function getPublishedEventBySlug(
  slug: string,
): Promise<Event | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, program_id, title, slug, excerpt, content_json, cover_path, age_category_id, audience_type, format, starts_at, ends_at, timezone, venue, price_text, capacity, registration_status, featured, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPublishedEventBySlug failed");
    return null;
  }

  return (data as Event | null) ?? null;
}

export async function getPublishedProgramBySlug(
  slug: string,
): Promise<Program | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, age_category_id, age_text, audience_type, format, duration_text, price_text, enrollment_status, featured, sort_order, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPublishedProgramBySlug failed");
    return null;
  }

  return (data as Program | null) ?? null;
}

export async function getPublishedAlbumBySlug(
  slug: string,
): Promise<Album | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("albums")
    .select(
      "id, title, slug, description, cover_photo_id, event_id, event_date, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPublishedAlbumBySlug failed");
    return null;
  }

  return (data as Album | null) ?? null;
}
