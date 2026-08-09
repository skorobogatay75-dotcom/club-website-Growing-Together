"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SiteLogo } from "./SiteLogo";
import { SITE_NAV } from "./nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    focusables?.[0]?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !panel || !focusables?.length) return;

      const items = Array.from(focusables);
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [open, close]);

  const onNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
      buttonRef.current?.focus();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <SiteLogo />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Основное меню"
        >
          {SITE_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium transition-colors ${
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

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link href="/apply" className="btn-primary hidden sm:inline-flex">
            Записаться
          </Link>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface text-foreground lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="presentation"
          onKeyDown={onNavKeyDown}
        >
          <button
            type="button"
            className="absolute inset-0 bg-brand-ink/35"
            aria-label="Закрыть меню"
            onClick={close}
          />
          <div
            ref={panelRef}
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Мобильное меню"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-background shadow-soft"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <p className="text-sm font-semibold text-foreground">Меню</p>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface"
                aria-label="Закрыть меню"
                onClick={() => {
                  close();
                  buttonRef.current?.focus();
                }}
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Мобильное меню">
              {SITE_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-[var(--radius-button)] px-4 py-3 text-base font-medium ${
                      active
                        ? "bg-surface-soft text-foreground"
                        : "text-foreground hover:bg-surface"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/apply" className="btn-primary mt-4 w-full">
                Записаться
              </Link>
              <Link
                href="/contacts"
                className="mt-2 rounded-[var(--radius-button)] px-4 py-3 text-base font-medium text-muted hover:bg-surface hover:text-foreground"
              >
                Контакты
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
