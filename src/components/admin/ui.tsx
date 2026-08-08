import Link from "next/link";
import type { ContentStatus } from "@/types/database";

export function StatusBadge({ status }: { status: ContentStatus | string }) {
  const styles: Record<string, string> = {
    draft: "bg-surface-soft text-muted",
    published: "bg-accent-secondary/25 text-foreground",
    archived: "bg-brand-powder text-foreground",
    new: "bg-accent-secondary/25 text-foreground",
    contacted: "bg-surface-soft text-foreground",
    confirmed: "bg-accent-secondary/35 text-foreground",
    cancelled: "bg-brand-powder text-foreground",
    spam: "bg-brand-powder text-muted",
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-surface text-muted"
      }`}
    >
      {status}
    </span>
  );
}

export function AdminPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function AdminFlash({
  message,
  tone = "ok",
}: {
  message?: string | null;
  tone?: "ok" | "error";
}) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`mt-4 rounded-[var(--radius-button)] px-3 py-2 text-sm ${
        tone === "ok" ? "bg-accent-secondary/20" : "bg-brand-powder/80"
      }`}
    >
      {message}
    </p>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
