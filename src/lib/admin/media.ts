import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  extensionForMime,
  validateAlbumMediaFile,
} from "@/lib/admin/media-shared";

export {
  extensionForMime,
  IMAGE_MIME,
  isImageMime,
  isVideoMime,
  MEDIA_MAX_BYTES,
  validateAlbumMediaFile,
  VIDEO_MAX_BYTES,
  VIDEO_MIME,
} from "@/lib/admin/media-shared";

const DOC_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const DOC_MAX_BYTES = 20 * 1024 * 1024;

export type UploadResult =
  | { ok: true; path: string; mime: string; size: number; filename: string }
  | { ok: false; message: string };

export async function uploadPublicMedia(
  file: File,
  folder: string,
): Promise<UploadResult> {
  const validated = validateAlbumMediaFile(file);
  if (!validated.ok) return validated;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Storage недоступен." };
  }

  const path = `${folder}/${randomUUID()}.${extensionForMime(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("media.upload_failed");
    return { ok: false, message: "Не удалось загрузить файл." };
  }

  return {
    ok: true,
    path,
    mime: file.type,
    size: file.size,
    filename: file.name,
  };
}

export async function uploadPublicDocument(
  file: File,
  folder: string,
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, message: "Файл не выбран." };
  }
  if (!DOC_MIME.has(file.type)) {
    return { ok: false, message: "Допустимы только PDF и DOCX." };
  }
  if (file.size > DOC_MAX_BYTES) {
    return { ok: false, message: "Размер документа больше 20 МБ." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Storage недоступен." };
  }

  const path = `${folder}/${randomUUID()}.${extensionForMime(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("public-documents")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("document.upload_failed");
    return { ok: false, message: "Не удалось загрузить документ." };
  }

  return {
    ok: true,
    path,
    mime: file.type,
    size: file.size,
    filename: file.name,
  };
}

export async function deleteStorageObject(
  bucket: "public-media" | "public-documents",
  path: string | null | undefined,
): Promise<void> {
  if (!path || path.startsWith("http")) return;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("storage.delete_failed");
  }
}

export async function isMediaPathReferenced(path: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return true;

  const checks = await Promise.all([
    supabase.from("programs").select("id").eq("cover_path", path).limit(1),
    supabase.from("events").select("id").eq("cover_path", path).limit(1),
    supabase.from("news_posts").select("id").eq("cover_path", path).limit(1),
    supabase.from("photos").select("id").eq("storage_path", path).limit(1),
    supabase.from("team_members").select("id").eq("photo_path", path).limit(1),
  ]);

  return checks.some((result) => (result.data?.length ?? 0) > 0);
}
