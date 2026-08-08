import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedAlbums } from "@/features/gallery/queries";
import { isPublicText } from "@/lib/content/public-text";

export const metadata: Metadata = {
  title: "Фоторепортажи",
  description: "Фотоальбомы встреч семейного клуба «Вместе растём».",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const albums = await listPublishedAlbums();

  return (
    <section className="section-space">
      <div className="container-page">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Фоторепортажи
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Альбомы встреч без имён детей в подписях и адресах файлов.
        </p>

        {albums.length === 0 ? (
          <p className="mt-10 text-muted">Пока нет опубликованных альбомов.</p>
        ) : (
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {albums.map((album) => {
              const description = isPublicText(album.description)
                ? album.description
                : null;
              return (
                <li key={album.id}>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="block rounded-[var(--radius-card)] border border-border bg-surface p-5 hover:bg-surface-soft"
                  >
                    <h2 className="text-lg font-semibold text-foreground">
                      {album.title}
                    </h2>
                    {album.event_date ? (
                      <p className="mt-2 text-sm text-muted">{album.event_date}</p>
                    ) : null}
                    {description ? (
                      <p className="mt-3 text-sm text-muted">{description}</p>
                    ) : null}
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
