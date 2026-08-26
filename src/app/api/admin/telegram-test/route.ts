import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { getTelegramNotifyConfig, sendTelegramMessage } from "@/lib/telegram/notify";

async function requireStaff() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const, status: 500, reason: "config" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, reason: "unauthenticated" };

  const admin = createSupabaseServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  const allowed =
    !!profile &&
    profile.is_active === true &&
    (profile.role === "admin" || profile.role === "editor");

  if (!allowed) return { ok: false as const, status: 403, reason: "forbidden" };
  return { ok: true as const };
}

/**
 * Диагностика Telegram для сотрудников.
 * GET — только статус переменных.
 * POST — отправить тестовое сообщение.
 */
export async function GET() {
  const auth = await requireStaff();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: auth.status });
  }

  const config = getTelegramNotifyConfig();
  return NextResponse.json({
    ok: true,
    configured: config.configured,
    hasToken: config.hasToken,
    hasChatId: config.hasChatId,
  });
}

export async function POST() {
  const auth = await requireStaff();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: auth.status });
  }

  const config = getTelegramNotifyConfig();
  if (!config.configured) {
    return NextResponse.json({
      ok: false,
      reason: "not_configured",
      hasToken: config.hasToken,
      hasChatId: config.hasChatId,
      hint: "Проверьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в Timeweb и сделайте redeploy.",
    });
  }

  const result = await sendTelegramMessage(
    "Тест «Вместе растём»: уведомления о заявках настроены.",
  );

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      reason: "telegram_api",
      description: result.description,
      hint:
        result.description === "network_error"
          ? "Сервер Timeweb не смог достучаться до api.telegram.org."
          : "Токен или chat_id не приняты Telegram. Проверьте /start у бота и chat_id.",
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Тестовое сообщение отправлено. Проверьте Telegram.",
  });
}
