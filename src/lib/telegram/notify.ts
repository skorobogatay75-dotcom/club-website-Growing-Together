import type { StaffNotificationInput } from "@/lib/email/notify";

/**
 * Опциональный Telegram-адаптер. Не падает, если токены не заданы.
 */
export async function notifyTelegramAboutApplication(
  input: StaffNotificationInput,
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

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

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
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
    return response.ok;
  } catch {
    console.error("application.notify.telegram_failed", {
      applicationId: input.applicationId,
    });
    return false;
  }
}
