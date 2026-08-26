import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import {
  getTelegramNotifyConfig,
  sendTelegramMessage,
} from "@/lib/telegram/notify";

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

function wantsHtml(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function htmlPage(body: string) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Проверка Telegram</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    .ok { color: #0a7; }
    .err { color: #b30; }
    button { font-size: 1rem; padding: 0.6rem 1rem; cursor: pointer; }
    pre { background: #f4f4f4; padding: 1rem; overflow: auto; white-space: pre-wrap; }
    a { color: #06c; }
  </style>
</head>
<body>
  <h1>Проверка Telegram</h1>
  ${body}
</body>
</html>`;
}

/**
 * Диагностика Telegram для сотрудников.
 * GET (браузер) — страница с кнопкой теста.
 * GET (Accept: application/json) — статус переменных.
 * POST — отправить тестовое сообщение.
 */
export async function GET(request: Request) {
  const auth = await requireStaff();
  if (!auth.ok) {
    if (wantsHtml(request)) {
      const loginHint =
        auth.reason === "unauthenticated"
          ? `<p class="err">Нужно войти в админку. <a href="/admin/login">Войти</a></p>`
          : `<p class="err">Нет доступа (${auth.reason}).</p>`;
      return new NextResponse(htmlPage(loginHint), {
        status: auth.status,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return NextResponse.json({ ok: false, reason: auth.reason }, { status: auth.status });
  }

  const config = getTelegramNotifyConfig();
  const payload = {
    ok: true,
    configured: config.configured,
    hasToken: config.hasToken,
    hasChatId: config.hasChatId,
  };

  if (!wantsHtml(request)) {
    return NextResponse.json(payload);
  }

  const statusLine = config.configured
    ? `<p class="ok">Переменные на сервере найдены (токен и chat_id).</p>`
    : `<p class="err">Переменные неполные: token=${config.hasToken}, chatId=${config.hasChatId}. Проверьте Timeweb и сделайте redeploy.</p>`;

  const body = `
    ${statusLine}
    <p>Нажмите кнопку — бот должен прислать тестовое сообщение.</p>
    <button type="button" id="send">Отправить тест в Telegram</button>
    <pre id="out">Результат появится здесь…</pre>
    <p><a href="/admin/applications">← К заявкам</a></p>
    <script>
      const out = document.getElementById('out');
      document.getElementById('send').onclick = async () => {
        out.textContent = 'Отправляем…';
        try {
          const res = await fetch('/api/admin/telegram-test', { method: 'POST' });
          const data = await res.json();
          out.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
          out.textContent = String(e);
        }
      };
    </script>
  `;

  return new NextResponse(htmlPage(body), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
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
      hint: result.description.startsWith("network_error")
        ? "Сервер Timeweb не достучится до api.telegram.org. Нужен TELEGRAM_API_BASE (Cloudflare Worker) — см. docs/DEPLOY.md."
        : "Токен или chat_id не приняты Telegram. Проверьте /start у бота и chat_id.",
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Тестовое сообщение отправлено. Проверьте Telegram.",
  });
}
