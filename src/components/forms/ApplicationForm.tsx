"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationFormSchema,
  applicationTypes,
  preferredContacts,
  type ApplicationFormParsed,
  type ApplicationFormValues,
  type ApplicationType,
} from "@/lib/validation/application";
import {
  submitApplication,
  type SubmitApplicationState,
} from "@/features/applications/actions";
import type { ApplicationFormOptions } from "@/features/applications/options";
import { formatEventDateTime } from "@/lib/format/datetime";

type Prefill = {
  type?: ApplicationType;
  programSlug?: string;
  eventSlug?: string;
  planSlug?: string;
};

type Props = {
  options: ApplicationFormOptions;
  prefill?: Prefill;
  variant?: "full" | "compact";
  source?: string;
};

const initialState: SubmitApplicationState | null = null;

export function ApplicationForm({
  options,
  prefill,
  variant = "full",
  source = "apply-page",
}: Props) {
  const [formStartedAt] = useState(() => String(Date.now()));
  const [state, formAction, pending] = useActionState(
    submitApplication,
    initialState,
  );

  const defaultProgramId = useMemo(() => {
    if (!prefill?.programSlug) return "";
    return options.programs.find((p) => p.slug === prefill.programSlug)?.id ?? "";
  }, [options.programs, prefill?.programSlug]);

  const defaultEventId = useMemo(() => {
    if (!prefill?.eventSlug) return "";
    return options.events.find((e) => e.slug === prefill.eventSlug)?.id ?? "";
  }, [options.events, prefill?.eventSlug]);

  const defaultPlanId = useMemo(() => {
    if (!prefill?.planSlug) return "";
    return options.plans.find((p) => p.slug === prefill.planSlug)?.id ?? "";
  }, [options.plans, prefill?.planSlug]);

  const inferredType: ApplicationType =
    prefill?.type ??
    (defaultEventId
      ? "event"
      : defaultProgramId
        ? "program"
        : defaultPlanId
          ? "membership"
          : "general");

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ApplicationFormValues, unknown, ApplicationFormParsed>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      type: inferredType,
      parentName: "",
      phone: "",
      email: "",
      childAgeText: "",
      ageCategoryId: "",
      programId: defaultProgramId,
      eventId: defaultEventId,
      membershipPlanId: defaultPlanId,
      preferredContact: "any",
      comment: "",
      consentPersonalData: false,
      consentPrivacy: false,
      source,
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
    },
    mode: "onBlur",
  });

  const type = watch("type");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const ref = document.referrer || "";
    setValue("referrer", ref.slice(0, 500));
    const params = new URLSearchParams(window.location.search);
    setValue("utmSource", params.get("utm_source") ?? undefined);
    setValue("utmMedium", params.get("utm_medium") ?? undefined);
    setValue("utmCampaign", params.get("utm_campaign") ?? undefined);
  }, [setValue]);

  if (state?.ok) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-border bg-surface px-5 py-6"
      >
        <h2 className="text-xl font-semibold text-foreground">Заявка отправлена</h2>
        <p className="mt-3 text-muted">{state.message}</p>
        <Link href="/" className="btn-secondary mt-6 inline-flex">
          На главную
        </Link>
      </div>
    );
  }

  const compact = variant === "compact";

  return (
    <form
      action={formAction}
      className="space-y-5"
      noValidate
      onSubmit={async (event) => {
        const valid = await trigger();
        if (!valid) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="formStartedAt" value={formStartedAt} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" {...register("referrer")} />
      <input type="hidden" {...register("utmSource")} />
      <input type="hidden" {...register("utmMedium")} />
      <input type="hidden" {...register("utmCampaign")} />

      {/* Honeypot */}
      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {!compact ? (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">
            Тип заявки
          </legend>
          <div className="flex flex-wrap gap-2">
            {applicationTypes.map((value) => (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center rounded-[var(--radius-button)] border px-3 text-sm ${
                  type === value
                    ? "border-accent bg-surface-soft"
                    : "border-border bg-background"
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  {...register("type")}
                />
                {typeLabel(value)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <input type="hidden" {...register("type")} />
      )}

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field
          label="Имя родителя / законного представителя"
          error={errors.parentName?.message || state?.fieldErrors?.parentName?.[0]}
          required
        >
          <input
            className="field-input"
            autoComplete="name"
            {...register("parentName")}
          />
        </Field>
        <Field
          label="Телефон"
          error={errors.phone?.message || state?.fieldErrors?.phone?.[0]}
          required
          hint="Можно вставить номер в любом международном формате"
        >
          <input
            className="field-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 …"
            {...register("phone")}
          />
        </Field>
      </div>

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field
          label="Email"
          error={errors.email?.message || state?.fieldErrors?.email?.[0]}
          hint="Необязательно"
        >
          <input
            className="field-input"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
        </Field>
        <Field
          label="Возраст ребёнка"
          error={errors.childAgeText?.message}
          hint="Без даты рождения, например «9 лет»"
        >
          <input className="field-input" {...register("childAgeText")} />
        </Field>
      </div>

      {!compact ? (
        <Field label="Возрастная категория" error={errors.ageCategoryId?.message}>
          <select className="field-input" {...register("ageCategoryId")}>
            <option value="">Не выбрано</option>
            {options.ageCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {(type === "program" || (!compact && type === "general")) &&
      options.programs.length > 0 ? (
        <Field
          label="Программа"
          error={errors.programId?.message || state?.fieldErrors?.programId?.[0]}
          required={type === "program"}
        >
          <select className="field-input" {...register("programId")}>
            <option value="">Не выбрано</option>
            {options.programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {(type === "event" || (!compact && type === "general")) &&
      options.events.length > 0 ? (
        <Field
          label="Событие"
          error={errors.eventId?.message || state?.fieldErrors?.eventId?.[0]}
          required={type === "event"}
        >
          <select className="field-input" {...register("eventId")}>
            <option value="">Не выбрано</option>
            {options.events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} · {formatEventDateTime(event.starts_at)}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {type === "membership" && options.plans.length > 0 ? (
        <Field label="Вариант членства" error={errors.membershipPlanId?.message}>
          <select className="field-input" {...register("membershipPlanId")}>
            <option value="">Пока не знаю / уточнить</option>
            {options.plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Предпочтительный способ связи">
        <select className="field-input" {...register("preferredContact")}>
          {preferredContacts.map((value) => (
            <option key={value} value={value}>
              {contactLabel(value)}
            </option>
          ))}
        </select>
      </Field>

      {!compact ? (
        <Field label="Комментарий" error={errors.comment?.message}>
          <textarea
            className="field-input min-h-28"
            rows={4}
            {...register("comment")}
          />
        </Field>
      ) : null}

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            {...register("consentPersonalData")}
          />
          <span>
            Согласен(на) на{" "}
            <Link
              href="/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              обработку персональных данных
            </Link>
            .
          </span>
        </label>
        {(errors.consentPersonalData ||
          state?.fieldErrors?.consentPersonalData) && (
          <p className="text-sm text-accent" role="alert">
            {errors.consentPersonalData?.message ||
              state?.fieldErrors?.consentPersonalData?.[0]}
          </p>
        )}

        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            {...register("consentPrivacy")}
          />
          <span>
            Согласен(на) с{" "}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Политикой конфиденциальности
            </Link>
            .
          </span>
        </label>
        {(errors.consentPrivacy || state?.fieldErrors?.consentPrivacy) && (
          <p className="text-sm text-accent" role="alert">
            {errors.consentPrivacy?.message ||
              state?.fieldErrors?.consentPrivacy?.[0]}
          </p>
        )}
      </div>

      <p className="text-sm text-muted">
        После отправки мы свяжемся с вами, чтобы уточнить детали. Заявка
        сохранится в системе клуба.
      </p>

      {state && !state.ok ? (
        <p className="rounded-[var(--radius-button)] bg-brand-powder/70 px-3 py-2 text-sm text-foreground" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Отправляем…" : "Отправить заявку"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {error ? (
        <span className="mt-1 block text-sm text-accent" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function typeLabel(value: ApplicationType): string {
  switch (value) {
    case "program":
      return "Программа";
    case "event":
      return "Событие";
    case "membership":
      return "Членство";
    default:
      return "Общая";
  }
}

function contactLabel(value: string): string {
  switch (value) {
    case "phone":
      return "Телефон";
    case "email":
      return "Email";
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    default:
      return "Любой удобный";
  }
}
