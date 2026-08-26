import Link from "next/link";
import { requireStaff, canManageSettings } from "@/lib/auth/session";
import { logoutAction } from "@/lib/auth/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { APP_VERSION } from "@/lib/app-version";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireStaff();
  const showSettings = canManageSettings(session.profile.role);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Вместе растём
            </p>
            <p className="text-sm font-semibold text-foreground">
              Админ-панель
              <span className="ml-2 text-xs font-normal text-muted">v{APP_VERSION}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">
              {session.profile.full_name || session.email || "Сотрудник"}
              <span className="ml-2 rounded-md bg-background px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-foreground">
                {session.profile.role}
              </span>
            </span>
            <Link href="/" className="text-muted hover:text-foreground">
              На сайт
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary !min-h-9 !px-3 !py-1.5 text-sm">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[14rem_minmax(0,1fr)] sm:px-6">
        <AdminNav showSettings={showSettings} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
