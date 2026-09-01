import { z } from "zod";

export const applicationTypes = [
  "general",
  "program",
  "event",
  "membership",
] as const;

export const preferredContacts = [
  "any",
  "phone",
  "email",
  "telegram",
  "whatsapp",
] as const;

export type ApplicationType = (typeof applicationTypes)[number];
export type PreferredContact = (typeof preferredContacts)[number];

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value || value.length === 0) return undefined;
    return value;
  });

export const applicationFormSchema = z
  .object({
    type: z.enum(applicationTypes),
    parentName: z
      .string({ error: "Укажите имя" })
      .trim()
      .min(2, "Укажите имя")
      .max(120, "Слишком длинное имя"),
    phone: z
      .string({ error: "Укажите телефон" })
      .trim()
      .min(5, "Укажите телефон")
      .max(32, "Слишком длинный номер")
      .regex(/^[+\d][\d\s()\-]{4,30}\d$/, "Проверьте формат телефона"),
    email: z
      .string()
      .trim()
      .max(160, "Слишком длинный email")
      .refine(
        (value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Проверьте email",
      )
      .transform((value) => (value.length === 0 ? undefined : value)),
    childAgeText: optionalText.pipe(z.string().max(40).optional()),
    ageCategoryId: optionalText,
    programId: optionalText,
    eventId: optionalText,
    membershipPlanId: optionalText,
    preferredContact: z.enum(preferredContacts),
    comment: optionalText.pipe(z.string().max(2000).optional()),
    consentPersonalData: z.boolean().refine((value) => value === true, {
      message: "Нужно согласие на обработку данных",
    }),
    consentPrivacy: z.boolean().refine((value) => value === true, {
      message: "Нужно согласие с политикой конфиденциальности",
    }),
    source: optionalText,
    referrer: optionalText,
    utmSource: optionalText,
    utmMedium: optionalText,
    utmCampaign: optionalText,
  })
  .superRefine((data, ctx) => {
    if (data.ageCategoryId && !isUuid(data.ageCategoryId)) {
      ctx.addIssue({
        code: "custom",
        path: ["ageCategoryId"],
        message: "Некорректная категория",
      });
    }
    if (data.programId && !isUuid(data.programId)) {
      ctx.addIssue({
        code: "custom",
        path: ["programId"],
        message: "Некорректная программа",
      });
    }
    if (data.eventId && !isUuid(data.eventId)) {
      ctx.addIssue({
        code: "custom",
        path: ["eventId"],
        message: "Некорректное событие",
      });
    }
    if (data.membershipPlanId && !isUuid(data.membershipPlanId)) {
      ctx.addIssue({
        code: "custom",
        path: ["membershipPlanId"],
        message: "Некорректный тариф",
      });
    }
    if (data.type === "program" && !data.programId) {
      ctx.addIssue({
        code: "custom",
        path: ["programId"],
        message: "Выберите программу",
      });
    }
    if (data.type === "event" && !data.eventId) {
      ctx.addIssue({
        code: "custom",
        path: ["eventId"],
        message: "Выберите событие",
      });
    }
  });

export type ApplicationFormValues = z.input<typeof applicationFormSchema>;
export type ApplicationFormParsed = z.output<typeof applicationFormSchema>;

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export const MIN_FORM_FILL_MS = 3000;

export const APPLICATION_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 8,
} as const;
