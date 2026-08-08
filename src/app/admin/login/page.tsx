import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Вход",
};

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Вход для сотрудников
      </h1>
      <p className="mt-3 text-sm text-muted">
        Публичная регистрация отключена. Авторизация через Supabase Auth будет
        подключена на этапе 6. Первый администратор создаётся вручную.
      </p>
      <Link href="/" className="btn-secondary mt-8 w-fit">
        Вернуться на сайт
      </Link>
    </main>
  );
}
