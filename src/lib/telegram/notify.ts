import type { StaffNotificationInput } from "@/lib/email/notify";

function cleanEnv(value: string | undefined): string | null {
  const cleaned = value?.trim().replace(/^["']|["']$/g, "") ?? "";
  return cleaned.length > 0 ? cleaned : null;
}

export function getTelegramNotifyConfig() {
  const token = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatIdRaw = cleanEnv(process.env.TELEGRAM_CHAT_ID);
  return {
    token,
    chatIdRaw,
    hasToken: Boolean(token),
    hasChatId: Boolean(chatIdRaw),
    configured: Boolean(token && chatIdRaw),
  };
}

function telegramApiBase(): string {
  const custom = cleanEnv(process.env.TELEGRAM_API_BASE);
  return (custom ?? "https://api.telegram.org").replace(/\/+$/, "");
}

export async function sendTelegramMessage(
  text: string,
): Promise<{ ok: true } | { ok: false; description: string }> {
  const { token, chatIdRaw } = getTelegramNotifyConfig();
  if (!token || !chatIdRaw) {
    return { ok: false, description: "not_configured" };
  }

  // Telegram принимает и строку, и число; число надёжнее для личного chat_id
  const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw;

  try {
    const response = await fetch(
      `${telegramApiBase()}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      let description = `http_${response.status}`;
      try {
        const payload = (await response.json()) as {
          description?: string;
        };
        if (payload.description) description = payload.description;
      } catch {
        // ignore parse errors
      }
      return { ok: false, description };
    }

    return { ok: true };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message.slice(0, 120) : "unknown";
    return { ok: false, description: `network_error:${detail}` };
  }
}

/**
 * Опциональный Telegram-адаптер. Не падает, если токены не заданы.
 */
export async function notifyTelegramAboutApplication(
  input: StaffNotificationInput,
): Promise<boolean> {
  const config = getTelegramNotifyConfig();
  if (!config.configured) {
    console.error("application.notify.telegram_skipped", {
      applicationId: input.applicationId,
      hasToken: config.hasToken,
      hasChatId: config.hasChatId,
    });
    return false;
  }

  const text = [
    "Новая заявка «Вместе растём»",
    `Тип: ${input.type}`,
    `Имя: ${input.parentName}`,
    `Телефон: ${input.phone}`,
    input.email ? `Email: ${input.email}` : null,
    input.programTitle ? `Программа: ${input.programTitle}` : null,
    input.eventTitle ? `Событие: ${input.eventTitle}` : null,
    input.planName ? `Членство: ${input.planName}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendTelegramMessage(text);
  if (!result.ok) {
    console.error("application.notify.telegram_failed", {
      applicationId: input.applicationId,
      description: result.description,
    });
    return false;
  }

  return true;
}
