import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { getPublicContacts } from "@/features/home/queries";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contacts = await getPublicContacts();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter contacts={contacts} />
    </div>
  );
}
