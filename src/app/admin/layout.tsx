import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-dvh bg-background text-foreground">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Вместе растём
            </p>
            <p className="text-sm font-semibold text-foreground">Админ-панель</p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            На сайт
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
