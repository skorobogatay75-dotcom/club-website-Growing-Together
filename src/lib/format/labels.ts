import type {
  AudienceType,
  EnrollmentStatus,
  EventFormat,
  RegistrationStatus,
} from "@/types/database";

const AUDIENCE_LABELS: Record<AudienceType, string> = {
  children: "Для детей",
  parents: "Для родителей",
  family: "Для семьи",
  mixed: "Смешанный формат",
};

const FORMAT_LABELS: Record<EventFormat, string> = {
  workshop: "Мастер-класс",
  quiz: "Квиз",
  game: "Игра",
  meeting: "Встреча",
  other: "Формат клуба",
};

const ENROLLMENT_LABELS: Record<EnrollmentStatus, string> = {
  open: "Идёт набор",
  closed: "Набор закрыт",
  waitlist: "Лист ожидания",
  full: "Мест нет",
};

const REGISTRATION_LABELS: Record<RegistrationStatus, string> = {
  open: "Регистрация открыта",
  closed: "Регистрация закрыта",
  waitlist: "Лист ожидания",
  cancelled: "Отменено",
};

export function audienceLabel(value: AudienceType): string {
  return AUDIENCE_LABELS[value];
}

export function formatLabel(value: EventFormat): string {
  return FORMAT_LABELS[value];
}

export function enrollmentLabel(value: EnrollmentStatus): string {
  return ENROLLMENT_LABELS[value];
}

export function registrationLabel(value: RegistrationStatus): string {
  return REGISTRATION_LABELS[value];
}
