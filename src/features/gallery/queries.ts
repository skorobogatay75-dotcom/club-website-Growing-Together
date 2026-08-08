import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Album, Photo } from "@/types/database";

export type AlbumListItem = Album;

export async function listPublishedAlbums(): Promise<AlbumListItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("albums")
    .select(
      "id, title, slug, description, cover_photo_id, event_id, event_date, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("listPublishedAlbums failed");
    return [];
  }

  return (data ?? []) as AlbumListItem[];
}

export async function getAlbumPhotos(albumId: string): Promise<Photo[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, album_id, storage_path, width, height, alt, caption, sort_order, created_at, updated_at",
    )
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAlbumPhotos failed");
    return [];
  }

  return (data ?? []) as Photo[];
}
