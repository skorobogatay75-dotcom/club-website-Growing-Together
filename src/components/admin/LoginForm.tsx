"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/lib/auth/actions";

type Props = {
  nextPath?: string;
  errorCode?: string;
};

const initial: AuthActionState = null;

export function LoginForm({ nextPath = "/admin", errorCode }: Props) {
  const [state, action, pending] = useActionState(loginAction, initial);

  const bootstrapError =
    errorCode === "forbidden"
      ? "Нет доступа к админ-панели для этой учётной записи."
      : errorCode === "config"
        ? "Не настроены переменные Supabase."
        : null;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Вход
      </h1>
      <p className="text-sm text-muted">
        Публичная регистрация отключена. Первый администратор создаётся вручную в
        Supabase.
      </p>

      {(bootstrapError || (state && !state.ok)) && (
        <p
          role="alert"
          className="rounded-[var(--radius-button)] bg-brand-powder/70 px-3 py-2 text-sm"
        >
          {bootstrapError || state?.message}
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
