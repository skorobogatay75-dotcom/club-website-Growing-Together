import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">
        404
      </p>
      <h1 className="mt-3 max-w-md font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Такой страницы нет
      </h1>
      <p className="mt-4 max-w-md text-muted">
        Возможно, ссылка устарела или раздел ещё не опубликован. Вернитесь на
        главную и выберите нужный раздел в меню.
      </p>
      <Link href="/" className="btn-primary mt-8">
        На главную
      </Link>
    </main>
  );
}
