import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/media/public-url";
import {
  albumYears,
  filterAlbumsByYear,
} from "@/features/gallery/album-filters";
import type { Album, Photo } from "@/types/database";

export type AlbumWithCover = Album & {
  cover_path: string | null;
  cover_alt: string | null;
};

export { albumYears, filterAlbumsByYear };

async function resolveCovers(albums: Album[]): Promise<AlbumWithCover[]> {
  if (albums.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return albums.map((album) => ({
      ...album,
      cover_path: null,
      cover_alt: null,
    }));
  }

  const coverIds = albums
    .map((album) => album.cover_photo_id)
    .filter((id): id is string => Boolean(id));

  const coverById = new Map<
    string,
    Pick<Photo, "storage_path" | "alt" | "media_type">
  >();
  if (coverIds.length > 0) {
    const { data } = await supabase
      .from("photos")
      .select("id, storage_path, alt, media_type")
      .in("id", coverIds);
    for (const photo of data ?? []) {
      if ((photo.media_type as string | null) === "video") continue;
      coverById.set(photo.id as string, {
        storage_path: photo.storage_path as string,
        alt: photo.alt as string,
        media_type: (photo.media_type as Photo["media_type"]) ?? "image",
      });
    }
  }

  const missingAlbumIds = albums
    .filter((album) => !album.cover_photo_id || !coverById.has(album.cover_photo_id))
    .map((album) => album.id);

  const fallbackByAlbum = new Map<
    string,
    Pick<Photo, "storage_path" | "alt" | "media_type">
  >();
  if (missingAlbumIds.length > 0) {
    const { data } = await supabase
      .from("photos")
      .select("album_id, storage_path, alt, sort_order, media_type")
      .in("album_id", missingAlbumIds)
      .order("sort_order", { ascending: true });

    for (const photo of data ?? []) {
      if ((photo.media_type as string | null) === "video") continue;
      const albumId = photo.album_id as string;
      if (!fallbackByAlbum.has(albumId)) {
        fallbackByAlbum.set(albumId, {
          storage_path: photo.storage_path as string,
          alt: photo.alt as string,
          media_type: (photo.media_type as Photo["media_type"]) ?? "image",
        });
      }
    }
  }

  return albums.map((album) => {
    const cover =
      (album.cover_photo_id ? coverById.get(album.cover_photo_id) : null) ??
      fallbackByAlbum.get(album.id) ??
      null;
    return {
      ...album,
      cover_path: cover?.storage_path ?? null,
      cover_alt: cover?.alt ?? null,
    };
  });
}

export async function listPublishedAlbums(): Promise<AlbumWithCover[]> {
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

  return resolveCovers((data ?? []) as Album[]);
}

export async function getAlbumCoverUrl(
  album: Pick<AlbumWithCover, "cover_path">,
): Promise<string | null> {
  return publicStorageUrl("public-media", album.cover_path);
}

export async function getAlbumPhotos(albumId: string): Promise<Photo[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, album_id, storage_path, media_type, mime_type, width, height, alt, caption, sort_order, created_at, updated_at",
    )
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAlbumPhotos failed");
    return [];
  }

  return (data ?? []) as Photo[];
}

export async function getLatestAlbumWithCover(): Promise<AlbumWithCover | null> {
  const albums = await listPublishedAlbums();
  return albums[0] ?? null;
}
