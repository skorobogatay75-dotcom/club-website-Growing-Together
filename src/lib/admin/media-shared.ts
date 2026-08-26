export const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
export const VIDEO_MIME = new Set(["video/mp4", "video/webm"]);

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export type MediaValidationResult =
  | { ok: true; mime: string; size: number; filename: string }
  | { ok: false; message: string };

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "application/pdf":
      return "pdf";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "bin";
  }
}

export function isVideoMime(mime: string): boolean {
  return VIDEO_MIME.has(mime);
}

export function isImageMime(mime: string): boolean {
  return IMAGE_MIME.has(mime);
}

/** MIME из file.type или по расширению (Windows часто отдаёт пустой type). */
export function resolveUploadMime(file: File): string {
  const fromType = file.type?.trim();
  if (fromType && fromType !== "application/octet-stream") return fromType;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    default:
      return fromType || "";
  }
}

function isHeicFile(file: File): boolean {
  const mime = resolveUploadMime(file);
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

/** Проверка файла альбома (фото/видео) до загрузки. */
export function validateAlbumMediaFile(file: File): MediaValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, message: "Файл не выбран." };
  }
  if (isHeicFile(file)) {
    return {
      ok: false,
      message: "Формат HEIC не поддерживается. Сохраните JPEG, PNG или WebP.",
    };
  }

  const mime = resolveUploadMime(file);
  const isImage = isImageMime(mime);
  const isVideo = isVideoMime(mime);

  if (!isImage && !isVideo) {
    return {
      ok: false,
      message: "Допустимы JPEG, PNG, WebP и видео MP4/WebM.",
    };
  }

  const maxBytes = isVideo ? VIDEO_MAX_BYTES : MEDIA_MAX_BYTES;
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: isVideo
        ? "Размер видео больше 50 МБ. Сожмите фрагмент или укоротите ролик."
        : "Размер изображения больше 10 МБ.",
    };
  }

  return {
    ok: true,
    mime,
    size: file.size,
    filename: file.name,
  };
}
