import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Album, Event, Photo } from "@/types/database";

export type AlbumListItem = Album & { photos: { count: number }[] };

export async function listAdminAlbums(options?: {
  q?: string;
  status?: string;
}): Promise<Album[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("albums")
    .select("*")
    .order("updated_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.q) {
    const q = options.q.replace(/[%_,]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin.albums.list_failed");
    return [];
  }
  return (data ?? []) as Album[];
}

export async function getAdminAlbum(id: string): Promise<Album | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("admin.albums.get_failed");
    return null;
  }
  return (data as Album | null) ?? null;
}

export async function listAlbumPhotos(albumId: string): Promise<Photo[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("admin.photos.list_failed");
    return [];
  }
  return (data ?? []) as Photo[];
}

export async function listEventsForSelect(): Promise<
  Pick<Event, "id" | "title">[]
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Pick<Event, "id" | "title">[];
}
