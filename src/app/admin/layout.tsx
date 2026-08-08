import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Админ-панель",
    template: "%s · Админ · Вместе растём",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-background text-foreground">{children}</div>
  );
}
