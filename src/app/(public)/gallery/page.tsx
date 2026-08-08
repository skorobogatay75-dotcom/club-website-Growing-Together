import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  albumYears,
  filterAlbumsByYear,
  listPublishedAlbums,
} from "@/features/gallery/queries";
import { isPublicText } from "@/lib/content/public-text";
import { publicStorageUrl } from "@/lib/media/public-url";

export const metadata: Metadata = {
  title: "Фоторепортажи",
  description: "Фотоальбомы встреч семейного клуба «Вместе растём».",
};

export const revalidate = 60;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const year = first(params.year) ?? "";
  const allAlbums = await listPublishedAlbums();
  const years = albumYears(allAlbums);
  const albums = filterAlbumsByYear(allAlbums, year || null);

  return (
    <section className="section-space">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Фоторепортажи
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Альбомы встреч. В подписях и именах файлов не публикуем имена детей.
        </p>

        {years.length > 1 ? (
          <nav aria-label="Фильтр по году" className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className={`rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium ${
                !year
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              Все годы
            </Link>
            {years.map((y) => (
              <Link
                key={y}
                href={`/gallery?year=${y}`}
                className={`rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium ${
                  year === String(y)
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {y}
              </Link>
            ))}
          </nav>
        ) : null}

        {albums.length === 0 ? (
          <p className="mt-10 text-muted">
            {year
              ? "За выбранный год опубликованных альбомов нет."
              : "Пока нет опубликованных альбомов."}
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => {
              const description = isPublicText(album.description)
                ? album.description
                : null;
              const coverUrl = publicStorageUrl("public-media", album.cover_path);
              const coverAlt = isPublicText(album.cover_alt)
                ? album.cover_alt
                : album.title;
              return (
                <li key={album.id}>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="group block overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-colors hover:border-accent-secondary/50"
                  >
                    <div className="relative aspect-[4/3] bg-surface-soft">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={coverAlt}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center px-4 text-sm text-muted">
                          Без обложки
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-foreground">
                        {album.title}
                      </h2>
                      {album.event_date ? (
                        <p className="mt-2 text-sm text-muted">{album.event_date}</p>
                      ) : null}
                      {description ? (
                        <p className="mt-3 line-clamp-3 text-sm text-muted">
                          {description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
