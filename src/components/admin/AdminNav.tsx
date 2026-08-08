"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/programs", label: "Программы" },
  { href: "/admin/events", label: "События" },
  { href: "/admin/news", label: "Новости" },
  { href: "/admin/gallery", label: "Фотоальбомы" },
  { href: "/admin/documents", label: "Документы" },
  { href: "/admin/applications", label: "Заявки" },
  { href: "/admin/membership", label: "Членство" },
] as const;

type Props = {
  showSettings: boolean;
};

export function AdminNav({ showSettings }: Props) {
  const pathname = usePathname();

  const items = showSettings
    ? [...ITEMS, { href: "/admin/settings", label: "Настройки", exact: false as const }]
    : ITEMS;

  return (
    <nav aria-label="Разделы админ-панели" className="space-y-1">
      {items.map((item) => {
        const exact = "exact" in item && item.exact;
        const active = exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-surface-soft text-foreground"
                : "text-muted hover:bg-surface hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
