"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  nextPath?: string;
  errorCode?: string;
};

export function LoginForm({ nextPath = "/admin", errorCode }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const bootstrapError =
    errorCode === "forbidden"
      ? "Нет доступа к админ-панели для этой учётной записи. Проверьте профиль admin в Supabase."
      : errorCode === "config"
        ? "Не настроены переменные Supabase."
        : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setMessage("Укажите email и пароль.");
      setPending(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setMessage("Неверный email или пароль.");
        setPending(false);
        return;
      }

      const sessionCheck = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const sessionJson = (await sessionCheck.json()) as {
        ok?: boolean;
        reason?: string;
        message?: string;
      };

      if (!sessionJson.ok) {
        await supabase.auth.signOut();
        setMessage(
          sessionJson.reason === "forbidden"
            ? "Учётная запись есть, но нет роли admin/editor в таблице profiles."
            : sessionJson.message ||
                "Не удалось проверить доступ. Обновите страницу и попробуйте снова.",
        );
        setPending(false);
        return;
      }

      const safeNext =
        nextPath.startsWith("/admin") && !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin";
      router.replace(safeNext);
      router.refresh();
      return;
    } catch (err) {
      setMessage(
        err instanceof Error
          ? `Сбой входа: ${err.message}`
          : "Сбой входа. Проверьте интернет и ключи Supabase.",
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Вход
      </h1>
      <p className="text-sm text-muted">
        Публичная регистрация отключена. Первый администратор создаётся вручную в
        Supabase.
      </p>

      {(bootstrapError || message) && (
        <p
          role="alert"
          className="rounded-[var(--radius-button)] bg-brand-powder/70 px-3 py-2 text-sm"
        >
          {bootstrapError || message}
        </p>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input
          className="field-input"
          type="email"
          name="email"
          autoComplete="username"
          required
          defaultValue="cmks0106@mail.ru"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Пароль</span>
        <input
          className="field-input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Входим…" : "Войти"}
      </button>

      <p className="text-center text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-accent hover:text-accent-hover"
        >
          Забыли пароль?
        </Link>
      </p>
    </form>
  );
}
