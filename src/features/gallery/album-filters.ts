import type { Album } from "@/types/database";

export type AlbumYearSource = Pick<Album, "event_date" | "published_at">;

export function yearFromAlbum(album: AlbumYearSource): number | null {
  if (album.event_date && /^\d{4}-\d{2}-\d{2}/.test(album.event_date)) {
    return Number(album.event_date.slice(0, 4));
  }
  if (album.published_at) {
    const y = new Date(album.published_at).getFullYear();
    return Number.isFinite(y) ? y : null;
  }
  return null;
}

export function albumYears(albums: AlbumYearSource[]): number[] {
  const years = new Set<number>();
  for (const album of albums) {
    const year = yearFromAlbum(album);
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => b - a);
}

export function filterAlbumsByYear<T extends AlbumYearSource>(
  albums: T[],
  year: string | null | undefined,
): T[] {
  if (!year || !/^\d{4}$/.test(year)) return albums;
  const y = Number(year);
  return albums.filter((album) => yearFromAlbum(album) === y);
}
