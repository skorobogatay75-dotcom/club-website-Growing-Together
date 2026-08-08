import Link from "next/link";

export function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 rounded-[var(--radius-button)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring ${className}`}
      aria-label="Вместе растём — на главную"
    >
      {/* Заглушка логотипа: заменить на исходник в public/brand/logo.svg */}
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-bold tracking-tight text-white shadow-soft transition-transform group-hover:scale-[1.03]"
      >
        ВР
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Вместе растём
        </span>
        <span className="text-xs text-muted">Семейный клуб</span>
      </span>
    </Link>
  );
}
