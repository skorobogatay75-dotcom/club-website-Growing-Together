import type { Metadata } from "next";
import Link from "next/link";

type AdminStubProps = {
  title: string;
  description: string;
};

export function createAdminMetadata(title: string): Metadata {
  return { title };
}

export function AdminSectionStub({ title, description }: AdminStubProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted">
        <Link href="/admin" className="hover:text-foreground">
          ← К обзору
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">{description}</p>
    </main>
  );
}
