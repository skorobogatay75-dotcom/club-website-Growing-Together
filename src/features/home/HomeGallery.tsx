import Link from "next/link";
import Image from "next/image";
import { isPublicText } from "@/lib/content/public-text";
import { publicStorageUrl } from "@/lib/media/public-url";
import type { AlbumWithCover } from "@/features/gallery/queries";

type Props = {
  album: AlbumWithCover | null;
};

export function HomeGallery({ album }: Props) {
  if (!album || !isPublicText(album.title)) return null;

  const description = isPublicText(album.description) ? album.description : null;
  const coverUrl = publicStorageUrl("public-media", album.cover_path);
  const coverAlt = isPublicText(album.cover_alt) ? album.cover_alt : album.title;

  return (
    <section className="section-space border-b border-border bg-surface-soft/40">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Фоторепортажи
          </h2>
          <p className="mt-3 text-muted">Последний опубликованный альбом встречи.</p>
        </div>

        <Link
          href={`/gallery/${album.slug}`}
          className="mt-8 grid overflow-hidden rounded-[var(--radius-card)] border border-border bg-background transition-colors hover:border-accent-secondary/40 md:grid-cols-2"
        >
          <div className="relative min-h-[14rem] bg-surface-soft md:min-h-[18rem]">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={coverAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-sm text-muted">
                Смотреть альбом
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center px-5 py-6 sm:px-8">
            <h3 className="text-lg font-semibold text-foreground">{album.title}</h3>
            {album.event_date ? (
              <p className="mt-2 text-sm text-muted">{album.event_date}</p>
            ) : null}
            {description ? (
              <p className="mt-3 text-sm text-muted">{description}</p>
            ) : null}
            <span className="mt-5 inline-block text-sm font-semibold text-accent">
              Смотреть альбом
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
