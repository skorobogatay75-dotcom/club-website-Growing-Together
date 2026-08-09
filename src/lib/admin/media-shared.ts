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

/** Проверка файла альбома (фото/видео) до загрузки. */
export function validateAlbumMediaFile(file: File): MediaValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, message: "Файл не выбран." };
  }
  if (file.type === "image/heic" || file.type === "image/heif") {
    return {
      ok: false,
      message: "Формат HEIC не поддерживается. Сохраните JPEG, PNG или WebP.",
    };
  }

  const isImage = isImageMime(file.type);
  const isVideo = isVideoMime(file.type);

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
    mime: file.type,
    size: file.size,
    filename: file.name,
  };
}
