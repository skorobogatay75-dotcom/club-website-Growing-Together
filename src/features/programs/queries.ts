import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AgeCategory,
  AudienceType,
  EnrollmentStatus,
  Event,
  EventFormat,
  Program,
} from "@/types/database";

export type ProgramCard = Program & {
  age_categories: Pick<AgeCategory, "name" | "slug" | "color_token"> | null;
};

function normalizeAgeCategory(
  value:
    | Pick<AgeCategory, "name" | "slug" | "color_token">
    | Pick<AgeCategory, "name" | "slug" | "color_token">[]
    | null
    | undefined,
) {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export type ProgramFilters = {
  q?: string;
  age?: string;
  audience?: AudienceType;
  enrollment?: EnrollmentStatus;
};

export async function listPublishedPrograms(
  filters: ProgramFilters = {},
): Promise<ProgramCard[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("programs")
    .select(
      "id, title, slug, excerpt, content_json, cover_path, age_category_id, audience_type, format, duration_text, price_text, enrollment_status, featured, sort_order, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at, age_categories ( name, slug, color_token )",
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });

  if (filters.audience) query = query.eq("audience_type", filters.audience);
  if (filters.enrollment) {
    query = query.eq("enrollment_status", filters.enrollment);
  }
  if (filters.q) {
    const safeQ = filters.q.replace(/[%_,]/g, " ").trim();
    if (safeQ) {
      query = query.or(`title.ilike.%${safeQ}%,excerpt.ilike.%${safeQ}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error("listPublishedPrograms failed");
    return [];
  }

  let rows = ((data ?? []) as Array<Program & { age_categories?: unknown }>).map(
    (row) =>
      ({
        ...row,
        age_categories: normalizeAgeCategory(
          row.age_categories as
            | Pick<AgeCategory, "name" | "slug" | "color_token">
            | Pick<AgeCategory, "name" | "slug" | "color_token">[]
            | null,
        ),
      }) as ProgramCard,
  );

  if (filters.age) {
    rows = rows.filter((row) => row.age_categories?.slug === filters.age);
  }

  return rows;
}

export async function getRelatedPrograms(
  program: Program,
  limit = 3,
): Promise<ProgramCard[]> {
  const all = await listPublishedPrograms({
    audience: program.audience_type,
  });
  return all.filter((item) => item.id !== program.id).slice(0, limit);
}

export async function getProgramRelatedEvents(
  programId: string,
  limit = 5,
): Promise<Event[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select(
      "id, program_id, title, slug, excerpt, content_json, cover_path, age_category_id, audience_type, format, starts_at, ends_at, timezone, venue, price_text, capacity, registration_status, featured, status, seo_title, seo_description, published_at, created_by, updated_by, created_at, updated_at",
    )
    .eq("status", "published")
    .eq("program_id", programId)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getProgramRelatedEvents failed");
    return [];
  }

  return (data ?? []) as Event[];
}

export type { EventFormat };
