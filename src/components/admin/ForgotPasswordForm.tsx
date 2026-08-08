"use client";

import { useActionState } from "react";
import {
  forgotPasswordAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initial: AuthActionState = null;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Восстановление пароля
      </h1>
      <p className="text-sm text-muted">
        Укажите рабочий email сотрудника. Если аккаунт есть в системе, отправим
        ссылку для смены пароля.
      </p>

      {state ? (
        <p
          role="status"
          className={`rounded-[var(--radius-button)] px-3 py-2 text-sm ${
            state.ok ? "bg-accent-secondary/20" : "bg-brand-powder/70"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Email</span>
        <input
          className="field-input"
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Отправляем…" : "Отправить ссылку"}
      </button>
    </form>
  );
}
