import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SkipToContent } from "@/components/public/SkipToContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicContacts } from "@/features/home/queries";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contacts = await getPublicContacts();

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <JsonLd data={organizationJsonLd(contacts)} />
      <JsonLd data={websiteJsonLd()} />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter contacts={contacts} />
    </div>
  );
}
