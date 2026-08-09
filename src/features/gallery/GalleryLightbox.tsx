"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { isPublicText } from "@/lib/content/public-text";
import { publicStorageUrl } from "@/lib/media/public-url";
import { isVideoMedia } from "@/features/gallery/media-type";
import type { Photo } from "@/types/database";

type Props = {
  photos: Photo[];
};

function itemTitle(item: Photo) {
  if (isPublicText(item.alt)) return item.alt;
  return isVideoMedia(item) ? "Видео с встречи клуба" : "Фотография с встречи клуба";
}

export function GalleryLightbox({ photos }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const show = index !== null ? photos[index] : null;
  const src = show
    ? publicStorageUrl("public-media", show.storage_path)
    : null;
  const showIsVideo = show ? isVideoMedia(show) : false;

  useEffect(() => {
    if (index === null) {
      if (lastFocusRef.current) {
        lastFocusRef.current.focus();
        lastFocusRef.current = null;
      }
      return;
    }

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) =>
          current === null ? 0 : (current + 1) % photos.length,
        );
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) =>
          current === null
            ? 0
            : (current - 1 + photos.length) % photos.length,
        );
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, video, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close, index, photos.length]);

  const onThumbKey = (event: ReactKeyboardEvent, photoIndex: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIndex(photoIndex);
    }
  };

  if (photos.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted">
        В этом альбоме пока нет фотографий и видео.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, photoIndex) => {
          const url = publicStorageUrl("public-media", photo.storage_path);
          const title = itemTitle(photo);
          const video = isVideoMedia(photo);
          return (
            <li key={photo.id}>
              <button
                type="button"
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
                onClick={() => setIndex(photoIndex)}
                onKeyDown={(event) => onThumbKey(event, photoIndex)}
                aria-label={
                  video ? `Открыть видео: ${title}` : `Открыть фото: ${title}`
                }
              >
                {url && video ? (
                  <>
                    <video
                      src={url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-ink/25">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft">
                        <Play aria-hidden="true" size={22} fill="currentColor" />
                      </span>
                    </span>
                    <span className="absolute left-3 top-3 rounded-[var(--radius-button)] bg-background/90 px-2 py-1 text-xs font-semibold text-foreground">
                      Видео
                    </span>
                  </>
                ) : url ? (
                  <Image
                    src={url}
                    alt={title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-4 text-sm text-muted">
                    Файл недоступен
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {show && src ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-brand-ink/70"
            aria-label="Закрыть просмотр"
            onClick={close}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-5xl flex-col"
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <p id={titleId} className="text-sm font-medium">
                {itemTitle(show)}
                {isPublicText(show.caption) ? ` — ${show.caption}` : ""}
                <span className="ml-2 text-white/70">
                  {(index ?? 0) + 1} / {photos.length}
                </span>
              </p>
              <button
                ref={closeRef}
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-white/40"
                aria-label="Закрыть"
                onClick={close}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="relative flex min-h-[50dvh] flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-brand-ink">
              {showIsVideo ? (
                <video
                  key={show.id}
                  src={src}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-[75dvh] w-full object-contain"
                >
                  Ваш браузер не поддерживает воспроизведение видео.
                </video>
              ) : (
                <Image
                  src={src}
                  alt={itemTitle(show)}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div className="mt-3 flex justify-between gap-3">
              <button
                type="button"
                className="btn-secondary"
                aria-label="Предыдущий файл"
                onClick={() =>
                  setIndex((current) =>
                    current === null
                      ? 0
                      : (current - 1 + photos.length) % photos.length,
                  )
                }
              >
                <ChevronLeft aria-hidden="true" size={18} />
                Назад
              </button>
              <button
                type="button"
                className="btn-secondary"
                aria-label="Следующий файл"
                onClick={() =>
                  setIndex((current) =>
                    current === null ? 0 : (current + 1) % photos.length,
                  )
                }
              >
                Далее
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
