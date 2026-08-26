import { isPublicText } from "@/lib/content/public-text";
import type { AgeCategory, AudienceType, Event, EventFormat } from "@/types/database";

export type AgeCategoryRef = Pick<AgeCategory, "id" | "name" | "slug" | "color_token">;

export type CalendarEvent = Pick<
  Event,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "starts_at"
  | "ends_at"
  | "timezone"
  | "venue"
  | "price_text"
  | "capacity"
  | "registration_status"
  | "audience_type"
  | "format"
  | "age_category_id"
  | "age_text"
  | "status"
> & {
  age_categories: Pick<AgeCategory, "name" | "slug" | "color_token"> | null;
};

export type EventFilters = {
  age?: string;
  audience?: AudienceType | "";
  format?: EventFormat | "";
};

/** Возраст события: свой текст или старая категория. Без серверных зависимостей. */
export function eventAgeLabel(event: {
  age_text?: string | null;
  age_categories?: { name?: string | null } | null;
}): string | null {
  if (isPublicText(event.age_text)) return event.age_text.trim();
  const name = event.age_categories?.name;
  return isPublicText(name) ? name.trim() : null;
}
