import Link from "next/link";

export default function AdminPublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Вместе растём
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          Вход для сотрудников
        </p>
      </div>
      {children}
      <p className="mt-10 text-center text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          ← На сайт
        </Link>
      </p>
    </div>
  );
}
