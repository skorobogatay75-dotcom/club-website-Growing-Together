import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";
import { collectSitemapEntries } from "@/lib/seo/sitemap-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries = await collectSitemapEntries();

  return entries.map((entry) => ({
    url: `${siteUrl}${entry.path === "/" ? "" : entry.path}`,
    lastModified: entry.lastModified
      ? new Date(entry.lastModified)
      : new Date(),
    changeFrequency:
      entry.path === "/" || entry.path === "/events" ? "daily" : "weekly",
    priority:
      entry.path === "/"
        ? 1
        : entry.path === "/events" || entry.path === "/apply"
          ? 0.9
          : 0.7,
  }));
}
