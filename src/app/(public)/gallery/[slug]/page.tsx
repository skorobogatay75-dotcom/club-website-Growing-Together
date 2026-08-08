import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedAlbumBySlug } from "@/features/content/queries";
import { getAlbumPhotos } from "@/features/gallery/queries";
import { GalleryLightbox } from "@/features/gallery/GalleryLightbox";
import { isPublicText } from "@/lib/content/public-text";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublishedAlbumBySlug(slug);
  if (!album) return { title: "Альбом не найден", robots: { index: false } };
  return buildPageMetadata({
    title: album.seo_title || album.title,
    description: album.seo_description || album.description,
    path: `/gallery/${album.slug}`,
  });
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params;
  const album = await getPublishedAlbumBySlug(slug);
  if (!album) notFound();

  const photos = await getAlbumPhotos(album.id);
  const description = isPublicText(album.description) ? album.description : null;

  return (
    <article className="section-space">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Фоторепортажи", path: "/gallery" },
          { name: album.title, path: `/gallery/${album.slug}` },
        ])}
      />
      <div className="container-page">
        <p className="text-sm text-muted">
          <Link href="/gallery" className="hover:text-foreground">
            ← Фоторепортажи
          </Link>
        </p>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {album.title}
        </h1>
        {album.event_date ? (
          <p className="mt-3 text-sm text-muted">{album.event_date}</p>
        ) : null}
        {description ? (
          <p className="mt-5 max-w-3xl text-lg text-muted">{description}</p>
        ) : null}
        <GalleryLightbox photos={photos} />
      </div>
    </article>
  );
}
