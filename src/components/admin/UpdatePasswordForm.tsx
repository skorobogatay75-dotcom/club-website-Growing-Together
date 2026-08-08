"use client";

import { useActionState } from "react";
import {
  updatePasswordAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initial: AuthActionState = null;

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Новый пароль
      </h1>
      <p className="text-sm text-muted">
        Придумайте новый пароль для входа в админ-панель.
      </p>

      {state && !state.ok ? (
        <p role="alert" className="rounded-[var(--radius-button)] bg-brand-powder/70 px-3 py-2 text-sm">
          {state.message}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Новый пароль</span>
        <input
          className="field-input"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Повтор пароля</span>
        <input
          className="field-input"
          type="password"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить пароль"}
      </button>
    </form>
  );
}
