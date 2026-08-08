"use client";

import Image from "next/image";
import { useEffect, useId, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { isPublicText } from "@/lib/content/public-text";
import { publicStorageUrl } from "@/lib/media/public-url";
import type { Photo } from "@/types/database";

type Props = {
  photos: Photo[];
};

export function GalleryLightbox({ photos }: Props) {
  const titleId = useId();
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const show = index !== null ? photos[index] : null;
  const src = show
    ? publicStorageUrl("public-media", show.storage_path)
    : null;

  useEffect(() => {
    if (index === null) return;
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
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close, index, photos.length]);

  if (photos.length === 0) {
    return (
      <p className="mt-8 text-sm text-muted">
        В этом альбоме пока нет опубликованных фотографий.
      </p>
    );
  }

  return (
    <>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, photoIndex) => {
          const url = publicStorageUrl("public-media", photo.storage_path);
          const alt = isPublicText(photo.alt)
            ? photo.alt
            : "Фотография с встречи клуба";
          return (
            <li key={photo.id}>
              <button
                type="button"
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
                onClick={() => setIndex(photoIndex)}
                aria-label={`Открыть фото: ${alt}`}
              >
                {url ? (
                  <Image
                    src={url}
                    alt={alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-[1.02]"
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
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[90dvh] w-full max-w-5xl flex-col"
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <p id={titleId} className="text-sm font-medium">
                {isPublicText(show.alt) ? show.alt : "Фотография с встречи клуба"}
                {isPublicText(show.caption) ? ` — ${show.caption}` : ""}
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-white/40"
                aria-label="Закрыть"
                onClick={close}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="relative min-h-[50dvh] flex-1 overflow-hidden rounded-[var(--radius-card)] bg-brand-ink">
              <Image
                src={src}
                alt={isPublicText(show.alt) ? show.alt : "Фотография с встречи клуба"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex justify-between gap-3">
              <button
                type="button"
                className="btn-secondary"
                aria-label="Предыдущее фото"
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
                aria-label="Следующее фото"
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
