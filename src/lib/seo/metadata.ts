import type { Metadata } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";
import { publicStorageUrl } from "@/lib/media/public-url";

const DEFAULT_DESCRIPTION =
  "Семейный клуб «Вместе растём»: игровые мастер-классы, квизы и развивающие встречи для родителей и детей.";

export function rootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: {
      default: "Вместе растём — семейный клуб",
      template: "%s · Вместе растём",
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: "Вместе растём",
    authors: [{ name: "Вместе растём" }],
    creator: "Вместе растём",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: siteUrl,
      siteName: "Вместе растём",
      title: "Вместе растём — семейный клуб",
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: absoluteUrl("/brand/team-founders.png"),
          width: 1200,
          height: 800,
          alt: "Команда семейного клуба «Вместе растём»",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Вместе растём — семейный клуб",
      description: DEFAULT_DESCRIPTION,
      images: [absoluteUrl("/brand/team-founders.png")],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

type PageMetaInput = {
  title: string;
  description?: string | null;
  path: string;
  imagePath?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  noIndex?: boolean;
};

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const description =
    (input.description && input.description.trim()) || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(input.path);
  const image =
    publicStorageUrl("public-media", input.imagePath) ||
    absoluteUrl("/brand/team-founders.png");

  return {
    title: input.title,
    description,
    alternates: { canonical: input.path },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: input.type === "article" ? "article" : "website",
      locale: "ru_RU",
      url,
      siteName: "Вместе растём",
      title: input.title,
      description,
      images: [{ url: image, alt: input.title }],
      ...(input.type === "article" && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [image],
    },
  };
}
