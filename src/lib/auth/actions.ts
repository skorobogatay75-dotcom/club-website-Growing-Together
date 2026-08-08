"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | null;

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { ok: false, message: "Укажите email и пароль." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Авторизация недоступна: не настроены переменные Supabase.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { ok: false, message: "Неверный email или пароль." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  const allowed =
    !!profile &&
    profile.is_active &&
    (profile.role === "admin" || profile.role === "editor");

  if (!allowed) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "У этой учётной записи нет доступа в админ-панель. Обратитесь к администратору.",
    };
  }

  const safeNext =
    nextPath.startsWith("/admin") && !nextPath.startsWith("/admin/login")
      ? nextPath
      : "/admin";
  redirect(safeNext);
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { ok: false, message: "Укажите email." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Сервис временно недоступен.",
    };
  }

  const redirectTo = `${siteUrl()}/admin/auth/callback?next=/admin/update-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  // Не раскрываем, существует ли аккаунт
  if (error) {
    console.error("auth.reset_password_failed");
  }

  return {
    ok: true,
    message:
      "Если этот email есть среди сотрудников, мы отправили ссылку для смены пароля.",
  };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "Пароль должен быть не короче 8 символов." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Пароли не совпадают." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Сервис временно недоступен." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Сессия восстановления истекла. Запросите ссылку снова.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("auth.update_password_failed");
    return { ok: false, message: "Не удалось обновить пароль. Попробуйте позже." };
  }

  redirect("/admin");
}

export async function exchangeAuthCode(code: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const };
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("auth.exchange_code_failed");
    return { ok: false as const };
  }
  return { ok: true as const };
}

export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  if (!host) return siteUrl();
  return `${proto}://${host}`;
}
