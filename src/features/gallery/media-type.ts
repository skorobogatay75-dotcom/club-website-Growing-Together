import type { Photo } from "@/types/database";

export type GalleryMediaType = "image" | "video";

export function isVideoMedia(
  item: Pick<Photo, "media_type"> | { media_type?: string | null },
): boolean {
  return item.media_type === "video";
}

export function mediaLabel(item: Pick<Photo, "media_type">): string {
  return isVideoMedia(item) ? "Видео" : "Фото";
}
