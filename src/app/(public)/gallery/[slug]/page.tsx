import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedAlbumBySlug } from "@/features/content/queries";
import { isPublicText } from "@/lib/content/public-text";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublishedAlbumBySlug(slug);
  if (!album) return { title: "Альбом не найден" };
  return {
    title: album.seo_title || album.title,
    description: album.seo_description || album.description || undefined,
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params;
  const album = await getPublishedAlbumBySlug(slug);
  if (!album) notFound();

  const description = isPublicText(album.description) ? album.description : null;

  return (
    <article className="section-space">
      <div className="container-page max-w-3xl">
        <p className="text-sm text-muted">
          <Link href="/gallery" className="hover:text-foreground">
            ← Фоторепортажи
          </Link>
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {album.title}
        </h1>
        {description ? (
          <p className="mt-5 text-lg text-muted">{description}</p>
        ) : null}
        <p className="mt-8 text-sm text-muted">
          Сетка фотографий и lightbox появятся после загрузки медиа в
          админ-панели.
        </p>
      </div>
    </article>
  );
}
