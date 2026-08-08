import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";

export function organizationJsonLd(contacts?: {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Вместе растём",
    url: getSiteUrl(),
    description:
      "Семейный клуб: игровые мастер-классы, квизы и развивающие встречи для родителей и детей.",
    logo: absoluteUrl("/brand/team-founders.png"),
  };

  if (contacts?.email) data.email = contacts.email;
  if (contacts?.phone) data.telephone = contacts.phone;
  if (contacts?.address) {
    data.address = {
      "@type": "PostalAddress",
      streetAddress: contacts.address,
      addressCountry: "RU",
    };
  }

  return data;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Вместе растём",
    url: getSiteUrl(),
    inLanguage: "ru-RU",
  };
}

export function eventJsonLd(input: {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  path: string;
  venue?: string | null;
  image?: string | null;
  status?: string;
}) {
  const eventStatus =
    input.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description || undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    eventStatus,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(input.path),
    image: input.image ? [input.image] : [absoluteUrl("/brand/team-founders.png")],
    location: input.venue
      ? {
          "@type": "Place",
          name: input.venue,
          address: input.venue,
        }
      : {
          "@type": "Place",
          name: "Вместе растём",
        },
    organizer: {
      "@type": "Organization",
      name: "Вместе растём",
      url: getSiteUrl(),
    },
  };
}

export function articleJsonLd(input: {
  title: string;
  description?: string | null;
  path: string;
  publishedAt?: string | null;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description || undefined,
    datePublished: input.publishedAt || undefined,
    mainEntityOfPage: absoluteUrl(input.path),
    image: input.image || absoluteUrl("/brand/team-founders.png"),
    author: {
      "@type": "Organization",
      name: "Вместе растём",
    },
    publisher: {
      "@type": "Organization",
      name: "Вместе растём",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/team-founders.png"),
      },
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
