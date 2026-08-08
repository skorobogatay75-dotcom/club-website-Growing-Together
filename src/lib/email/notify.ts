type NotifyPayload = {
  applicationId: string;
  type: string;
  createdAt: string;
  /** Без PII в логах — только факт отправки */
};

export type StaffNotificationInput = {
  applicationId: string;
  type: string;
  parentName: string;
  phone: string;
  email?: string;
  preferredContact: string;
  comment?: string;
  programTitle?: string;
  eventTitle?: string;
  planName?: string;
  childAgeText?: string;
  source?: string;
};

function staffEmail(): string | null {
  return (
    process.env.APPLICATION_NOTIFY_EMAIL?.trim() ||
    process.env.EMAIL_REPLY_TO?.trim() ||
    null
  );
}

function fromEmail(): string | null {
  return process.env.EMAIL_FROM?.trim() || null;
}

async function sendViaResend(input: StaffNotificationInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = staffEmail();
  const from = fromEmail();
  if (!apiKey || !to || !from) return false;

  const subject = `[Вместе растём] Новая заявка (${input.type})`;
  const lines = [
    `Тип: ${input.type}`,
    `ID: ${input.applicationId}`,
    `Имя: ${input.parentName}`,
    `Телефон: ${input.phone}`,
    input.email ? `Email: ${input.email}` : null,
    `Связь: ${input.preferredContact}`,
    input.childAgeText ? `Возраст ребёнка: ${input.childAgeText}` : null,
    input.programTitle ? `Программа: ${input.programTitle}` : null,
    input.eventTitle ? `Событие: ${input.eventTitle}` : null,
    input.planName ? `Членство: ${input.planName}` : null,
    input.comment ? `Комментарий: ${input.comment}` : null,
    input.source ? `Источник: ${input.source}` : null,
  ].filter(Boolean);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: lines.join("\n"),
    }),
  });

  return response.ok;
}

/**
 * Уведомление сотрудникам. Ошибки глотаются (заявка уже сохранена).
 * PII не пишется в console.
 */
export async function notifyStaffAboutApplication(
  input: StaffNotificationInput,
): Promise<NotifyPayload> {
  const meta: NotifyPayload = {
    applicationId: input.applicationId,
    type: input.type,
    createdAt: new Date().toISOString(),
  };

  try {
    const sent = await sendViaResend(input);
    if (!sent && process.env.NODE_ENV !== "production") {
      console.info("application.notify.skipped", {
        reason: "email_provider_not_configured",
        applicationId: input.applicationId,
        type: input.type,
      });
    }
  } catch {
    console.error("application.notify.email_failed", {
      applicationId: input.applicationId,
    });
  }

  return meta;
}
