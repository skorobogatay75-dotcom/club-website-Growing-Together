"use server";

import { headers } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  applicationFormSchema,
  MIN_FORM_FILL_MS,
  normalizePhone,
  type ApplicationFormParsed,
} from "@/lib/validation/application";
import { APPLICATION_RATE_LIMIT } from "@/lib/validation/application";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { notifyStaffAboutApplication } from "@/lib/email/notify";
import { notifyTelegramAboutApplication } from "@/lib/telegram/notify";

export type SubmitApplicationState =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

function readBoolean(value: FormDataEntryValue | null): boolean {
  if (typeof value !== "string") return false;
  return value === "true" || value === "on" || value === "1";
}

function readString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  return value;
}

export async function submitApplication(
  _prev: SubmitApplicationState | null,
  formData: FormData,
): Promise<SubmitApplicationState> {
  try {
    return await submitApplicationInner(formData);
  } catch {
    console.error("application.submit_unexpected_error");
    return {
      ok: false,
      message:
        "Не удалось отправить заявку. Обновите страницу и попробуйте ещё раз.",
    };
  }
}

async function submitApplicationInner(
  formData: FormData,
): Promise<SubmitApplicationState> {
  const honeypot = readString(formData.get("website"))?.trim();
  if (honeypot) {
    // Тихий успех для ботов
    return {
      ok: true,
      message:
        "Спасибо! Мы получили заявку и свяжемся с вами, чтобы уточнить детали.",
    };
  }

  const startedRaw = readString(formData.get("formStartedAt"));
  const startedAt = startedRaw ? Number(startedRaw) : NaN;
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FORM_FILL_MS) {
    return {
      ok: false,
      message: "Форма отправлена слишком быстро. Попробуйте ещё раз.",
    };
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";

  const limit = consumeRateLimit(`apply:${ip}`, APPLICATION_RATE_LIMIT);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Слишком много заявок. Повторите через ${limit.retryAfterSec} сек.`,
    };
  }

  const raw = {
    type: readString(formData.get("type")) ?? "general",
    parentName: readString(formData.get("parentName")) ?? "",
    phone: readString(formData.get("phone")) ?? "",
    email: readString(formData.get("email")),
    childAgeText: readString(formData.get("childAgeText")),
    ageCategoryId: readString(formData.get("ageCategoryId")),
    programId: readString(formData.get("programId")),
    eventId: readString(formData.get("eventId")),
    membershipPlanId: readString(formData.get("membershipPlanId")),
    preferredContact: readString(formData.get("preferredContact")) ?? "any",
    comment: readString(formData.get("comment")),
    consentPersonalData: readBoolean(formData.get("consentPersonalData")),
    consentPrivacy: readBoolean(formData.get("consentPrivacy")),
    source: readString(formData.get("source")) ?? "apply-page",
    referrer: readString(formData.get("referrer")),
    utmSource: readString(formData.get("utmSource")),
    utmMedium: readString(formData.get("utmMedium")),
    utmCampaign: readString(formData.get("utmCampaign")),
  };

  const parsed = applicationFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = fieldErrors[key] ?? [];
      fieldErrors[key].push(issue.message);
    }
    return {
      ok: false,
      message: "Проверьте поля формы",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await assertRelatedEntitiesExist(data);
  } catch {
    return {
      ok: false,
      message: "Выбранная программа или событие недоступны.",
    };
  }

  let service;
  try {
    service = createSupabaseServiceClient();
  } catch {
    return {
      ok: false,
      message:
        "Приём заявок временно недоступен. Напишите нам позже или попробуйте снова.",
    };
  }

  const { data: inserted, error } = await service
    .from("applications")
    .insert({
      type: data.type,
      program_id: data.programId ?? null,
      event_id: data.eventId ?? null,
      membership_plan_id: data.membershipPlanId ?? null,
      parent_name: data.parentName,
      phone: normalizePhone(data.phone),
      email: data.email ?? null,
      child_age_text: data.childAgeText ?? null,
      age_category_id: data.ageCategoryId ?? null,
      preferred_contact: data.preferredContact,
      comment: data.comment ?? null,
      consent_personal_data: true,
      consent_marketing: false,
      status: "new",
      source: data.source ?? "apply-page",
      utm_source: data.utmSource ?? null,
      utm_medium: data.utmMedium ?? null,
      utm_campaign: data.utmCampaign ?? null,
      referrer: data.referrer ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("application.insert_failed");
    return {
      ok: false,
      message: "Не удалось сохранить заявку. Попробуйте ещё раз чуть позже.",
    };
  }

  let titles: Awaited<ReturnType<typeof loadRelatedTitles>> = {};
  try {
    titles = await loadRelatedTitles(data);
  } catch {
    // Заявка уже сохранена — уведомление уйдёт без названий.
  }

  const notifyInput = {
    applicationId: inserted.id as string,
    type: data.type,
    parentName: data.parentName,
    phone: normalizePhone(data.phone),
    email: data.email,
    preferredContact: data.preferredContact,
    comment: data.comment,
    childAgeText: data.childAgeText,
    source: data.source,
    ...titles,
  };

  await Promise.allSettled([
    notifyStaffAboutApplication(notifyInput),
    notifyTelegramAboutApplication(notifyInput),
  ]);

  return {
    ok: true,
    message:
      "Спасибо! Мы получили заявку и свяжемся с вами, чтобы уточнить детали.",
  };
}

async function assertRelatedEntitiesExist(data: ApplicationFormParsed) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  if (data.programId) {
    const { data: row } = await supabase
      .from("programs")
      .select("id")
      .eq("id", data.programId)
      .eq("status", "published")
      .maybeSingle();
    if (!row) throw new Error("program");
  }

  if (data.eventId) {
    const { data: row } = await supabase
      .from("events")
      .select("id")
      .eq("id", data.eventId)
      .eq("status", "published")
      .maybeSingle();
    if (!row) throw new Error("event");
  }

  if (data.membershipPlanId) {
    const { data: row } = await supabase
      .from("membership_plans")
      .select("id")
      .eq("id", data.membershipPlanId)
      .eq("status", "published")
      .maybeSingle();
    if (!row) throw new Error("plan");
  }
}

async function loadRelatedTitles(data: ApplicationFormParsed) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return {};

  const [program, event, plan] = await Promise.all([
    data.programId
      ? supabase
          .from("programs")
          .select("title")
          .eq("id", data.programId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    data.eventId
      ? supabase
          .from("events")
          .select("title")
          .eq("id", data.eventId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    data.membershipPlanId
      ? supabase
          .from("membership_plans")
          .select("name")
          .eq("id", data.membershipPlanId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    programTitle: program.data?.title as string | undefined,
    eventTitle: event.data?.title as string | undefined,
    planName: plan.data?.name as string | undefined,
  };
}
