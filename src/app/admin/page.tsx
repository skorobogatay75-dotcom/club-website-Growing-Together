import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Обзор",
};

const ADMIN_SECTIONS = [
  { href: "/admin/programs", label: "Программы" },
  { href: "/admin/events", label: "События" },
  { href: "/admin/news", label: "Новости" },
  { href: "/admin/gallery", label: "Фотоальбомы" },
  { href: "/admin/documents", label: "Документы" },
  { href: "/admin/applications", label: "Заявки" },
  { href: "/admin/membership", label: "Членство" },
  { href: "/admin/settings", label: "Настройки" },
] as const;

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Панель управления
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Каркас разделов готов. Защита маршрутов, роли admin/editor и CRUD
        подключаются после SQL/RLS и Auth. Сейчас страницы доступны только как
        заготовки структуры — не используйте их в production без Auth.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex min-h-11 items-center rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-soft"
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/admin/login" className="btn-primary">
          Страница входа
        </Link>
      </p>
    </main>
  );
}
