import Link from "next/link";
import { isPublicText } from "@/lib/content/public-text";
import type { Album } from "@/types/database";

type Props = {
  album: Album | null;
};

export function HomeGallery({ album }: Props) {
  if (!album || !isPublicText(album.title)) return null;

  const description = isPublicText(album.description) ? album.description : null;

  return (
    <section className="section-space border-b border-border bg-surface-soft/40">
      <div className="container-page max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Фоторепортажи
        </h2>
        <p className="mt-3 text-muted">
          Последний опубликованный альбом встречи.
        </p>

        <Link
          href={`/gallery/${album.slug}`}
          className="mt-8 block rounded-[var(--radius-card)] border border-border bg-background px-5 py-5 transition-colors hover:border-accent-secondary/40 hover:bg-surface"
        >
          <h3 className="text-lg font-semibold text-foreground">{album.title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-muted">{description}</p>
          ) : null}
          <span className="mt-4 inline-block text-sm font-semibold text-accent">
            Смотреть альбом
          </span>
        </Link>
      </div>
    </section>
  );
}
